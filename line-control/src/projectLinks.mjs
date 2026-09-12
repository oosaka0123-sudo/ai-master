import crypto from 'node:crypto';

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
  if (entry.verified !== true || !['chat', 'work'].includes(entry.type)) return null;
  const url = safeDirectConversationUrl(entry.url);
  return url ? { url, type: entry.type, verified: true } : null;
}

function signValue(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(aValue, bValue) {
  const a = Buffer.from(aValue || '');
  const b = Buffer.from(bValue || '');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function resolveProjectOpenLink(fullName, env = process.env) {
  return normalizeEntry(envLinks(env)[fullName]);
}

export function resolveAllProjectOpenLinks(env = process.env) {
  return Object.entries(envLinks(env))
    .map(([fullName, entry]) => ({ fullName, link: normalizeEntry(entry) }))
    .filter(item => item.link)
    .map(item => ({ fullName: item.fullName, ...item.link }));
}

export function resolveProjectOpenUrl(fullName, env = process.env) {
  return resolveProjectOpenLink(fullName, env)?.url || null;
}

export function buildProjectOpenResolverUrl(fullName, env = process.env) {
  if (!resolveProjectOpenLink(fullName, env)) return null;
  const base = env.LINE_CONTROL_PUBLIC_URL || '';
  const secret = env.OPEN_LINK_SIGNING_SECRET || '';
  if (!base || !secret) return null;
  try {
    const url = new URL('/open', base);
    url.searchParams.set('repository', fullName);
    url.searchParams.set('sig', signValue(`open:${fullName}`, secret));
    return url.toString();
  } catch { return null; }
}

export function buildOpenAllResolverUrl(env = process.env) {
  if (!resolveAllProjectOpenLinks(env).length) return null;
  const base = env.LINE_CONTROL_PUBLIC_URL || '';
  const secret = env.OPEN_LINK_SIGNING_SECRET || '';
  if (!base || !secret) return null;
  try {
    const url = new URL('/open-all', base);
    url.searchParams.set('sig', signValue('open-all', secret));
    return url.toString();
  } catch { return null; }
}

export function verifyProjectOpenSignature(fullName, signature, env = process.env) {
  const secret = env.OPEN_LINK_SIGNING_SECRET || '';
  if (!fullName || !secret || !signature) return false;
  return safeEqual(signValue(`open:${fullName}`, secret), signature);
}

export function verifyOpenAllSignature(signature, env = process.env) {
  const secret = env.OPEN_LINK_SIGNING_SECRET || '';
  if (!secret || !signature) return false;
  return safeEqual(signValue('open-all', secret), signature);
}
