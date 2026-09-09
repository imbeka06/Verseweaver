import { Router } from 'express'
import { requireRoles } from '../middleware/rbac.js'
import {
  createChapter,
  createNotebook,
  deleteChapter,
  deleteNotebook,
  getChapter,
  readManuscript,
  renameNotebook,
  updateChapter,
} from '../services/manuscriptStore.js'

const router = Router()

const guard = requireRoles(['owner', 'admin'])

router.get('/manuscript', guard, async (req, res) => {
  try {
    const manuscript = await readManuscript(req.access.userId)
    res.status(200).json({ ok: true, manuscript })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to load manuscript.' })
  }
})

router.post('/manuscript/notebooks', guard, async (req, res) => {
  const { name, firstChapterTitle } = req.body ?? {}

  try {
    const result = await createNotebook(req.access.userId, { name, firstChapterTitle })
    res.status(201).json({ ok: true, ...result })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to create notebook.' })
  }
})

router.patch('/manuscript/notebooks/:notebookId', guard, async (req, res) => {
  const { name } = req.body ?? {}

  try {
    const result = await renameNotebook(req.access.userId, req.params.notebookId, { name })
    res.status(200).json({ ok: true, ...result })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to rename notebook.' })
  }
})

router.delete('/manuscript/notebooks/:notebookId', guard, async (req, res) => {
  try {
    const result = await deleteNotebook(req.access.userId, req.params.notebookId)
    res.status(200).json({ ok: true, ...result })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to delete notebook.' })
  }
})

router.post('/manuscript/notebooks/:notebookId/chapters', guard, async (req, res) => {
  const { title, content } = req.body ?? {}

  try {
    const chapter = await createChapter(req.access.userId, req.params.notebookId, { title, content })
    res.status(201).json({ ok: true, chapter })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to create chapter.' })
  }
})

router.get('/manuscript/chapters/:chapterId', guard, async (req, res) => {
  try {
    const chapter = await getChapter(req.access.userId, req.params.chapterId)
    res.status(200).json({ ok: true, chapter })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to load chapter.' })
  }
})

router.patch('/manuscript/chapters/:chapterId', guard, async (req, res) => {
  const { title, content, expectedVersion } = req.body ?? {}

  try {
    const chapter = await updateChapter(req.access.userId, req.params.chapterId, {
      title,
      content,
      expectedVersion,
    })
    res.status(200).json({ ok: true, chapter })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    if (error.status === 409) {
      return res.status(409).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to update chapter.' })
  }
})

router.delete('/manuscript/chapters/:chapterId', guard, async (req, res) => {
  try {
    const result = await deleteChapter(req.access.userId, req.params.chapterId)
    res.status(200).json({ ok: true, ...result })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to delete chapter.' })
  }
})

export default router
