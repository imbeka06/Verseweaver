import { Router } from 'express'
import { requireRoles } from '../middleware/rbac.js'
import { readWorkspace, writeWorkspace } from '../services/workspaceStore.js'

const router = Router()

router.get('/workspace', requireRoles(['owner', 'admin']), async (_req, res) => {
  try {
    const workspace = await readWorkspace()
    res.status(200).json({ ok: true, workspace })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to load workspace.' })
  }
})

router.put('/workspace', requireRoles(['owner', 'admin']), async (req, res) => {
  const { workspace } = req.body ?? {}

  if (!workspace || typeof workspace !== 'object') {
    return res.status(400).json({ ok: false, message: 'Invalid workspace payload.' })
  }

  try {
    await writeWorkspace(workspace)
    return res.status(200).json({ ok: true, workspace })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to save workspace.' })
  }
})

export default router
