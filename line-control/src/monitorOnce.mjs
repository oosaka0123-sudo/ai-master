process.env.NODE_ENV = 'test';

const { getAllStatuses } = await import('./server.mjs');
const { selectAlerts, pushMessages } = await import('./monitor.mjs');
const { buildAlertMessages, buildRunnerFailureMessages } = await import('./flex.mjs');
const { getRecentRunnerFailures } = await import('./runnerHealth.mjs');

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
const runnerFailures = await getRecentRunnerFailures({ windowMinutes: intervalMinutes }).catch(error => {
  console.error(`runner health check failed: ${error.message}`);
  return [];
});

if (alerts.length) {
  const messages = buildAlertMessages(alerts);
  for (const userId of userIds) await pushMessages(channelId, channelSecret, userId, messages);
}
if (runnerFailures.length) {
  const messages = buildRunnerFailureMessages(runnerFailures);
  for (const userId of userIds) await pushMessages(channelId, channelSecret, userId, messages);
}

console.log(JSON.stringify({
  ok: true,
  repositories: data.repositories?.length || 0,
  alerts: alerts.length,
  runnerFailures: runnerFailures.length
}));
