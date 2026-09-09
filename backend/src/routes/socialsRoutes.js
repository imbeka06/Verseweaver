import { Router } from 'express'
import { getRequestAccessContext, requireRoles } from '../middleware/rbac.js'
import { deleteCache, getCache, setCache } from '../lib/redis.js'
import { enqueueSocialPostCreated } from '../queue/socialsQueue.js'
import { emitSocialEvent } from '../realtime/socketServer.js'
import {
  createPost,
  followWriter,
  likePost,
  readOrSeedSocials,
  readSocials,
  sendMessage,
  unlikePost,
} from '../services/socialsStore.js'

const router = Router()

const cacheKeyFor = (userId) => `socials:overview:${userId}`

router.get('/socials/overview', async (req, res) => {
  try {
    const cacheKey = cacheKeyFor(req.access.userId)
    const cachedPayload = await getCache(cacheKey)
    const socials = cachedPayload ? JSON.parse(cachedPayload) : await readOrSeedSocials(req.access)

    if (!cachedPayload) {
      await setCache(cacheKey, JSON.stringify(socials), 20)
    }

    return res.status(200).json({
      ok: true,
      socials,
      access: getRequestAccessContext(req),
    })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to load socials.' })
  }
})

router.post('/socials/posts', requireRoles(['owner', 'admin']), async (req, res) => {
  const { excerpt, mediaUrl, visibility } = req.body ?? {}

  if (!excerpt || typeof excerpt !== 'string') {
    return res.status(400).json({ ok: false, message: 'Post excerpt is required.' })
  }

  try {
    const post = await createPost(req.access, { excerpt, mediaUrl, visibility })
    const socials = await readSocials(req.access.userId)
    await deleteCache(cacheKeyFor(req.access.userId))
    await enqueueSocialPostCreated(post)
    emitSocialEvent('socials:post-created', post, req.access.userId)

    return res.status(201).json({ ok: true, post, socials })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to create post.' })
  }
})

router.post('/socials/follow', requireRoles(['owner', 'follower', 'admin']), async (req, res) => {
  const { followerName } = req.body ?? {}

  if (!followerName || typeof followerName !== 'string') {
    return res.status(400).json({ ok: false, message: 'Follower name is required.' })
  }

  try {
    const result = await followWriter(req.access, { followerName })
    const socials = await readSocials(req.access.userId)
    await deleteCache(cacheKeyFor(req.access.userId))
    emitSocialEvent('socials:follower-added', result.follower, req.access.userId)

    return res.status(200).json({ ok: true, socials })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to follow writer.' })
  }
})

router.post('/socials/messages', requireRoles(['owner', 'follower', 'admin']), async (req, res) => {
  const { senderName, text } = req.body ?? {}

  if (!senderName || !text || typeof senderName !== 'string' || typeof text !== 'string') {
    return res.status(400).json({ ok: false, message: 'Sender and message text are required.' })
  }

  try {
    const message = await sendMessage(req.access, { senderName, text })
    const socials = await readSocials(req.access.userId)
    await deleteCache(cacheKeyFor(req.access.userId))
    emitSocialEvent('socials:message-created', message, req.access.userId)

    return res.status(201).json({ ok: true, message, socials })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to send message.' })
  }
})

router.post('/socials/posts/:id/like', requireRoles(['owner', 'follower', 'admin']), async (req, res) => {
  try {
    const post = await likePost(req.access, req.params.id)
    await deleteCache(cacheKeyFor(req.access.userId))
    emitSocialEvent('socials:post-liked', post, req.access.userId)

    return res.status(200).json({ ok: true, post })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    return res.status(500).json({ ok: false, message: 'Failed to like post.' })
  }
})

router.post('/socials/posts/:id/unlike', requireRoles(['owner', 'follower', 'admin']), async (req, res) => {
  try {
    const post = await unlikePost(req.access, req.params.id)
    await deleteCache(cacheKeyFor(req.access.userId))
    emitSocialEvent('socials:post-unliked', post, req.access.userId)

    return res.status(200).json({ ok: true, post })
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ ok: false, message: error.message })
    }
    return res.status(500).json({ ok: false, message: 'Failed to unlike post.' })
  }
})

export default router
