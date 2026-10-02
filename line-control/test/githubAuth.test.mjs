import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { createAppJwt, createGitHubAppTokenProvider } from '../src/githubAuth.mjs';

const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const pem = privateKey.export({ type: 'pkcs1', format: 'pem' });

test('createAppJwt signs a short-lived GitHub App JWT', () => {
  const now = Date.UTC(2026, 9, 2, 12, 0, 0);
  const jwt = createAppJwt({ appId: '12345', privateKey: pem, now });
  const parts = jwt.split('.');
  assert.equal(parts.length, 3);
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  assert.equal(payload.iss, '12345');
  assert.equal(payload.iat, Math.floor(now / 1000) - 60);
  assert.equal(payload.exp, Math.floor(now / 1000) + 540);
});

test('provider caches, refreshes near expiry, and supports forced refresh', async () => {
  let now = Date.UTC(2026, 9, 2, 12, 0, 0);
  let calls = 0;
  const fetchFn = async () => {
    calls += 1;
    return {
      ok: true,
      async json() {
        return {
          token: `token-${calls}`,
          expires_at: new Date(now + 60 * 60 * 1000).toISOString()
        };
      }
    };
  };

  const provider = createGitHubAppTokenProvider({
    appId: '12345',
    installationId: '67890',
    privateKey: pem,
    fetchFn,
    nowFn: () => now
  });

  assert.equal(await provider.getToken(), 'token-1');
  assert.equal(await provider.getToken(), 'token-1');
  assert.equal(calls, 1);

  now += 56 * 60 * 1000;
  assert.equal(await provider.getToken(), 'token-2');
  assert.equal(calls, 2);

  assert.equal(await provider.getToken({ force: true }), 'token-3');
  assert.equal(calls, 3);

  provider.clear();
  assert.equal(await provider.getToken(), 'token-4');
  assert.equal(calls, 4);
});
