export async function issueLineAccessToken(channelId, channelSecret, fetchFn = fetch) {
  if (!channelId || !channelSecret) throw new Error('LINE channel credentials are not configured');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: channelId,
    client_secret: channelSecret
  });
  const response = await fetchFn('https://api.line.me/oauth2/v3/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`LINE token issuance failed: ${response.status}`);
  const data = text ? JSON.parse(text) : {};
  if (!data.access_token) throw new Error('LINE access token missing');
  return data.access_token;
}
