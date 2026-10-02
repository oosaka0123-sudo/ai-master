import crypto from 'node:crypto';

const DEFAULT_REFRESH_SKEW_MS = 5 * 60 * 1000;
const GITHUB_API_VERSION = '2022-11-28';

function encodeJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function createAppJwt({ appId, privateKey, now = Date.now() }) {
  if (!appId) throw new Error('GITHUB_APP_ID is not configured');
  if (!privateKey) throw new Error('GITHUB_APP_PRIVATE_KEY is not configured');

  const nowSeconds = Math.floor(now / 1000);
  const header = encodeJson({ alg: 'RS256', typ: 'JWT' });
  const payload = encodeJson({
    iat: nowSeconds - 60,
    exp: nowSeconds + 9 * 60,
    iss: String(appId)
  });
  const unsigned = `${header}.${payload}`;
  const signature = crypto
    .sign('RSA-SHA256', Buffer.from(unsigned), privateKey)
    .toString('base64url');
  return `${unsigned}.${signature}`;
}

export function createGitHubAppTokenProvider({
  appId,
  installationId,
  privateKey,
  fetchFn = fetch,
  nowFn = Date.now,
  refreshSkewMs = DEFAULT_REFRESH_SKEW_MS
}) {
  if (!installationId) throw new Error('GITHUB_INSTALLATION_ID is not configured');

  let cachedToken = '';
  let expiresAtMs = 0;

  async function mint() {
    const jwt = createAppJwt({ appId, privateKey, now: nowFn() });
    const response = await fetchFn(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${jwt}`,
          accept: 'application/vnd.github+json',
          'x-github-api-version': GITHUB_API_VERSION,
          'user-agent': 'ai-master-line-control'
        }
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub App token mint failed: ${response.status}: ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    if (!data.token || !data.expires_at) throw new Error('GitHub App token response is incomplete');
    cachedToken = data.token;
    expiresAtMs = new Date(data.expires_at).getTime();
    return cachedToken;
  }

  return {
    async getToken({ force = false } = {}) {
      const now = nowFn();
      if (!force && cachedToken && expiresAtMs - now > refreshSkewMs) return cachedToken;
      return mint();
    },
    clear() {
      cachedToken = '';
      expiresAtMs = 0;
    }
  };
}
