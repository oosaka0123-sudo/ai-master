import { startMonitor } from './monitor.mjs';

const { getAllStatuses } = await import('./server.mjs');

const intervalMinutes = Math.max(5, Number(process.env.MONITOR_INTERVAL_MINUTES || 15));
const stalledMinutes = Math.max(intervalMinutes, Number(process.env.STALLED_MINUTES || 45));
const userIds = (process.env.LINE_ALLOWED_USER_IDS || '').split(',').map(v => v.trim()).filter(Boolean);
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

startMonitor({
  getStatuses: getAllStatuses,
  channelAccessToken,
  userIds,
  stalledMinutes,
  intervalMinutes
});
