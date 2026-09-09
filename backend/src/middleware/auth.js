import { createRemoteJWKSet, jwtVerify } from 'jose'

const STRICT_AUTH = process.env.STRICT_AUTH === 'true'
const JWKS_URL = process.env.AUTH_JWKS_URL
const JWT_SECRET = process.env.AUTH_JWT_SECRET
const AUTH_ISSUER = process.env.AUTH_ISSUER

const allowedRoles = ['owner', 'follower', 'guest', 'admin']

const jwks = JWKS_URL ? createRemoteJWKSet(new URL(JWKS_URL)) : null
const hmacKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null

const devContextFromHeaders = (req) => {
  const roleHeader = String(req.headers['x-vw-role'] || 'guest').toLowerCase()
  const role = allowedRoles.includes(roleHeader) ? roleHeader : 'guest'

  return {
    role,
    userId: String(req.headers['x-vw-user-id'] || 'anonymous'),
    isAuthenticated: role !== 'guest',
  }
}

// Supabase puts app-level roles in app_metadata / user_metadata, NOT the
// top-level `role` claim (that one is the Postgres role, e.g. "authenticated").
const appRoleFromClaims = (payload) => {
  const explicitRole =
    payload.app_metadata?.vw_role ||
    payload.app_metadata?.role ||
    payload.user_metadata?.vw_role ||
    payload.user_metadata?.role

  return allowedRoles.includes(explicitRole) ? explicitRole : 'owner'
}

const verifyToken = async (token) => {
  if (jwks) {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: AUTH_ISSUER || undefined,
      algorithms: ['RS256', 'ES256', 'PS256'],
    })
    return payload
  }

  if (hmacKey) {
    const { payload } = await jwtVerify(token, hmacKey, {
      issuer: AUTH_ISSUER || undefined,
      algorithms: ['HS256'],
    })
    return payload
  }

  return null
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

  const token = authHeader.replace('Bearer ', '')

  try {
    const payload = await verifyToken(token)

    if (!payload) {
      return res.status(500).json({
        ok: false,
        message: 'Server auth is misconfigured. Set AUTH_JWT_SECRET or AUTH_JWKS_URL.',
      })
    }

    const email = typeof payload.email === 'string' ? payload.email : null

    req.access = {
      role: appRoleFromClaims(payload),
      userId: String(payload.sub || 'unknown-user'),
      email,
      displayName:
        payload.user_metadata?.full_name ||
        payload.user_metadata?.name ||
        (email ? email.split('@')[0] : null),
      isAuthenticated: true,
      claims: payload,
    }

    return next()
  } catch {
    return res.status(401).json({ ok: false, message: 'Invalid or expired bearer token.' })
  }
}
