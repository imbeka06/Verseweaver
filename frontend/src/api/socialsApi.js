import { buildAccessHeaders } from './requestContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchSocialsOverview(accessContext = {}) {
  const response = await fetch(`${API_BASE_URL}/socials/overview`, {
    headers: buildAccessHeaders(accessContext),
  })

  if (!response.ok) {
    throw new Error('Unable to fetch socials overview.')
  }

  const payload = await response.json()
  return payload
}

export async function createSocialPost(post, accessContext = {}) {
  const response = await fetch(`${API_BASE_URL}/socials/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAccessHeaders(accessContext),
    },
    body: JSON.stringify(post),
  })

  if (!response.ok) {
    throw new Error('Unable to create social post.')
  }

  const payload = await response.json()
  return payload.socials
}

export async function followWriter(followerName, accessContext = {}) {
  const response = await fetch(`${API_BASE_URL}/socials/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAccessHeaders(accessContext),
    },
    body: JSON.stringify({ followerName }),
  })

  if (!response.ok) {
    throw new Error('Unable to follow writer.')
  }

  const payload = await response.json()
  return payload.socials
}

export async function sendDirectMessage(message, accessContext = {}) {
  const response = await fetch(`${API_BASE_URL}/socials/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAccessHeaders(accessContext),
    },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    throw new Error('Unable to send direct message.')
  }

  const payload = await response.json()
  return payload.socials
}
