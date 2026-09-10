function safeDirectConversationUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'chatgpt.com') return null;
    const match = url.pathname.match(/\/c\/([^/?#]+)/);
    if (!match) return null;
    return `https://chatgpt.com/c/${match[1]}`;
  } catch {
    return null;
  }
}

function envLinks(env = process.env) {
  const raw = env.PROJECT_OPEN_LINKS_JSON || '';
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
  if (entry.verified !== true) return null;
  if (!['chat', 'work'].includes(entry.type)) return null;
  const url = safeDirectConversationUrl(entry.url);
  return url ? { url, type: entry.type, verified: true } : null;
}
export function resolveProjectOpenLink(fullName, env = process.env) {
  return normalizeEntry(envLinks(env)[fullName]);
}

export function resolveProjectOpenUrl(fullName, env = process.env) {
  return resolveProjectOpenLink(fullName, env)?.url || null;
}
