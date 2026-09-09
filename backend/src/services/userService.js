import { prisma } from '../lib/prisma.js'

const sanitizeHandle = (value) =>
  (value || 'writer').replace(/[^a-zA-Z0-9_.]/g, '') || 'writer'

const handleFromEmail = (email) => `@${sanitizeHandle((email || '').split('@')[0])}`

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  handle: user.handle,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
})

async function resolveUniqueHandle(baseHandle, userId) {
  const existing = await prisma.user.findFirst({ where: { handle: baseHandle } })

  if (!existing || existing.id === userId) {
    return baseHandle
  }

  return `${baseHandle}-${userId.slice(0, 6)}`
}

// Creates or syncs the local User row from a verified auth context. Called on
// every authenticated request so a fresh Supabase sign-up gets a User row
// without a separate provisioning step.
export async function upsertUserFromAccess(access) {
  if (!access?.isAuthenticated || !access.userId) {
    return null
  }

  const email = access.email || `${access.userId}@verseweaver.local`
  const displayName = access.displayName || 'Writer'
  const role = access.role || 'owner'
  const baseHandle = handleFromEmail(email)

  const user = await prisma.user.upsert({
    where: { id: access.userId },
    create: {
      id: access.userId,
      email,
      displayName,
      handle: baseHandle,
      role,
    },
    update: {
      email,
      displayName,
      role,
    },
  })

  // Handle collision fallback only when the upsert created a conflicting handle
  // (rare: two users sharing an email prefix). Resolves afterwards to keep the
  // hot path single-statement.
  if (user.handle !== baseHandle) {
    return toPublicUser(user)
  }

  const existing = await prisma.user.findUnique({ where: { handle: baseHandle } })

  if (!existing || existing.id === user.id) {
    return toPublicUser(user)
  }

  const uniqueHandle = await resolveUniqueHandle(baseHandle, user.id)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { handle: uniqueHandle },
  })

  return toPublicUser(updated)
}

export async function getPublicUserById(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user ? toPublicUser(user) : null
}

export { toPublicUser }
