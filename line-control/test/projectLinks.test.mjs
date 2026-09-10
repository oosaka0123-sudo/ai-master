import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProjectOpenUrl } from '../src/projectLinks.mjs';

test('uses configured repo-specific ChatGPT link', () => {
  const direct = 'https://chatgpt.com/c/rss7-house-test';
  const url = resolveProjectOpenUrl('oosaka0123-sudo/rss7-house', {
    PROJECT_OPEN_LINKS_JSON: JSON.stringify({ 'oosaka0123-sudo/rss7-house': direct })
  });
  assert.equal(url, direct);
});

test('rejects non-ChatGPT URL and uses safe fallback', () => {
  const url = resolveProjectOpenUrl('oosaka0123-sudo/demo', {
    PROJECT_OPEN_LINKS_JSON: JSON.stringify({ 'oosaka0123-sudo/demo': 'https://example.com/' })
  });
  assert.equal(url, 'https://chatgpt.com/');
});

test('unknown repo can use central AI chat fallback', () => {
  const fallback = 'https://chatgpt.com/c/central-test';
  const url = resolveProjectOpenUrl('oosaka0123-sudo/new-repo', { DEFAULT_AI_OPEN_URL: fallback });
  assert.equal(url, fallback);
});
