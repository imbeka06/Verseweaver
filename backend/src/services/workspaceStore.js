import { prisma } from '../lib/prisma.js'

export async function readWorkspace(userId) {
  const record = await prisma.workspace.findUnique({ where: { userId } })

  if (!record) {
    return null
  }

  return { payload: record.payload, version: record.version }
}

// Optimistic concurrency: callers pass the `version` they last read. If it no
// longer matches, the write is rejected with a 409 instead of silently
// overwriting a concurrent edit (last-writer-wins).
export async function writeWorkspace(userId, payload, expectedVersion) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.workspace.findUnique({ where: { userId } })

    if (!existing) {
      return tx.workspace.create({ data: { userId, payload, version: 1 } })
    }

    if (expectedVersion != null && expectedVersion !== existing.version) {
      const error = new Error('Workspace changed since it was loaded. Reload and try again.')
      error.status = 409
      throw error
    }

    return tx.workspace.update({
      where: { userId },
      data: { payload, version: { increment: 1 } },
    })
  })
}
