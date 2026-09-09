import { prisma } from '../lib/prisma.js'

const deriveWordCount = (html) => {
  const plain = (html ?? '').replace(/<[^>]*>/g, ' ')
  return plain
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

const toChapter = (chapter) => ({
  id: chapter.id,
  notebookId: chapter.notebookId,
  title: chapter.title,
  content: chapter.content,
  wordCount: chapter.wordCount,
  version: chapter.version,
  lastEditedAt: chapter.lastEditedAt?.toISOString() ?? null,
})

const toNotebook = (notebook) => ({
  id: notebook.id,
  name: notebook.name,
  chapterIds: notebook.chapters.map((chapter) => chapter.id),
})

export async function readManuscript(userId) {
  const notebooks = await prisma.notebook.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: { chapters: { orderBy: { createdAt: 'asc' } } },
  })

  return {
    notebooks: notebooks.map(toNotebook),
    chapters: notebooks.flatMap((notebook) => notebook.chapters.map(toChapter)),
  }
}

export async function createNotebook(userId, { name, firstChapterTitle }) {
  const notebook = await prisma.notebook.create({
    data: {
      userId,
      name: (name || '').trim() || 'Notebook',
      chapters: firstChapterTitle
        ? { create: [{ title: firstChapterTitle.trim(), content: '' }] }
        : undefined,
    },
    include: { chapters: { orderBy: { createdAt: 'asc' } } },
  })

  return { notebook: toNotebook(notebook), chapters: notebook.chapters.map(toChapter) }
}

export async function renameNotebook(userId, notebookId, { name }) {
  const existing = await prisma.notebook.findFirst({ where: { id: notebookId, userId } })

  if (!existing) {
    const error = new Error('Notebook not found.')
    error.status = 404
    throw error
  }

  const notebook = await prisma.notebook.update({
    where: { id: notebookId },
    data: { name: (name ?? '').trim() || existing.name },
    include: { chapters: { orderBy: { createdAt: 'asc' } } },
  })

  return { notebook: toNotebook(notebook), chapters: notebook.chapters.map(toChapter) }
}

export async function deleteNotebook(userId, notebookId) {
  const existing = await prisma.notebook.findFirst({ where: { id: notebookId, userId } })

  if (!existing) {
    const error = new Error('Notebook not found.')
    error.status = 404
    throw error
  }

  await prisma.notebook.delete({ where: { id: notebookId } })
  return { deleted: true, id: notebookId }
}

export async function createChapter(userId, notebookId, { title, content }) {
  const notebook = await prisma.notebook.findFirst({ where: { id: notebookId, userId } })

  if (!notebook) {
    const error = new Error('Notebook not found.')
    error.status = 404
    throw error
  }

  const chapterContent = content ?? ''
  const chapter = await prisma.chapter.create({
    data: {
      notebookId,
      title: (title || '').trim() || 'Untitled Chapter',
      content: chapterContent,
      wordCount: deriveWordCount(chapterContent),
    },
  })

  return toChapter(chapter)
}

export async function getChapter(userId, chapterId) {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, notebook: { userId } },
  })

  if (!chapter) {
    const error = new Error('Chapter not found.')
    error.status = 404
    throw error
  }

  return toChapter(chapter)
}

// Optimistic concurrency: `expectedVersion` is the version the client last read.
// Rejects stale writes with 409 so concurrent editors can't clobber each other.
export async function updateChapter(userId, chapterId, { title, content, expectedVersion }) {
  return prisma.$transaction(async (tx) => {
    const chapter = await tx.chapter.findFirst({
      where: { id: chapterId, notebook: { userId } },
    })

    if (!chapter) {
      const error = new Error('Chapter not found.')
      error.status = 404
      throw error
    }

    if (expectedVersion != null && expectedVersion !== chapter.version) {
      const error = new Error('Chapter changed since it was loaded. Reload and try again.')
      error.status = 409
      throw error
    }

    const nextContent = content ?? chapter.content
    const updated = await tx.chapter.update({
      where: { id: chapterId },
      data: {
        title: title ?? chapter.title,
        content: nextContent,
        wordCount: deriveWordCount(nextContent),
        lastEditedAt: new Date(),
        version: { increment: 1 },
      },
    })

    return toChapter(updated)
  })
}

export async function deleteChapter(userId, chapterId) {
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, notebook: { userId } },
  })

  if (!chapter) {
    const error = new Error('Chapter not found.')
    error.status = 404
    throw error
  }

  await prisma.chapter.delete({ where: { id: chapterId } })
  return { deleted: true, id: chapterId }
}
