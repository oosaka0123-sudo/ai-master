process.env.NODE_ENV = 'test';

const { getAllStatuses } = await import('./server.mjs');
const { selectAlerts, buildAlertText, pushText } = await import('./monitor.mjs');

const channelId = process.env.LINE_CHANNEL_ID || '';
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
const userIds = (process.env.LINE_ALLOWED_USER_IDS || '').split(',').map(v => v.trim()).filter(Boolean);
const stalledMinutes = Math.max(5, Number(process.env.STALLED_MINUTES || 45));
const intervalMinutes = Math.max(5, Number(process.env.MONITOR_INTERVAL_MINUTES || 15));

if (!channelId || !channelSecret || !userIds.length) {
  throw new Error('LINE monitor credentials or recipients are not configured');
}

const data = await getAllStatuses();
const alerts = selectAlerts(data, { stalledMinutes, intervalMinutes });

if (alerts.length) {
  const text = buildAlertText(alerts);
  for (const userId of userIds) await pushText(channelId, channelSecret, userId, text);
}

console.log(JSON.stringify({ ok: true, repositories: data.repositories?.length || 0, alerts: alerts.length }));
