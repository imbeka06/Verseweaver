import { getAuthHeaders } from './requestContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchCharacters() {
  const response = await fetch(`${API_BASE_URL}/characters`, {
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to fetch characters.')
  }

  return response.json()
}

export async function createCharacter(character) {
  const response = await fetch(`${API_BASE_URL}/characters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(character),
  })

  if (!response.ok) {
    throw new Error('Unable to create character.')
  }

  return response.json()
}

export async function updateCharacter(id, character) {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(character),
  })

  if (!response.ok) {
    throw new Error('Unable to update character.')
  }

  return response.json()
}

export async function deleteCharacter(id) {
  const response = await fetch(`${API_BASE_URL}/characters/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to delete character.')
  }

  return response.json()
}
