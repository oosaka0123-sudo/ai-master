const SAFE_FALLBACK_URL = 'https://chatgpt.com/';

function safeChatGptUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'chatgpt.com' ? url.toString() : null;
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

export function resolveProjectOpenUrl(fullName, env = process.env) {
  const links = envLinks(env);
  const custom = links[fullName];
  return safeChatGptUrl(custom)
    || safeChatGptUrl(links.__default)
    || safeChatGptUrl(env.DEFAULT_AI_OPEN_URL)
    || SAFE_FALLBACK_URL;
}
