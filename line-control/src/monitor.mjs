export function selectAlerts(data, { stalledMinutes = 45, intervalMinutes = 15, now = Date.now() } = {}) {
  const windowMs = (intervalMinutes + 2) * 60_000;
  const alerts = [];

  for (const project of data.repositories || []) {
    if (project.signal === 'yellow' && Number.isFinite(project.ageMinutes)) {
      if (project.ageMinutes >= stalledMinutes && project.ageMinutes < stalledMinutes + intervalMinutes + 2) {
        alerts.push({ type: 'stalled', project });
      }
      continue;
    }

    if (project.signal === 'red' && project.reason === 'ci_failed' && project.latestRun?.updatedAt) {
      const updated = new Date(project.latestRun.updatedAt).getTime();
      if (Number.isFinite(updated) && now - updated >= 0 && now - updated <= windowMs) {
        alerts.push({ type: 'ci_failed', project });
      }
      continue;
    }

    if (project.signal === 'blue' && project.lastActivity) {
      const updated = new Date(project.lastActivity).getTime();
      if (Number.isFinite(updated) && now - updated >= 0 && now - updated <= windowMs) {
        alerts.push({ type: 'human_wait', project });
      }
    }
  }

  return alerts;
}

export function buildAlertText(alerts) {
  const lines = ['🚨 AI PROJECT CONTROL'];
  for (const alert of alerts.slice(0, 20)) {
    const icon = alert.type === 'ci_failed' ? '🔴' : alert.type === 'human_wait' ? '🔵' : '🟡';
    const label = alert.type === 'ci_failed' ? 'CI失敗' : alert.type === 'human_wait' ? 'あなた待ち' : '停滞';
    const age = alert.project.ageMinutes == null ? '' : ` / 最終活動 ${alert.project.ageMinutes}分前`;
    lines.push(`${icon} ${alert.project.name}: ${label}${age}`);
  }
  lines.push('LINEで「管制盤」と送ると詳細と操作ボタンを表示します。');
  return lines.join('\n');
}

async function pushText(channelAccessToken, userId, text) {
  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${channelAccessToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ to: userId, messages: [{ type: 'text', text }] })
  });
  if (!response.ok) throw new Error(`LINE push failed: ${response.status}`);
}

export function startMonitor({ getStatuses, channelAccessToken, userIds, stalledMinutes = 45, intervalMinutes = 15, logger = console }) {
  if (!channelAccessToken || !userIds?.length) {
    logger.warn('LINE monitor disabled: token or allowed user IDs are not configured');
    return () => {};
  }

  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const data = await getStatuses();
      const alerts = selectAlerts(data, { stalledMinutes, intervalMinutes });
      if (!alerts.length) return;
      const text = buildAlertText(alerts);
      for (const userId of userIds) await pushText(channelAccessToken, userId, text);
    } catch (error) {
      logger.error('LINE monitor tick failed', error);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(tick, intervalMinutes * 60_000);
  timer.unref?.();
  tick();
  return () => clearInterval(timer);
}
