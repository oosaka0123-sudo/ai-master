import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRunJobRequest,
  DEFAULT_CONTROL_JOB,
  DEFAULT_CONTROL_PROJECT,
  DEFAULT_CONTROL_REGION,
  runControlJob
} from '../src/commands.mjs';

test('routes continue through the central Cloud Run Job', () => {
  const out = buildRunJobRequest('oosaka0123-sudo/demo', 'continue');
  assert.equal(out.url, `https://run.googleapis.com/v2/projects/${DEFAULT_CONTROL_PROJECT}/locations/${DEFAULT_CONTROL_REGION}/jobs/${DEFAULT_CONTROL_JOB}:run`);
  const env = out.body.overrides.containerOverrides[0].env;
  assert.deepEqual(env, [
    { name: 'CONTROL_REPOSITORY', value: 'oosaka0123-sudo/demo' },
    { name: 'CONTROL_COMMAND', value: 'continue' }
  ]);
  assert.equal(out.body.overrides.timeout, '1200s');
});

test('supports configured Cloud Run Job target', () => {
  const out = buildRunJobRequest('oosaka0123-sudo/demo', 'resume', {
    project: 'custom-project', region: 'us-central1', job: 'custom-runner'
  });
  assert.equal(out.url, 'https://run.googleapis.com/v2/projects/custom-project/locations/us-central1/jobs/custom-runner:run');
});

test('rejects malformed repositories and unsupported commands', () => {
  assert.throws(() => buildRunJobRequest('../demo', 'continue'));
  assert.throws(() => buildRunJobRequest('oosaka0123-sudo/demo', 'deploy'));
  assert.throws(() => buildRunJobRequest('oosaka0123-sudo/demo', 'continue', { job: '../bad' }));
});

test('uses metadata identity then starts the job', async () => {
  const calls = [];
  const fakeFetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).startsWith('http://metadata.google.internal/')) {
      return new Response(JSON.stringify({ access_token: 'test-token' }), { status: 200 });
    }
    return new Response(JSON.stringify({ name: 'operations/test-op' }), { status: 200 });
  };
  const result = await runControlJob('oosaka0123-sudo/demo', 'continue', { fetchFn: fakeFetch });
  assert.equal(result.queued, true);
  assert.equal(result.executionOperation, 'operations/test-op');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.headers.authorization, 'Bearer test-token');
});
