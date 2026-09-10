import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrchestratorDispatch, DEFAULT_ORCHESTRATOR_REPOSITORY } from '../src/commands.mjs';

test('routes continue through the central orchestrator repository', () => {
  const out = buildOrchestratorDispatch('oosaka0123-sudo/demo', 'continue');
  assert.equal(out.path, `/repos/${DEFAULT_ORCHESTRATOR_REPOSITORY}/dispatches`);
  assert.equal(out.body.event_type, 'line-control');
  assert.equal(out.body.client_payload.repository, 'oosaka0123-sudo/demo');
  assert.equal(out.body.client_payload.command, 'continue');
});

test('supports configured orchestrator repository', () => {
  const out = buildOrchestratorDispatch('oosaka0123-sudo/demo', 'resume', 'oosaka0123-sudo/custom-orchestrator');
  assert.equal(out.path, '/repos/oosaka0123-sudo/custom-orchestrator/dispatches');
  assert.equal(out.body.client_payload.command, 'resume');
});

test('rejects malformed repositories and unsupported commands', () => {
  assert.throws(() => buildOrchestratorDispatch('../demo', 'continue'));
  assert.throws(() => buildOrchestratorDispatch('oosaka0123-sudo/demo', 'deploy'));
  assert.throws(() => buildOrchestratorDispatch('oosaka0123-sudo/demo', 'continue', '../bad'));
});
