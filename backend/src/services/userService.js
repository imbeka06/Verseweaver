import { prisma } from '../lib/prisma.js'

const sanitizeHandle = (value) =>
  (value || 'writer').replace(/[^a-zA-Z0-9_.]/g, '') || 'writer'

const handleFromEmail = (email) => `@${sanitizeHandle((email || '').split('@')[0])}`

export const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  handle: user.handle,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
})

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

  const upsert = (handle) =>
    prisma.user.upsert({
      where: { id: access.userId },
      create: { id: access.userId, email, displayName, handle, role },
      update: { email, displayName, role },
    })

  try {
    const user = await upsert(baseHandle)
    return toPublicUser(user)
  } catch (error) {
    if (error.code !== 'P2002') {
      throw error
    }

    // Handle already claimed by another user (shared email prefix). If it's our
    // own row (race on the update path), return it; otherwise fall back to a
    // unique suffix derived from the user id.
    const existing = await prisma.user.findFirst({ where: { handle: baseHandle } })
    if (existing?.id === access.userId) {
      return toPublicUser(existing)
    }

    const uniqueHandle = `${baseHandle}-${access.userId.slice(0, 6)}`
    const user = await upsert(uniqueHandle)
    return toPublicUser(user)
  }
}

export async function getPublicUserById(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  return user ? toPublicUser(user) : null
}
