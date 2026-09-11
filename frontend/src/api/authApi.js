import { getAuthHeaders } from './requestContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to fetch current user.')
  }

  return response.json()
}
