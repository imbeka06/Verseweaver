import { getAuthHeaders } from './requestContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchRoadmap() {
  const response = await fetch(`${API_BASE_URL}/roadmap`, {
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to fetch roadmap.')
  }

  return response.json()
}

export async function createRoadmapNode(node) {
  const response = await fetch(`${API_BASE_URL}/roadmap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(node),
  })

  if (!response.ok) {
    throw new Error('Unable to create roadmap node.')
  }

  return response.json()
}

export async function updateRoadmapNode(id, node) {
  const response = await fetch(`${API_BASE_URL}/roadmap/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(node),
  })

  if (!response.ok) {
    throw new Error('Unable to update roadmap node.')
  }

  return response.json()
}

export async function deleteRoadmapNode(id) {
  const response = await fetch(`${API_BASE_URL}/roadmap/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to delete roadmap node.')
  }

  return response.json()
}
