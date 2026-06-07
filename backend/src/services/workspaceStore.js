import { prisma } from '../lib/prisma.js'

const WORKSPACE_SNAPSHOT_KEY = 'primary-workspace'

export async function readWorkspace() {
  const snapshot = await prisma.workspaceSnapshot.findUnique({
    where: { key: WORKSPACE_SNAPSHOT_KEY },
  })

  return snapshot?.payload ?? null
}

export async function writeWorkspace(data) {
  await prisma.workspaceSnapshot.upsert({
    where: { key: WORKSPACE_SNAPSHOT_KEY },
    create: {
      key: WORKSPACE_SNAPSHOT_KEY,
      payload: data,
    },
    update: {
      payload: data,
    },
  })
}
