import { Router } from 'express'
import { requireRoles } from '../middleware/rbac.js'
import { readWorkspace, writeWorkspace } from '../services/workspaceStore.js'

const router = Router()

router.get('/workspace', requireRoles(['owner', 'admin']), async (req, res) => {
  try {
    const workspace = await readWorkspace(req.access.userId)
    res.status(200).json({
      ok: true,
      workspace: workspace?.payload ?? null,
      version: workspace?.version ?? null,
    })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to load workspace.' })
  }
})

router.put('/workspace', requireRoles(['owner', 'admin']), async (req, res) => {
  const { workspace, version } = req.body ?? {}

  if (!workspace || typeof workspace !== 'object') {
    return res.status(400).json({ ok: false, message: 'Invalid workspace payload.' })
  }

  try {
    const record = await writeWorkspace(req.access.userId, workspace, version ?? undefined)

    return res.status(200).json({
      ok: true,
      workspace: record.payload,
      version: record.version,
    })
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ ok: false, message: error.message })
    }

    return res.status(500).json({ ok: false, message: 'Failed to save workspace.' })
  }
})

export default router
