import { Router } from 'express'
import { requireRoles } from '../middleware/rbac.js'
import {
  createCharacter,
  deleteCharacter,
  listCharacters,
  updateCharacter,
} from '../services/charactersStore.js'

const router = Router()

const guard = requireRoles(['owner', 'admin'])

router.get('/characters', guard, async (req, res) => {
  try {
    const characters = await listCharacters(req.access.userId)
    res.status(200).json({ ok: true, characters })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to load characters.' })
  }
})

router.post('/characters', guard, async (req, res) => {
  try {
    const character = await createCharacter(req.access.userId, req.body ?? {})
    res.status(201).json({ ok: true, character })
  } catch {
    res.status(500).json({ ok: false, message: 'Failed to create character.' })
  }
})

router.patch('/characters/:id', guard, async (req, res) => {
  try {
    const character = await updateCharacter(req.access.userId, req.params.id, req.body ?? {})
    res.status(200).json({ ok: true, character })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to update character.' })
  }
})

router.delete('/characters/:id', guard, async (req, res) => {
  try {
    const result = await deleteCharacter(req.access.userId, req.params.id)
    res.status(200).json({ ok: true, ...result })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    res.status(500).json({ ok: false, message: 'Failed to delete character.' })
  }
})

export default router
