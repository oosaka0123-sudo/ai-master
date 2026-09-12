import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardMessages, buildAlertMessages, buildRunnerFailureMessages } from '../src/flex.mjs';

test('verified chat card shows Chat button', () => {
  const data = { counts: { yellow: 1 }, repositories: [{
    name: 'demo', fullName: 'oosaka0123-sudo/demo', signal: 'yellow', reason: 'stalled',
    ageMinutes: 50, openPrs: 0, openIssues: 1,
    openUrl: 'https://chatgpt.com/c/test', openType: 'chat'
  }] };
  const footer = buildDashboardMessages(data)[1].contents.contents[0].footer.contents;
  assert.equal(footer[0].action.type, 'uri');
  assert.equal(footer[0].action.label, '💬 Chatを開く');
  assert.equal(footer[1].action.label, '▶ 進めて');
});

test('verified work card shows Work button', () => {
  const data = { counts: { yellow: 1 }, repositories: [{
    name: 'demo', fullName: 'oosaka0123-sudo/demo', signal: 'yellow', reason: 'stalled',
    ageMinutes: 50, openPrs: 0, openIssues: 1,
    openUrl: 'https://chatgpt.com/c/work-test', openType: 'work'
  }] };
  const footer = buildDashboardMessages(data)[1].contents.contents[0].footer.contents;
  assert.equal(footer[0].action.label, '🧰 Workを開く');
});
test('unlinked repo omits open button but keeps controls', () => {
  const data = { counts: { yellow: 1 }, repositories: [{
    name: 'demo', fullName: 'oosaka0123-sudo/demo', signal: 'yellow', reason: 'stalled',
    ageMinutes: 50, openPrs: 0, openIssues: 1, openUrl: null, openType: null
  }] };
  const footer = buildDashboardMessages(data)[1].contents.contents[0].footer.contents;
  assert.equal(footer[0].action.label, '▶ 進めて');
  assert.ok(!footer.some(item => item.action?.type === 'uri'));
});

test('automatic project alert preserves verified open button', () => {
  const alerts = [{ type: 'stalled', project: {
    name: 'demo', fullName: 'oosaka0123-sudo/demo', signal: 'yellow', reason: 'stalled',
    ageMinutes: 50, openPrs: 0, openIssues: 1,
    openUrl: 'https://chatgpt.com/c/test', openType: 'chat'
  }}];
  const footer = buildAlertMessages(alerts)[0].contents.contents[0].footer.contents;
  assert.equal(footer[0].action.label, '💬 Chatを開く');
  assert.equal(footer[1].action.label, '▶ 進めて');
});

test('runner failure alert still has refresh button', () => {
  const messages = buildRunnerFailureMessages([{ name: 'run-1', reason: 'FAILED' }]);
  assert.equal(messages[0].type, 'flex');
  assert.equal(messages[0].contents.footer.contents[0].action.label, '🔄 今すぐ更新');
});


test('summary shows global open-all button when resolver is available', () => {
  const data = {
    counts: { green: 1 },
    openAllUrl: 'https://control.example/open-all?sig=test',
    repositories: [{ name: 'demo', fullName: 'oosaka0123-sudo/demo', signal: 'green', reason: 'normal' }]
  };
  const footer = buildDashboardMessages(data)[0].contents.footer.contents;
  assert.equal(footer[0].action.type, 'uri');
  assert.equal(footer[0].action.label, '📂 全て開く');
  assert.equal(footer[0].action.uri, data.openAllUrl);
});
