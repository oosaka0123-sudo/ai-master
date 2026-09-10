import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAlerts, buildAlertText } from '../src/monitor.mjs';

const now = new Date('2026-09-10T00:00:00Z').getTime();

function data(repositories) {
  return { repositories, counts: {} };
}

test('alerts once when stalled threshold is crossed', () => {
  const alerts = selectAlerts(data([{ name: 'demo', signal: 'yellow', ageMinutes: 46 }]), { stalledMinutes: 45, intervalMinutes: 15, now });
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].type, 'stalled');
});

test('does not alert for long-stale yellow project outside crossing window', () => {
  const alerts = selectAlerts(data([{ name: 'demo', signal: 'yellow', ageMinutes: 120 }]), { stalledMinutes: 45, intervalMinutes: 15, now });
  assert.equal(alerts.length, 0);
});

test('alerts recent CI failure', () => {
  const alerts = selectAlerts(data([{
    name: 'demo', signal: 'red', reason: 'ci_failed', ageMinutes: 3,
    latestRun: { updatedAt: '2026-09-09T23:55:00Z' }
  }]), { stalledMinutes: 45, intervalMinutes: 15, now });
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].type, 'ci_failed');
});

test('alerts recent human wait but not old human wait', () => {
  const alerts = selectAlerts(data([
    { name: 'new', signal: 'blue', lastActivity: '2026-09-09T23:55:00Z' },
    { name: 'old', signal: 'blue', lastActivity: '2026-09-09T20:00:00Z' }
  ]), { stalledMinutes: 45, intervalMinutes: 15, now });
  assert.deepEqual(alerts.map(a => a.project.name), ['new']);
});

test('builds actionable LINE text', () => {
  const text = buildAlertText([{ type: 'stalled', project: { name: 'azumamaru', ageMinutes: 46 } }]);
  assert.match(text, /azumamaru/);
  assert.match(text, /管制盤/);
});
