const crypto = require('crypto');
const { getRedisClient, isReady } = require('../config/redis');

const DEFAULT_TTL_SECONDS = 86400; // 24 hours

/**
 * Deterministic cache key from all three inputs that affect Gemini's output.
 * Same inputs -> same key, regardless of which user submitted them.
 */
function getCacheKey(resume, selfDescription, jobDescription) {
  [resume, selfDescription, jobDescription].forEach((val, i) => {
    if (typeof val !== 'string' || !val.trim()) {
      throw new Error(`getCacheKey: argument ${i} must be a non-empty string`);
    }
  });
  const combined = `${resume.trim()}::${selfDescription.trim()}::${jobDescription.trim()}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

async function getCachedResult(key) {
  const client = getRedisClient();
  if (!client || !isReady()) return null;
  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Cache] Read failed for key ${key}:`, err.message);
    return null; // fail open
  }
}

async function setCachedResult(key, data, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const client = getRedisClient();
  if (!client || !isReady()) return false;
  try {
    await client.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    return true;
  } catch (err) {
    console.error(`[Cache] Write failed for key ${key}:`, err.message);
    return false; // fail open
  }
}

// ── Buffer-safe helpers, for the PDF endpoint specifically ─────────────
async function getCachedBuffer(key) {
  const result = await getCachedResult(key); // { base64: "..." } or null
  if (!result || !result.base64) return null;
  return Buffer.from(result.base64, 'base64');
}

async function setCachedBuffer(key, buffer, ttlSeconds = DEFAULT_TTL_SECONDS) {
  return setCachedResult(key, { base64: buffer.toString('base64') }, ttlSeconds);
}

module.exports = {
  getCacheKey,
  getCachedResult,
  setCachedResult,
  getCachedBuffer,
  setCachedBuffer,
};