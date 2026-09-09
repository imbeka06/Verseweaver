import { Router } from 'express'
import { requireRoles } from '../middleware/rbac.js'
import {
  createRoadmapNode,
  deleteRoadmapNode,
  listRoadmapNodes,
  updateRoadmapNode,
} from '../services/roadmapStore.js'

const router = Router()

const guard = requireRoles(['owner', 'admin'])

router.get('/roadmap', guard, async (req, res) => {
  try {
    const roadmapNodes = await listRoadmapNodes(req.access.userId)
    res.status(200).json({ ok: true, roadmapNodes })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to load roadmap.' })
  }
})

router.post('/roadmap', guard, async (req, res) => {
  try {
    const node = await createRoadmapNode(req.access.userId, req.body ?? {})
    res.status(201).json({ ok: true, node })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to create roadmap node.' })
  }
})

router.patch('/roadmap/:id', guard, async (req, res) => {
  try {
    const node = await updateRoadmapNode(req.access.userId, req.params.id, req.body ?? {})
    res.status(200).json({ ok: true, node })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to update roadmap node.' })
  }
})

router.delete('/roadmap/:id', guard, async (req, res) => {
  try {
    const result = await deleteRoadmapNode(req.access.userId, req.params.id)
    res.status(200).json({ ok: true, ...result })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to delete roadmap node.' })
  }
})

export default router
