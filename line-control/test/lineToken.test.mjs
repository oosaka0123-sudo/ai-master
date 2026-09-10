import test from 'node:test';
import assert from 'node:assert/strict';
import { issueLineAccessToken } from '../src/lineToken.mjs';

test('issues a stateless LINE token from channel credentials', async () => {
  let request;
  const fakeFetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ access_token: 'line-test-token', expires_in: 900 }), { status: 200 });
  };
  const token = await issueLineAccessToken('123456', 'secret-value', fakeFetch);
  assert.equal(token, 'line-test-token');
  assert.equal(request.url, 'https://api.line.me/oauth2/v3/token');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.body.get('grant_type'), 'client_credentials');
  assert.equal(request.options.body.get('client_id'), '123456');
  assert.equal(request.options.body.get('client_secret'), 'secret-value');
});

test('requires both LINE channel credentials', async () => {
  await assert.rejects(() => issueLineAccessToken('', 'secret'));
  await assert.rejects(() => issueLineAccessToken('123', ''));
});
