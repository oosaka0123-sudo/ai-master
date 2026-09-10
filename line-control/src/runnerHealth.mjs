import {
  metadataAccessToken,
  DEFAULT_CONTROL_PROJECT,
  DEFAULT_CONTROL_REGION,
  DEFAULT_CONTROL_JOB
} from './commands.mjs';

export function selectRecentRunnerFailures(executions, { windowMinutes = 15, now = Date.now() } = {}) {
  const windowMs = windowMinutes * 60_000;
  return (executions || []).filter(execution => {
    const completed = (execution.conditions || []).find(condition => condition.type === 'Completed');
    if (completed?.state !== 'CONDITION_FAILED' || !execution.completionTime) return false;
    const completedAt = new Date(execution.completionTime).getTime();
    return Number.isFinite(completedAt) && now - completedAt >= 0 && now - completedAt < windowMs;
  }).slice(0, 5).map(execution => {
    const completed = execution.conditions.find(condition => condition.type === 'Completed');
    return {
      name: execution.name?.split('/').pop() || 'unknown',
      completionTime: execution.completionTime,
      reason: completed?.executionReason || completed?.reason || 'EXECUTION_FAILED',
      message: completed?.message || 'Central runner failed'
    };
  });
}

export async function getRecentRunnerFailures(options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const project = options.project || DEFAULT_CONTROL_PROJECT;
  const region = options.region || DEFAULT_CONTROL_REGION;
  const job = options.job || DEFAULT_CONTROL_JOB;
  const accessToken = await metadataAccessToken(fetchFn);
  const url = `https://run.googleapis.com/v2/projects/${project}/locations/${region}/jobs/${job}/executions?pageSize=20`;
  const response = await fetchFn(url, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Cloud Run executions ${response.status}`);
  const data = await response.json();
  return selectRecentRunnerFailures(data.executions, {
    windowMinutes: options.windowMinutes,
    now: options.now
  });
}

export function buildRunnerFailureText(failures) {
  const lines = ['🚨 AI PROJECT CONTROL', '🔴 中央Orchestratorの実行が停止しました'];
  for (const failure of failures) lines.push(`・${failure.name}: ${failure.reason}`);
  lines.push('各Projectの状態はLINEで「管制盤」と送ると確認できます。');
  return lines.join('\n');
}
