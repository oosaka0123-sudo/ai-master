import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRecentRunnerFailures, buildRunnerFailureText } from '../src/runnerHealth.mjs';

const now = new Date('2026-09-10T04:00:00Z').getTime();

function execution(name, state, minutesAgo, reason = 'NON_ZERO_EXIT_CODE') {
  return {
    name: `projects/p/locations/r/jobs/j/executions/${name}`,
    completionTime: new Date(now - minutesAgo * 60_000).toISOString(),
    conditions: [{ type: 'Completed', state, executionReason: reason, message: 'failed' }]
  };
}

test('selects only recent failed runner executions', () => {
  const failures = selectRecentRunnerFailures([
    execution('recent', 'CONDITION_FAILED', 4),
    execution('old', 'CONDITION_FAILED', 20),
    execution('ok', 'CONDITION_SUCCEEDED', 2)
  ], { windowMinutes: 15, now });
  assert.equal(failures.length, 1);
  assert.equal(failures[0].name, 'recent');
  assert.equal(failures[0].reason, 'NON_ZERO_EXIT_CODE');
});

test('builds a LINE runner failure notice', () => {
  const text = buildRunnerFailureText([{ name: 'run-1', reason: 'NON_ZERO_EXIT_CODE' }]);
  assert.match(text, /中央Orchestrator/);
  assert.match(text, /run-1/);
});
