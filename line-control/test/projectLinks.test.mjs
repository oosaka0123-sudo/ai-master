import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProjectOpenLink, resolveProjectOpenUrl } from '../src/projectLinks.mjs';

test('normalizes verified project-scoped URL to direct conversation URL', () => {
  const scoped = 'https://chatgpt.com/g/g-p-demo/c/abc-123?messageId=x';
  const env = { PROJECT_OPEN_LINKS_JSON: JSON.stringify({
    'oosaka0123-sudo/demo': { url: scoped, type: 'chat', verified: true }
  }) };
  assert.deepEqual(resolveProjectOpenLink('oosaka0123-sudo/demo', env), {
    url: 'https://chatgpt.com/c/abc-123', type: 'chat', verified: true
  });
});

test('rejects project-home URL because it is not an exact conversation', () => {
  const env = { PROJECT_OPEN_LINKS_JSON: JSON.stringify({
    'oosaka0123-sudo/demo': { url: 'https://chatgpt.com/g/g-p-demo/project', type: 'work', verified: true }
  }) };
  assert.equal(resolveProjectOpenUrl('oosaka0123-sudo/demo', env), null);
});

test('unverified or legacy string mappings are rejected', () => {
  const env = { PROJECT_OPEN_LINKS_JSON: JSON.stringify({
    'oosaka0123-sudo/demo': 'https://chatgpt.com/c/wrong',
    'oosaka0123-sudo/demo2': { url: 'https://chatgpt.com/c/wrong2', type: 'chat', verified: false }
  }) };
  assert.equal(resolveProjectOpenUrl('oosaka0123-sudo/demo', env), null);
  assert.equal(resolveProjectOpenUrl('oosaka0123-sudo/demo2', env), null);
});
