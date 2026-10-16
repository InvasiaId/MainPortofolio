/**
 * Sanitize text input — strip HTML tags & trim whitespace
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize an object's string values recursively
 */
export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeText(v) : v);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Validate URL format (only http and https are permitted)
 */
export function isValidUrl(url) {
  if (!url) return true; // optional URLs are valid
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract clean client IP address from request headers
 */
export function getClientIp(request) {
  if (!request) return 'unknown';
  const forwarded = request.headers?.get?.('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers?.get?.('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

/**
 * Rate limiter — tracks attempts per key (IP-based)
 */
const rateLimitMap = new Map();

function pruneExpired(windowMs) {
  const now = Date.now();
  for (const [k, v] of rateLimitMap.entries()) {
    if (now - v.start > windowMs) {
      rateLimitMap.delete(k);
    }
  }
}

export function rateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  if (rateLimitMap.size > 500) {
    pruneExpired(windowMs);
  }

  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.start > windowMs) {
    rateLimitMap.set(key, { count: 1, start: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.start + windowMs - now) / 1000) };
  }

  return { allowed: true, remaining: maxAttempts - entry.count };
}
