const allowedRoles = ['owner', 'follower', 'guest', 'admin']

export function getRequestAccessContext(req) {
  if (req.access && req.access.role) {
    return req.access
  }

  const roleHeader = String(req.headers['x-vw-role'] || 'guest').toLowerCase()
  const role = allowedRoles.includes(roleHeader) ? roleHeader : 'guest'
  const userId = String(req.headers['x-vw-user-id'] || 'anonymous')

  return {
    role,
    userId,
    isAuthenticated: role !== 'guest',
  }
}

export function requireRoles(roles) {
  const accepted = new Set(roles)

  return (req, res, next) => {
    const context = getRequestAccessContext(req)

    if (!accepted.has(context.role)) {
      return res.status(403).json({
        ok: false,
        message: 'Forbidden for current role.',
      })
    }

    req.access = context
    return next()
  }
}
