import http from 'node:http';
import crypto from 'node:crypto';
import { buildDashboardMessages, isDashboardRequest } from './flex.mjs';
import { runControlJob, DEFAULT_CONTROL_PROJECT, DEFAULT_CONTROL_REGION, DEFAULT_CONTROL_JOB } from './commands.mjs';

const port = Number(process.env.PORT || 8787);
const githubToken = process.env.CONTROL_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const githubApiMode = process.env.GITHUB_API_MODE || 'user';
const ownerFilter = process.env.GITHUB_OWNER || '';
const stalledMinutes = Number(process.env.STALLED_MINUTES || 45);
const lineChannelSecret = process.env.LINE_CHANNEL_SECRET || '';
const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const allowedLineUserIds = new Set((process.env.LINE_ALLOWED_USER_IDS || '').split(',').map(v => v.trim()).filter(Boolean));
const controlProject = process.env.CONTROL_JOB_PROJECT || DEFAULT_CONTROL_PROJECT;
const controlRegion = process.env.CONTROL_JOB_REGION || DEFAULT_CONTROL_REGION;
const controlJob = process.env.CONTROL_JOB_NAME || DEFAULT_CONTROL_JOB;

const HUMAN_MARKERS = ['needs-approval', 'human-required', 'waiting-user', 'blocked-human', 'needs-user'];
const BAD_CONCLUSIONS = new Set(['failure', 'cancelled', 'timed_out', 'startup_failure']);

function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(value));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function ghHeaders() {
  if (!githubToken) throw new Error('CONTROL_GITHUB_TOKEN is not configured');
  return {
    authorization: `Bearer ${githubToken}`,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'ai-master-line-control'
  };
}

