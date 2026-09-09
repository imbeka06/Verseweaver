import { upsertUserFromAccess } from '../services/userService.js'

// Guarantees a local User row exists for every authenticated request before any
// domain route runs. Manuscript/Character/Roadmap/Workspace/Social rows all
// carry a foreign key to User, so this is required for those writes to succeed.
export async function ensureUser(req, res, next) {
  if (!req.access?.isAuthenticated) {
    return next()
  }

  try {
    req.user = await upsertUserFromAccess(req.access)
  } catch {
    // Downstream DB operations will surface the real error; don't mask it here.
    req.user = null
  }

  return next()
}
