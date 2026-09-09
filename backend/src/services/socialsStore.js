import { prisma } from '../lib/prisma.js'
import { upsertUserFromAccess } from './userService.js'

const toProfile = (profile) => ({
  writerId: profile.writerId,
  displayName: profile.displayName,
  handle: profile.handle,
  role: profile.role,
  bio: profile.bio,
})

const toStats = (stats) => ({
  followers: stats?.followers ?? 0,
  following: stats?.following ?? 0,
})

const toStatus = (item) => ({ id: item.id, title: item.title, coverUrl: item.coverUrl })
const toHighlight = (item) => ({ id: item.id, title: item.title, coverUrl: item.coverUrl })

const toFollower = (item) => ({
  id: item.id,
  name: item.name,
  followedAt: item.followedAt.toISOString(),
})

const toPost = (item) => ({
  id: item.id,
  excerpt: item.excerpt,
  mediaUrl: item.mediaUrl,
  visibility: item.visibility,
  createdAt: item.createdAt.toISOString(),
  likes: item.likes,
  comments: item.comments,
  shares: item.shares,
})

const toMessage = (item) => ({
  id: item.id,
  senderName: item.senderName,
  text: item.text,
  createdAt: item.createdAt.toISOString(),
  read: item.read,
})

const toSocialsShape = (profileRecord) => {
  if (!profileRecord) {
    return null
  }

  return {
    profile: toProfile(profileRecord),
    stats: toStats(profileRecord.stats),
    statuses: profileRecord.statuses.map(toStatus),
    highlights: profileRecord.highlights.map(toHighlight),
    followers: profileRecord.followers.map(toFollower),
    posts: profileRecord.posts.map(toPost),
    messages: profileRecord.messages.map(toMessage),
  }
}

// Idempotently creates the user's social profile (and its stats row), inheriting
// displayName/handle/role from the User row. Safe under concurrency because
// `upsert` on the unique `userId` is atomic.
export async function ensureProfile(access, profileInput = {}) {
  const user = await upsertUserFromAccess(access)
  const userId = access.userId

  const profile = await prisma.socialProfile.upsert({
    where: { userId },
    create: {
      userId,
      writerId: userId,
      displayName: profileInput.displayName || user?.displayName || 'Writer',
      handle: profileInput.handle || user?.handle || `@${userId.slice(0, 8)}`,
      role: profileInput.role || user?.role || 'owner',
      bio: profileInput.bio || '',
    },
    update: {},
  })

  await prisma.socialStats.upsert({
    where: { profileId: profile.id },
    create: { profileId: profile.id },
    update: {},
  })

  return profile
}

export async function readSocials(userId) {
  const profileRecord = await prisma.socialProfile.findUnique({
    where: { userId },
    include: {
      stats: true,
      statuses: { orderBy: { createdAt: 'desc' } },
      highlights: { orderBy: { createdAt: 'desc' } },
      followers: { orderBy: { followedAt: 'desc' } },
      posts: { orderBy: { createdAt: 'desc' } },
      messages: { orderBy: { createdAt: 'desc' } },
    },
  })

  return toSocialsShape(profileRecord)
}

export async function readOrSeedSocials(access) {
  const existing = await readSocials(access.userId)
  if (existing) {
    return existing
  }

  await ensureProfile(access)
  return readSocials(access.userId)
}

export async function createPost(access, { excerpt, mediaUrl, visibility }) {
  const profile = await ensureProfile(access)

  const post = await prisma.socialPost.create({
    data: {
      profileId: profile.id,
      excerpt,
      mediaUrl: mediaUrl || null,
      visibility: visibility || 'public',
    },
  })

  return toPost(post)
}

export async function followWriter(access, { followerName }) {
  const profile = await ensureProfile(access)

  // Atomic: the follower row and the follower count change together, so two
  // simultaneous follows each add a follower and increment the count (no
  // lost update from read-modify-write).
  const [follower, stats] = await prisma.$transaction([
    prisma.socialFollower.create({
      data: { profileId: profile.id, name: followerName },
    }),
    prisma.socialStats.upsert({
      where: { profileId: profile.id },
      create: { profileId: profile.id, followers: 1 },
      update: { followers: { increment: 1 } },
    }),
  ])

  return { follower: toFollower(follower), stats: toStats(stats) }
}

export async function sendMessage(access, { senderName, text }) {
  const profile = await ensureProfile(access)

  const message = await prisma.socialMessage.create({
    data: { profileId: profile.id, senderName, text },
  })

  return toMessage(message)
}

export async function likePost(access, postId) {
  const profile = await prisma.socialProfile.findUnique({ where: { userId: access.userId } })

  if (!profile) {
    const error = new Error('Post not found.')
    error.status = 404
    throw error
  }

  const result = await prisma.socialPost.updateMany({
    where: { id: postId, profileId: profile.id },
    data: { likes: { increment: 1 } },
  })

  if (result.count === 0) {
    const error = new Error('Post not found.')
    error.status = 404
    throw error
  }

  return toPost(await prisma.socialPost.findUnique({ where: { id: postId } }))
}

export async function unlikePost(access, postId) {
  const profile = await prisma.socialProfile.findUnique({ where: { userId: access.userId } })

  if (!profile) {
    const error = new Error('Post not found.')
    error.status = 404
    throw error
  }

  // Atomic conditional decrement — `where: { likes: { gt: 0 } }` makes this a
  // single UPDATE that never drops likes below zero.
  await prisma.socialPost.updateMany({
    where: { id: postId, profileId: profile.id, likes: { gt: 0 } },
    data: { likes: { decrement: 1 } },
  })

  const post = await prisma.socialPost.findFirst({
    where: { id: postId, profileId: profile.id },
  })

  if (!post) {
    const error = new Error('Post not found.')
    error.status = 404
    throw error
  }

  return toPost(post)
}
