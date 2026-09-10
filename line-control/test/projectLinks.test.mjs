import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProjectOpenLink, resolveProjectOpenUrl } from '../src/projectLinks.mjs';

test('uses only verified repo-specific ChatGPT link', () => {
  const direct = 'https://chatgpt.com/c/rss7-house-test';
  const env = { PROJECT_OPEN_LINKS_JSON: JSON.stringify({
    'oosaka0123-sudo/rss7-house': { url: direct, type: 'chat', verified: true }
  }) };
  assert.deepEqual(resolveProjectOpenLink('oosaka0123-sudo/rss7-house', env), {
    url: direct, type: 'chat', verified: true
  });
  assert.equal(resolveProjectOpenUrl('oosaka0123-sudo/rss7-house', env), direct);
});

test('unverified or legacy string mappings are rejected', () => {
  const env = { PROJECT_OPEN_LINKS_JSON: JSON.stringify({
    'oosaka0123-sudo/demo': 'https://chatgpt.com/c/wrong',
    'oosaka0123-sudo/demo2': { url: 'https://chatgpt.com/c/wrong2', type: 'chat', verified: false }
  }) };
  assert.equal(resolveProjectOpenUrl('oosaka0123-sudo/demo', env), null);
  assert.equal(resolveProjectOpenUrl('oosaka0123-sudo/demo2', env), null);
});
