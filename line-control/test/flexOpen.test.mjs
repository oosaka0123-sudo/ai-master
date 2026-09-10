import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardMessages } from '../src/flex.mjs';

test('project card includes ChatGPT open button', () => {
  const data = {
    counts: { yellow: 1 },
    repositories: [{
      name: 'demo', fullName: 'oosaka0123-sudo/demo', signal: 'yellow',
      reason: 'stalled', ageMinutes: 50, openPrs: 0, openIssues: 1,
      openUrl: 'https://chatgpt.com/c/test'
    }]
  };
  const messages = buildDashboardMessages(data);
  const footer = messages[1].contents.contents[0].footer.contents;
  assert.equal(footer[0].action.type, 'uri');
  assert.equal(footer[0].action.label, '🔗 開く');
  assert.equal(footer[0].action.uri, 'https://chatgpt.com/c/test');
});
