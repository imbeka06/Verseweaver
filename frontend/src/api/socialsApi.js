import { getAuthHeaders } from './requestContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchSocialsOverview() {
  const response = await fetch(`${API_BASE_URL}/socials/overview`, {
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to fetch socials overview.')
  }

  return response.json()
}

export async function createSocialPost(post) {
  const response = await fetch(`${API_BASE_URL}/socials/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(post),
  })

  if (!response.ok) {
    throw new Error('Unable to create social post.')
  }

  return response.json()
}

export async function followWriter(followerName) {
  const response = await fetch(`${API_BASE_URL}/socials/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify({ followerName }),
  })

  if (!response.ok) {
    throw new Error('Unable to follow writer.')
  }

  return response.json()
}

export async function sendDirectMessage(message) {
  const response = await fetch(`${API_BASE_URL}/socials/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    throw new Error('Unable to send direct message.')
  }

  return response.json()
}

export async function likeSocialPost(postId) {
  const response = await fetch(`${API_BASE_URL}/socials/posts/${postId}/like`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to like post.')
  }

  return response.json()
}

export async function unlikeSocialPost(postId) {
  const response = await fetch(`${API_BASE_URL}/socials/posts/${postId}/unlike`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Unable to unlike post.')
  }

  return response.json()
}
