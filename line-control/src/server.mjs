import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const port = Number(process.env.PORT || 8787);
const githubToken = process.env.CONTROL_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
const githubApiMode = process.env.GITHUB_API_MODE || 'user';
const ownerFilter = process.env.GITHUB_OWNER || '';
const stalledMinutes = Number(process.env.STALLED_MINUTES || 45);
const lineChannelSecret = process.env.LINE_CHANNEL_SECRET || '';
const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const publicBaseUrl = process.env.PUBLIC_BASE_URL || '';

const HUMAN_MARKERS = ['needs-approval', 'human-required', 'waiting-user', 'blocked-human', 'needs-user'];
const BAD_CONCLUSIONS = new Set(['failure', 'cancelled', 'timed_out', 'startup_failure']);

function json(res, status, value) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
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
    throw new Error(`GitHub ${response.status}: ${text.slice(0, 400)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function listRepositories() {
  const repos = [];
  if (githubApiMode === 'installation') {
    let page = 1;
    while (true) {
      const data = await gh(`/installation/repositories?per_page=100&page=${page}`);
      const batch = data.repositories || [];
      repos.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    }
  } else {
    let page = 1;
    while (true) {
      const batch = await gh(`/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`);
      repos.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    }
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

  let signal = 'green';
  let reason = 'normal';
  if (humanWait || actionRequired) {
    signal = 'blue';
    reason = actionRequired ? 'action_required' : 'human_wait';
  } else if (latestRun && BAD_CONCLUSIONS.has(latestRun.conclusion)) {
    signal = 'red';
    reason = 'ci_failed';
  } else if (hasOpenWork && ageMinutes !== null && ageMinutes >= thresholdMinutes) {
    signal = 'yellow';
    reason = 'stalled';
  }

  return { signal, reason, lastActivity, ageMinutes, hasOpenWork };
}

async function getRepoStatus(repo) {
  const encoded = `${repo.owner.login}/${repo.name}`;
  const [commits, runs, issues, pulls] = await Promise.all([
    gh(`/repos/${encoded}/commits?per_page=1`).catch(() => []),
    gh(`/repos/${encoded}/actions/runs?per_page=1`).catch(() => ({ workflow_runs: [] })),
    gh(`/repos/${encoded}/issues?state=open&per_page=30`).catch(() => []),
    gh(`/repos/${encoded}/pulls?state=open&per_page=30`).catch(() => [])
  ]);

  const openPrNumbers = new Set(pulls.map(p => p.number));
  const pureIssues = issues.filter(i => !i.pull_request && !openPrNumbers.has(i.number));
  const latestCommit = commits[0] || null;
  const latestRun = runs.workflow_runs?.[0] || null;
  const state = classifyProject({ repo, latestCommit, latestRun, openIssues: pureIssues, openPrs: pulls });

  return {
    name: repo.name,
    fullName: repo.full_name,
    private: Boolean(repo.private),
    htmlUrl: repo.html_url,
    defaultBranch: repo.default_branch,
    openIssues: pureIssues.length,
    openPrs: pulls.length,
    latestRun: latestRun ? {
      id: latestRun.id,
      name: latestRun.name,
      status: latestRun.status,
      conclusion: latestRun.conclusion,
      htmlUrl: latestRun.html_url,
      updatedAt: latestRun.updated_at
    } : null,
    ...state
  };
}

async function getAllStatuses() {
  const repos = await listRepositories();
  const results = [];
  const concurrency = 5;
  for (let i = 0; i < repos.length; i += concurrency) {
    const batch = repos.slice(i, i + concurrency);
    results.push(...await Promise.all(batch.map(repo => getRepoStatus(repo).catch(error => ({
      name: repo.name,
      fullName: repo.full_name,
      private: Boolean(repo.private),
      htmlUrl: repo.html_url,
      signal: 'red',
      reason: 'status_error',
      error: error.message
    })))));
  }
  const order = { red: 0, blue: 1, yellow: 2, green: 3 };
  results.sort((a, b) => (order[a.signal] ?? 9) - (order[b.signal] ?? 9) || a.name.localeCompare(b.name));
  return {
    generatedAt: new Date().toISOString(),
    counts: results.reduce((acc, item) => ({ ...acc, [item.signal]: (acc[item.signal] || 0) + 1 }), {}),
    repositories: results
  };
}

async function dispatchCommand(fullName, command) {
  if (!['continue', 'resume'].includes(command)) throw new Error('unsupported dispatch command');
  await gh(`/repos/${fullName}/dispatches`, {
    method: 'POST',
    body: JSON.stringify({
      event_type: 'ai-control',
      client_payload: { command, source: 'line-control', requested_at: new Date().toISOString() }
    })
  });
  return { ok: true, command, repository: fullName };
}

async function retryFailed(fullName) {
  const runs = await gh(`/repos/${fullName}/actions/runs?per_page=10`);
  const failed = (runs.workflow_runs || []).find(run => BAD_CONCLUSIONS.has(run.conclusion));
  if (!failed) return { ok: false, message: 'No failed workflow run found' };
  await gh(`/repos/${fullName}/actions/runs/${failed.id}/rerun-failed-jobs`, { method: 'POST' });
  return { ok: true, command: 'retry_failed', repository: fullName, runId: failed.id };
}

async function executeCommand(body) {
  const { repository, command } = body || {};
  if (!repository || !command) throw new Error('repository and command are required');
  const allowed = (await listRepositories()).some(repo => repo.full_name === repository);
  if (!allowed) throw new Error('repository is not in the current accessible repository set');
  if (command === 'status') return getRepoStatus((await listRepositories()).find(repo => repo.full_name === repository));
  if (command === 'retry_failed') return retryFailed(repository);
  return dispatchCommand(repository, command);
}

function verifyLineSignature(rawBody, signature) {
  if (!lineChannelSecret) return false;
  const expected = crypto.createHmac('sha256', lineChannelSecret).update(rawBody).digest('base64');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function replyLine(replyToken, messages) {
  if (!lineChannelAccessToken) return;
  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${lineChannelAccessToken}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ replyToken, messages })
  });
  if (!response.ok) throw new Error(`LINE reply failed: ${response.status}`);
}

async function handleLineWebhook(raw) {
  const payload = JSON.parse(raw.toString('utf8'));
  for (const event of payload.events || []) {
    if (event.type !== 'postback') continue;
    const params = new URLSearchParams(event.postback?.data || '');
    const repository = params.get('repository');
    const command = params.get('command');
    let text;
    try {
      const result = await executeCommand({ repository, command });
      text = result.ok === false ? `⚠️ ${repository}: ${result.message}` : `✅ ${repository}: ${command} を受け付けました`;
    } catch (error) {
      text = `❌ ${repository || 'project'}: ${error.message}`;
    }
    if (event.replyToken) await replyLine(event.replyToken, [{ type: 'text', text }]);
  }
}

async function serveStatic(req, res) {
  const target = req.url === '/' ? 'index.html' : req.url.replace(/^\//, '');
  const safe = path.normalize(target).replace(/^\.\.(\/|\\|$)/, '');
  const file = path.join(publicDir, safe);
  try {
    const data = await fs.readFile(file);
    const ext = path.extname(file);
    const type = ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'text/javascript; charset=utf-8' : 'application/octet-stream';
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, publicBaseUrl || `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true });
    if (req.method === 'GET' && url.pathname === '/api/status') return json(res, 200, await getAllStatuses());
    if (req.method === 'POST' && url.pathname === '/api/command') {
      const raw = await readBody(req);
      return json(res, 200, await executeCommand(JSON.parse(raw.toString('utf8'))));
    }
    if (req.method === 'POST' && url.pathname === '/webhook/line') {
      const raw = await readBody(req);
      if (!verifyLineSignature(raw, req.headers['x-line-signature'])) return json(res, 401, { ok: false, error: 'invalid LINE signature' });
      await handleLineWebhook(raw);
      return json(res, 200, { ok: true });
    }
    return serveStatic(req, res);
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => console.log(`LINE project control listening on :${port}`));
}

export { executeCommand, getAllStatuses, getRepoStatus, server };
