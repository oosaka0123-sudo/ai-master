import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyProject } from '../src/server.mjs';

const now = new Date('2026-09-10T00:00:00Z').getTime();
const baseRepo = { pushed_at: '2026-09-09T23:55:00Z' };
const commit = { commit: { committer: { date: '2026-09-09T23:55:00Z' } } };

test('green when activity is recent', () => {
  const out = classifyProject({ repo: baseRepo, latestCommit: commit, latestRun: null, openIssues: [], openPrs: [], now, thresholdMinutes: 45 });
  assert.equal(out.signal, 'green');
});

test('red when latest workflow failed', () => {
  const out = classifyProject({ repo: baseRepo, latestCommit: commit, latestRun: { conclusion: 'failure', updated_at: '2026-09-09T23:59:00Z' }, openIssues: [], openPrs: [], now, thresholdMinutes: 45 });
  assert.equal(out.signal, 'red');
  assert.equal(out.reason, 'ci_failed');
});

test('blue when human approval label exists', () => {
  const out = classifyProject({ repo: baseRepo, latestCommit: commit, latestRun: null, openIssues: [{ updated_at: '2026-09-09T23:50:00Z', labels: [{ name: 'needs-approval' }] }], openPrs: [], now, thresholdMinutes: 45 });
  assert.equal(out.signal, 'blue');
  assert.equal(out.reason, 'human_wait');
});

test('yellow only when open work is stale', () => {
  const staleRepo = { pushed_at: '2026-09-09T20:00:00Z' };
  const staleCommit = { commit: { committer: { date: '2026-09-09T20:00:00Z' } } };
  const out = classifyProject({ repo: staleRepo, latestCommit: staleCommit, latestRun: null, openIssues: [{ updated_at: '2026-09-09T20:00:00Z', labels: [] }], openPrs: [], now, thresholdMinutes: 45 });
  assert.equal(out.signal, 'yellow');
  assert.equal(out.reason, 'stalled');
});


test('done only when no open work and latest workflow succeeded', () => {
  const out = classifyProject({
    repo: baseRepo,
    latestCommit: commit,
    latestRun: { status: 'completed', conclusion: 'success', updated_at: '2026-09-09T23:59:00Z' },
    openIssues: [], openPrs: [], now, thresholdMinutes: 45
  });
  assert.equal(out.signal, 'done');
  assert.equal(out.reason, 'completed');
});
