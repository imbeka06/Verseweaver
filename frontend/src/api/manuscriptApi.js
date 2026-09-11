import { getAuthHeaders } from './requestContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchManuscript() {
  const response = await fetch(`${API_BASE_URL}/manuscript`, {
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to fetch manuscript.')
  }

  return response.json()
}

export async function createNotebook(payload) {
  const response = await fetch(`${API_BASE_URL}/manuscript/notebooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Unable to create notebook.')
  }

  return response.json()
}

export async function renameNotebook(notebookId, payload) {
  const response = await fetch(`${API_BASE_URL}/manuscript/notebooks/${notebookId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Unable to rename notebook.')
  }

  return response.json()
}

export async function deleteNotebook(notebookId) {
  const response = await fetch(`${API_BASE_URL}/manuscript/notebooks/${notebookId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to delete notebook.')
  }

  return response.json()
}

export async function createChapter(notebookId, payload) {
  const response = await fetch(`${API_BASE_URL}/manuscript/notebooks/${notebookId}/chapters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Unable to create chapter.')
  }

  return response.json()
}

export async function updateChapter(chapterId, payload) {
  const response = await fetch(`${API_BASE_URL}/manuscript/chapters/${chapterId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Unable to update chapter.')
  }

  return response.json()
}

export async function deleteChapter(chapterId) {
  const response = await fetch(`${API_BASE_URL}/manuscript/chapters/${chapterId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to delete chapter.')
  }

  return response.json()
}
