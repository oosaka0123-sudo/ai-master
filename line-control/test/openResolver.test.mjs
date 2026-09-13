import test from 'node:test';
import assert from 'node:assert/strict';
process.env.NODE_ENV = 'test';
process.env.PROJECT_OPEN_LINKS_JSON = JSON.stringify({
  'oosaka0123-sudo/demo': { url: 'https://chatgpt.com/c/abc-123', type: 'chat', verified: true }
});
process.env.LINE_CONTROL_PUBLIC_URL = 'https://control.example.test';
process.env.OPEN_LINK_SIGNING_SECRET = 'test-signing-secret';
const { server } = await import('../src/server.mjs');
const { buildProjectOpenResolverUrl, buildOpenAllResolverUrl } = await import('../src/projectLinks.mjs');

async function withServer(fn) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try { return await fn(server.address().port); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('signed open resolver redirects to exact direct conversation', async () => {
  const signed = new URL(buildProjectOpenResolverUrl('oosaka0123-sudo/demo'));
  await withServer(async port => {
    const response = await fetch(`http://127.0.0.1:${port}/open?${signed.searchParams}`, { redirect: 'manual' });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), 'https://chatgpt.com/c/abc-123');
  });
});
test('tampered repository is rejected', async () => {
  const signed = new URL(buildProjectOpenResolverUrl('oosaka0123-sudo/demo'));
  signed.searchParams.set('repository', 'oosaka0123-sudo/other');
  await withServer(async port => {
    const response = await fetch(`http://127.0.0.1:${port}/open?${signed.searchParams}`, { redirect: 'manual' });
    assert.equal(response.status, 403);
  });
});
test('open-all deduplicates identical URLs and reuses named tabs', async () => {
  const previous = process.env.PROJECT_OPEN_LINKS_JSON;
  process.env.PROJECT_OPEN_LINKS_JSON = JSON.stringify({
    'oosaka0123-sudo/demo-a': { url: 'https://chatgpt.com/c/shared-123', type: 'chat', verified: true },
    'oosaka0123-sudo/demo-b': { url: 'https://chatgpt.com/c/shared-123', type: 'chat', verified: true }
  });
  try {
    const signed = new URL(buildOpenAllResolverUrl());
    await withServer(async port => {
      const response = await fetch(`http://127.0.0.1:${port}/open-all?${signed.searchParams}`);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, /全て開く（1件）/);
      assert.match(html, /window\.open\(u,target\)/);
      assert.doesNotMatch(html, /window\.open\(u,'_blank'/);
    });
  } finally {
    process.env.PROJECT_OPEN_LINKS_JSON = previous;
  }
});