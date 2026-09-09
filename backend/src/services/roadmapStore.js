import { prisma } from '../lib/prisma.js'

const toRoadmapNode = (node) => ({
  id: node.id,
  chapterTitle: node.chapterTitle,
  plotSummary: node.plotSummary,
  linkedCharacterIds: node.linkedCharacterIds ?? [],
})

export async function listRoadmapNodes(userId) {
  const rows = await prisma.roadmapNode.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  return rows.map(toRoadmapNode)
}

export async function createRoadmapNode(userId, input) {
  const row = await prisma.roadmapNode.create({
    data: {
      userId,
      chapterTitle: input.chapterTitle || 'Untitled Chapter',
      plotSummary: input.plotSummary || '',
      linkedCharacterIds: input.linkedCharacterIds ?? [],
    },
  })

  return toRoadmapNode(row)
}

export async function updateRoadmapNode(userId, id, input) {
  const existing = await prisma.roadmapNode.findFirst({ where: { id, userId } })

  if (!existing) {
    const error = new Error('Roadmap node not found.')
    error.status = 404
    throw error
  }

  const row = await prisma.roadmapNode.update({
    where: { id },
    data: {
      chapterTitle: input.chapterTitle ?? existing.chapterTitle,
      plotSummary: input.plotSummary ?? existing.plotSummary,
      linkedCharacterIds: input.linkedCharacterIds ?? existing.linkedCharacterIds,
    },
  })

  return toRoadmapNode(row)
}

export async function deleteRoadmapNode(userId, id) {
  const existing = await prisma.roadmapNode.findFirst({ where: { id, userId } })

  if (!existing) {
    const error = new Error('Roadmap node not found.')
    error.status = 404
    throw error
  }

  await prisma.roadmapNode.delete({ where: { id } })
  return { deleted: true, id }
}
