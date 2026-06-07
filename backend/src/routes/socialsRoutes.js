import { Router } from 'express'
import { readSocials, writeSocials } from '../services/socialsStore.js'

const router = Router()

const nowIso = () => new Date().toISOString()

const emptySocials = {
  profile: {
    writerId: 'anya',
    displayName: 'Anya Voss',
    handle: '@Anya.Voss',
    role: 'Archivist Mage',
    bio: 'Call the action now what followers see.',
  },
  stats: {
    followers: 2000,
    following: 300,
  },
  statuses: [],
  highlights: [],
  followers: [],
  posts: [],
  messages: [],
}

const readOrSeedSocials = async () => {
  const socials = await readSocials()
  if (socials) {
    return socials
  }
  await writeSocials(emptySocials)
  return emptySocials
}

router.get('/socials/overview', async (_req, res) => {
  try {
    const socials = await readOrSeedSocials()
    return res.status(200).json({ ok: true, socials })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to load socials.' })
  }
})

router.post('/socials/posts', async (req, res) => {
  const { excerpt, mediaUrl, visibility = 'public' } = req.body ?? {}

  if (!excerpt || typeof excerpt !== 'string') {
    return res.status(400).json({ ok: false, message: 'Post excerpt is required.' })
  }

  try {
    const socials = await readOrSeedSocials()
    const post = {
      id: crypto.randomUUID(),
      excerpt,
      mediaUrl: mediaUrl || null,
      visibility,
      createdAt: nowIso(),
      likes: 0,
      comments: 0,
      shares: 0,
    }

    const nextSocials = {
      ...socials,
      posts: [post, ...socials.posts],
    }

    await writeSocials(nextSocials)
    return res.status(201).json({ ok: true, post, socials: nextSocials })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to create post.' })
  }
})

router.post('/socials/follow', async (req, res) => {
  const { followerName } = req.body ?? {}

  if (!followerName || typeof followerName !== 'string') {
    return res.status(400).json({ ok: false, message: 'Follower name is required.' })
  }

  try {
    const socials = await readOrSeedSocials()
    const follower = {
      id: crypto.randomUUID(),
      name: followerName,
      followedAt: nowIso(),
    }

    const nextSocials = {
      ...socials,
      followers: [follower, ...socials.followers],
      stats: {
        ...socials.stats,
        followers: socials.stats.followers + 1,
      },
    }

    await writeSocials(nextSocials)
    return res.status(200).json({ ok: true, socials: nextSocials })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to follow writer.' })
  }
})

router.post('/socials/messages', async (req, res) => {
  const { senderName, text } = req.body ?? {}

  if (!senderName || !text || typeof senderName !== 'string' || typeof text !== 'string') {
    return res.status(400).json({ ok: false, message: 'Sender and message text are required.' })
  }

  try {
    const socials = await readOrSeedSocials()
    const message = {
      id: crypto.randomUUID(),
      senderName,
      text,
      createdAt: nowIso(),
      read: false,
    }

    const nextSocials = {
      ...socials,
      messages: [message, ...socials.messages],
    }

    await writeSocials(nextSocials)
    return res.status(201).json({ ok: true, message, socials: nextSocials })
  } catch {
    return res.status(500).json({ ok: false, message: 'Failed to send message.' })
  }
})

export default router
