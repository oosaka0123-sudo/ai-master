import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProjectOpenLink, resolveProjectOpenUrl, resolveAllProjectOpenLinks, buildProjectOpenResolverUrl, buildOpenAllResolverUrl, verifyProjectOpenSignature, verifyOpenAllSignature } from '../src/projectLinks.mjs';

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

test('builds stable signed resolver URL and validates signature', () => {
  const env = {
    PROJECT_OPEN_LINKS_JSON: JSON.stringify({
      'oosaka0123-sudo/demo': { url: 'https://chatgpt.com/c/abc-123', type: 'chat', verified: true }
    }),
    LINE_CONTROL_PUBLIC_URL: 'https://control.example.test',
    OPEN_LINK_SIGNING_SECRET: 'test-secret'
  };
  const link = buildProjectOpenResolverUrl('oosaka0123-sudo/demo', env);
  const url = new URL(link);
  assert.equal(url.origin + url.pathname, 'https://control.example.test/open');
  assert.equal(url.searchParams.get('repository'), 'oosaka0123-sudo/demo');
  assert.equal(verifyProjectOpenSignature('oosaka0123-sudo/demo', url.searchParams.get('sig'), env), true);
  assert.equal(verifyProjectOpenSignature('oosaka0123-sudo/other', url.searchParams.get('sig'), env), false);
});


test('builds signed open-all resolver from verified links only', () => {
  const env = {
    PROJECT_OPEN_LINKS_JSON: JSON.stringify({
      'oosaka0123-sudo/demo': { url: 'https://chatgpt.com/c/abc-123', type: 'chat', verified: true },
      'oosaka0123-sudo/bad': { url: 'https://example.com/not-chat', type: 'chat', verified: true }
    }),
    LINE_CONTROL_PUBLIC_URL: 'https://control.example.test',
    OPEN_LINK_SIGNING_SECRET: 'test-secret'
  };
  assert.equal(resolveAllProjectOpenLinks(env).length, 1);
  const link = buildOpenAllResolverUrl(env);
  const url = new URL(link);
  assert.equal(url.origin + url.pathname, 'https://control.example.test/open-all');
  assert.equal(verifyOpenAllSignature(url.searchParams.get('sig'), env), true);
  assert.equal(verifyOpenAllSignature('tampered', env), false);
});
