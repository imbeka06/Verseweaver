import { getAuthHeaders } from './requestContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchWorkspace() {
  const response = await fetch(`${API_BASE_URL}/workspace`, {
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to fetch workspace.')
  }

  return response.json()
}

export async function saveWorkspace(workspace, version) {
  const response = await fetch(`${API_BASE_URL}/workspace`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify({ workspace, version }),
  })

  if (!response.ok) {
    throw new Error('Unable to save workspace.')
  }

  return response.json()
}
