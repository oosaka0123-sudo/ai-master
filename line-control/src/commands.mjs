export const DEFAULT_CONTROL_PROJECT = 'rss7-ai-orchestrator';
export const DEFAULT_CONTROL_REGION = 'asia-northeast1';
export const DEFAULT_CONTROL_JOB = 'rss7-ai-control-runner';

const SEGMENT = /^[A-Za-z0-9_.-]+$/;

function validRepository(value) {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split('/');
  return parts.length === 2
    && parts.every(part => SEGMENT.test(part) && part !== '.' && part !== '..');
}

function validControlSegment(value) {
  return Boolean(value && typeof value === 'string' && SEGMENT.test(value) && value !== '.' && value !== '..');
}

export function buildRunJobRequest(repository, command, options = {}) {
  if (!validRepository(repository)) throw new Error('invalid target repository');
  if (!['continue', 'resume'].includes(command)) throw new Error('unsupported command');

  const project = options.project || DEFAULT_CONTROL_PROJECT;
  const region = options.region || DEFAULT_CONTROL_REGION;
  const job = options.job || DEFAULT_CONTROL_JOB;
  if (![project, region, job].every(validControlSegment)) throw new Error('invalid Cloud Run Job target');

  return {
    url: `https://run.googleapis.com/v2/projects/${project}/locations/${region}/jobs/${job}:run`,
    body: {
      overrides: {        containerOverrides: [{
          env: [
            { name: 'CONTROL_REPOSITORY', value: repository },
            { name: 'CONTROL_COMMAND', value: command }
          ]
        }],
        taskCount: 1,
        timeout: '1200s'
      }
    }
  };
}

async function metadataAccessToken(fetchFn) {
  const response = await fetchFn('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
    headers: { 'Metadata-Flavor': 'Google' }
  });
  if (!response.ok) throw new Error(`metadata token failed: ${response.status}`);
  const data = await response.json();
  if (!data.access_token) throw new Error('metadata access token missing');
  return data.access_token;
}

export async function runControlJob(repository, command, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const request = buildRunJobRequest(repository, command, options);
  const accessToken = await metadataAccessToken(fetchFn);
  const response = await fetchFn(request.url, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },    body: JSON.stringify(request.body)
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Cloud Run Job ${response.status}: ${text.slice(0, 300)}`);
  const operation = text ? JSON.parse(text) : {};
  return {
    ok: true,
    queued: true,
    repository,
    command,
    executionOperation: operation.name || null
  };
}
