import { prisma } from '../lib/prisma.js'

const toCharacter = (character) => ({
  id: character.id,
  name: character.name,
  role: character.role,
  category: character.category,
  style: character.style,
  avatarImg: character.avatarImg,
  traits: character.traits ?? [],
  backstory: character.backstory,
  status: character.status,
})

export async function listCharacters(userId) {
  const rows = await prisma.character.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  return rows.map(toCharacter)
}

export async function createCharacter(userId, input) {
  const row = await prisma.character.create({
    data: {
      userId,
      name: input.name || 'Unnamed Character',
      role: input.role || '',
      category: input.category || 'Fiction',
      style: input.style || 'Animation',
      avatarImg: input.avatarImg || null,
      traits: input.traits ?? [],
      backstory: input.backstory || '',
      status: input.status || 'Active',
    },
  })

  return toCharacter(row)
}

export async function updateCharacter(userId, id, input) {
  const existing = await prisma.character.findFirst({ where: { id, userId } })

  if (!existing) {
    const error = new Error('Character not found.')
    error.status = 404
    throw error
  }

  const row = await prisma.character.update({
    where: { id },
    data: {
      name: input.name ?? existing.name,
      role: input.role ?? existing.role,
      category: input.category ?? existing.category,
      style: input.style ?? existing.style,
      avatarImg: input.avatarImg ?? existing.avatarImg,
      traits: input.traits ?? existing.traits,
      backstory: input.backstory ?? existing.backstory,
      status: input.status ?? existing.status,
    },
  })

  return toCharacter(row)
}

export async function deleteCharacter(userId, id) {
  const existing = await prisma.character.findFirst({ where: { id, userId } })

  if (!existing) {
    const error = new Error('Character not found.')
    error.status = 404
    throw error
  }

  await prisma.character.delete({ where: { id } })
  return { deleted: true, id }
}
