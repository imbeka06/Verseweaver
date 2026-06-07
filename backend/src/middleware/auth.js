import { createRemoteJWKSet, jwtVerify } from 'jose'

const STRICT_AUTH = process.env.STRICT_AUTH === 'true'
const JWKS_URL = process.env.AUTH_JWKS_URL
const AUTH_ISSUER = process.env.AUTH_ISSUER

const jwks = JWKS_URL ? createRemoteJWKSet(new URL(JWKS_URL)) : null

const devContextFromHeaders = (req) => {
  const roleHeader = String(req.headers['x-vw-role'] || 'guest').toLowerCase()
  const role = ['owner', 'follower', 'guest', 'admin'].includes(roleHeader) ? roleHeader : 'guest'

  return {
    role,
    userId: String(req.headers['x-vw-user-id'] || 'anonymous'),
    isAuthenticated: role !== 'guest',
  }
}

export async function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    if (STRICT_AUTH) {
      return res.status(401).json({ ok: false, message: 'Missing bearer token.' })
    }

    req.access = devContextFromHeaders(req)
    return next()
  }

  if (!jwks) {
    return res.status(500).json({
      ok: false,
      message: 'Server auth is misconfigured. AUTH_JWKS_URL is required for bearer auth.',
    })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: AUTH_ISSUER || undefined,
    })

    const roleClaim = String(payload.role || payload.publicMetadata?.role || 'follower').toLowerCase()
    const role = ['owner', 'follower', 'guest', 'admin'].includes(roleClaim) ? roleClaim : 'follower'

    req.access = {
      role,
      userId: String(payload.sub || 'unknown-user'),
      isAuthenticated: true,
      claims: payload,
    }

    return next()
  } catch {
    return res.status(401).json({ ok: false, message: 'Invalid or expired bearer token.' })
  }
}
