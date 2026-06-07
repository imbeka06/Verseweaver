import { prisma } from '../lib/prisma.js'

const DEFAULT_WRITER_ID = 'anya'

const toSocialsShape = (profileRecord) => {
  if (!profileRecord) {
    return null
  }

  return {
    profile: {
      writerId: profileRecord.writerId,
      displayName: profileRecord.displayName,
      handle: profileRecord.handle,
      role: profileRecord.role,
      bio: profileRecord.bio,
    },
    stats: {
      followers: profileRecord.stats?.followers ?? 0,
      following: profileRecord.stats?.following ?? 0,
    },
    statuses: profileRecord.statuses.map((item) => ({
      id: item.id,
      title: item.title,
      coverUrl: item.coverUrl,
    })),
    highlights: profileRecord.highlights.map((item) => ({
      id: item.id,
      title: item.title,
      coverUrl: item.coverUrl,
    })),
    followers: profileRecord.followers.map((item) => ({
      id: item.id,
      name: item.name,
      followedAt: item.followedAt.toISOString(),
    })),
    posts: profileRecord.posts.map((item) => ({
      id: item.id,
      excerpt: item.excerpt,
      mediaUrl: item.mediaUrl,
      visibility: item.visibility,
      createdAt: item.createdAt.toISOString(),
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
    })),
    messages: profileRecord.messages.map((item) => ({
      id: item.id,
      senderName: item.senderName,
      text: item.text,
      createdAt: item.createdAt.toISOString(),
      read: item.read,
    })),
  }
}

const mapDateInput = (value) => {
  if (!value) return undefined
  const asDate = new Date(value)
  return Number.isNaN(asDate.getTime()) ? undefined : asDate
}

export async function readSocials() {
  const profileRecord = await prisma.socialProfile.findFirst({
    where: { writerId: DEFAULT_WRITER_ID },
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

export async function writeSocials(data) {
  const profileInput = data.profile ?? {}
  const writerId = profileInput.writerId || DEFAULT_WRITER_ID

  const profile = await prisma.socialProfile.upsert({
    where: { writerId },
    create: {
      writerId,
      displayName: profileInput.displayName || 'Anya Voss',
      handle: profileInput.handle || '@Anya.Voss',
      role: profileInput.role || 'Archivist Mage',
      bio: profileInput.bio || 'Call the action now what followers see.',
    },
    update: {
      displayName: profileInput.displayName || 'Anya Voss',
      handle: profileInput.handle || '@Anya.Voss',
      role: profileInput.role || 'Archivist Mage',
      bio: profileInput.bio || 'Call the action now what followers see.',
    },
  })

  await prisma.socialStats.upsert({
    where: { profileId: profile.id },
    create: {
      profileId: profile.id,
      followers: data.stats?.followers ?? 0,
      following: data.stats?.following ?? 0,
    },
    update: {
      followers: data.stats?.followers ?? 0,
      following: data.stats?.following ?? 0,
    },
  })

  await Promise.all([
    prisma.socialStatus.deleteMany({ where: { profileId: profile.id } }),
    prisma.socialHighlight.deleteMany({ where: { profileId: profile.id } }),
    prisma.socialFollower.deleteMany({ where: { profileId: profile.id } }),
    prisma.socialPost.deleteMany({ where: { profileId: profile.id } }),
    prisma.socialMessage.deleteMany({ where: { profileId: profile.id } }),
  ])

  if (Array.isArray(data.statuses) && data.statuses.length > 0) {
    await prisma.socialStatus.createMany({
      data: data.statuses.map((item) => ({
        id: item.id,
        profileId: profile.id,
        title: item.title,
        coverUrl: item.coverUrl,
      })),
      skipDuplicates: true,
    })
  }

  if (Array.isArray(data.highlights) && data.highlights.length > 0) {
    await prisma.socialHighlight.createMany({
      data: data.highlights.map((item) => ({
        id: item.id,
        profileId: profile.id,
        title: item.title,
        coverUrl: item.coverUrl,
      })),
      skipDuplicates: true,
    })
  }

  if (Array.isArray(data.followers) && data.followers.length > 0) {
    await prisma.socialFollower.createMany({
      data: data.followers.map((item) => ({
        id: item.id,
        profileId: profile.id,
        name: item.name,
        followedAt: mapDateInput(item.followedAt),
      })),
      skipDuplicates: true,
    })
  }

  if (Array.isArray(data.posts) && data.posts.length > 0) {
    await prisma.socialPost.createMany({
      data: data.posts.map((item) => ({
        id: item.id,
        profileId: profile.id,
        excerpt: item.excerpt,
        mediaUrl: item.mediaUrl || null,
        visibility: item.visibility || 'public',
        likes: item.likes ?? 0,
        comments: item.comments ?? 0,
        shares: item.shares ?? 0,
        createdAt: mapDateInput(item.createdAt),
      })),
      skipDuplicates: true,
    })
  }

  if (Array.isArray(data.messages) && data.messages.length > 0) {
    await prisma.socialMessage.createMany({
      data: data.messages.map((item) => ({
        id: item.id,
        profileId: profile.id,
        senderName: item.senderName,
        text: item.text,
        read: Boolean(item.read),
        createdAt: mapDateInput(item.createdAt),
      })),
      skipDuplicates: true,
    })
  }
}
