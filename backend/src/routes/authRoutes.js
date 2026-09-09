import { Router } from 'express'
import { getRequestAccessContext } from '../middleware/rbac.js'
import { upsertUserFromAccess } from '../services/userService.js'

const router = Router()

router.get('/auth/me', async (req, res) => {
  try {
    const access = getRequestAccessContext(req)
    const user = access.isAuthenticated ? await upsertUserFromAccess(access) : null

    return res.status(200).json({
      ok: true,
      user,
      access,
    })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to load current user.' })
  }
})

export default router