async function gh(url, options = {}) {
  const response = await fetch(`https://api.github.com${url}`, {
    ...options,
    headers: { ...ghHeaders(), ...(options.headers || {}) }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub ${response.status}: ${text.slice(0, 300)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function listRepositories() {
  const repos = [];
  let page = 1;
  while (true) {
    const data = githubApiMode === 'installation'
      ? await gh(`/installation/repositories?per_page=100&page=${page}`)
      : await gh(`/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`);
    const batch = githubApiMode === 'installation' ? (data.repositories || []) : data;
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }
  return repos.filter(repo => !repo.archived && (!ownerFilter || repo.owner?.login === ownerFilter));
}

function newestTime(values) {
  const times = values.filter(Boolean).map(v => new Date(v).getTime()).filter(Number.isFinite);
  return times.length ? new Date(Math.max(...times)).toISOString() : null;
}

function labelNames(item) {
  return (item?.labels || []).map(label => typeof label === 'string' ? label : label.name).filter(Boolean);
}

export function classifyProject({ repo, latestCommit, latestRun, openIssues, openPrs, now = Date.now(), thresholdMinutes = stalledMinutes }) {
  const humanWait = [...openIssues, ...openPrs].some(item => labelNames(item).some(label => HUMAN_MARKERS.includes(String(label).toLowerCase())));
  const actionRequired = latestRun?.conclusion === 'action_required';
  const lastActivity = newestTime([
    repo?.pushed_at,
    latestCommit?.commit?.committer?.date,
    latestRun?.updated_at,
    ...openIssues.map(i => i.updated_at),
    ...openPrs.map(i => i.updated_at)
  ]);
  const ageMinutes = lastActivity ? Math.floor((now - new Date(lastActivity).getTime()) / 60000) : null;
  const hasOpenWork = openIssues.length > 0 || openPrs.length > 0 || ['queued', 'in_progress', 'waiting', 'requested', 'pending'].includes(latestRun?.status);

  if (humanWait || actionRequired) return { signal: 'blue', reason: actionRequired ? 'action_required' : 'human_wait', lastActivity, ageMinutes, hasOpenWork };
  if (latestRun && BAD_CONCLUSIONS.has(latestRun.conclusion)) return { signal: 'red', reason: 'ci_failed', lastActivity, ageMinutes, hasOpenWork };
  if (hasOpenWork && ageMinutes !== null && ageMinutes >= thresholdMinutes) return { signal: 'yellow', reason: 'stalled', lastActivity, ageMinutes, hasOpenWork };
  return { signal: 'green', reason: 'normal', lastActivity, ageMinutes, hasOpenWork };
}

export async function getRepoStatus(repo) {
  const fullName = repo.full_name;
  const [commits, runs, issues, pulls] = await Promise.all([
    gh(`/repos/${fullName}/commits?per_page=1`).catch(() => []),
    gh(`/repos/${fullName}/actions/runs?per_page=1`).catch(() => ({ workflow_runs: [] })),
    gh(`/repos/${fullName}/issues?state=open&per_page=30`).catch(() => []),
    gh(`/repos/${fullName}/pulls?state=open&per_page=30`).catch(() => [])
  ]);
  const pureIssues = issues.filter(i => !i.pull_request);
  const latestCommit = commits[0] || null;
  const latestRun = runs.workflow_runs?.[0] || null;
  return {
    name: repo.name,
    fullName,
    private: Boolean(repo.private),
    defaultBranch: repo.default_branch,
    openIssues: pureIssues.length,
    openPrs: pulls.length,
    latestRun: latestRun ? { id: latestRun.id, status: latestRun.status, conclusion: latestRun.conclusion, updatedAt: latestRun.updated_at } : null,
    ...classifyProject({ repo, latestCommit, latestRun, openIssues: pureIssues, openPrs: pulls })
  };
}

export async function getAllStatuses() {
  const repos = await listRepositories();
  const results = [];
  for (let i = 0; i < repos.length; i += 5) {
    const batch = repos.slice(i, i + 5);
    results.push(...await Promise.all(batch.map(repo => getRepoStatus(repo).catch(error => ({
      name: repo.name,
      fullName: repo.full_name,
      private: Boolean(repo.private),
      signal: 'red',
      reason: 'status_error',
      error: error.message
    })))));
  }
  const order = { red: 0, blue: 1, yellow: 2, green: 3 };
  results.sort((a, b) => (order[a.signal] ?? 9) - (order[b.signal] ?? 9) || a.name.localeCompare(b.name));
  return {
    generatedAt: new Date().toISOString(),
    counts: results.reduce((acc, item) => {
      acc[item.signal] = (acc[item.signal] || 0) + 1;
      return acc;
    }, {}),
    repositories: results
  };
}

async function dispatchCommand(fullName, command) {
  return runControlJob(fullName, command, {
    project: controlProject,
    region: controlRegion,
    job: controlJob
  });
}

async function retryFailed(fullName) {
  const runs = await gh(`/repos/${fullName}/actions/runs?per_page=10`);
  const failed = (runs.workflow_runs || []).find(run => BAD_CONCLUSIONS.has(run.conclusion));
  if (!failed) return { ok: false, repository: fullName, message: '失敗Workflowが見つかりません' };
  await gh(`/repos/${fullName}/actions/runs/${failed.id}/rerun-failed-jobs`, { method: 'POST' });
  return { ok: true, repository: fullName, command: 'retry_failed', runId: failed.id };
}

export async function executeCommand({ repository, command }) {
  if (!repository || !command) throw new Error('repository and command are required');
  const repo = (await listRepositories()).find(item => item.full_name === repository);
  if (!repo) throw new Error('repository is not currently accessible');
  if (command === 'retry_failed') return retryFailed(repository);
  if (!['continue', 'resume'].includes(command)) throw new Error('unsupported command');
  return dispatchCommand(repository, command);
}

async function executeBulk(command) {
  const data = await getAllStatuses();
  const targets = command === 'continue_stalled'
    ? data.repositories.filter(item => item.signal === 'yellow')
    : data.repositories.filter(item => item.signal === 'red' && item.reason === 'ci_failed');
  const results = [];
  for (const target of targets) {
    try {
      results.push(command === 'continue_stalled' ? await dispatchCommand(target.fullName, 'continue') : await retryFailed(target.fullName));
    } catch (error) {
      results.push({ ok: false, repository: target.fullName, message: error.message });
    }
  }
  return { total: targets.length, succeeded: results.filter(r => r.ok).length, failed: results.filter(r => !r.ok).length };
}

function verifyLineSignature(rawBody, signature) {
  if (!lineChannelSecret) return false;
  const expected = crypto.createHmac('sha256', lineChannelSecret).update(rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function lineUserAllowed(userId) {
  return Boolean(userId && allowedLineUserIds.size > 0 && allowedLineUserIds.has(userId));
}

async function replyLine(replyToken, messages) {
  if (!lineChannelAccessToken) throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { authorization: `Bearer ${lineChannelAccessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ replyToken, messages: messages.slice(0, 5) })
  });
  if (!response.ok) throw new Error(`LINE reply failed: ${response.status}`);
}

async function handleLineWebhook(raw) {
  const payload = JSON.parse(raw.toString('utf8'));
  for (const event of payload.events || []) {
    if (!lineUserAllowed(event.source?.userId) || !event.replyToken) continue;

    if (isDashboardRequest(event)) {
      await replyLine(event.replyToken, buildDashboardMessages(await getAllStatuses()));
      continue;
    }

    if (event.type !== 'postback') continue;
    const params = new URLSearchParams(event.postback?.data || '');
    const command = params.get('command');
    const repository = params.get('repository');

    try {
      if (['continue_stalled', 'retry_failed_all'].includes(command)) {
        const result = await executeBulk(command);
        await replyLine(event.replyToken, [{ type: 'text', text: `✅ 一括処理: 対象${result.total} / 成功${result.succeeded} / 失敗${result.failed}\n「管制盤」と送ると最新状態を表示します。` }]);
      } else {
        const result = await executeCommand({ repository, command });
        const text = result.ok
          ? `✅ ${repository}: ${command} を中央ジョブへ投入しました\nClaude実装をCloud Run Jobで開始します。`
          : `⚠️ ${repository}: ${result.message}`;
        await replyLine(event.replyToken, [{ type: 'text', text }]);
      }
    } catch (error) {
      await replyLine(event.replyToken, [{ type: 'text', text: `❌ ${repository || '一括処理'}: ${error.message}` }]);
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true });
    if (req.method === 'POST' && url.pathname === '/webhook/line') {
      const raw = await readBody(req);
      if (!verifyLineSignature(raw, req.headers['x-line-signature'])) return json(res, 401, { ok: false, error: 'invalid LINE signature' });
      await handleLineWebhook(raw);
      return json(res, 200, { ok: true });
    }
    return json(res, 404, { ok: false, error: 'not found' });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => console.log(`LINE project control listening on :${port}`));
}

export { server, executeBulk, verifyLineSignature };