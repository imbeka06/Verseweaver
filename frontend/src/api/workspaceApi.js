const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export async function fetchWorkspace() {
  const response = await fetch(`${API_BASE_URL}/workspace`)

  if (!response.ok) {
    throw new Error('Unable to fetch workspace.')
  }

  const payload = await response.json()
  return payload.workspace
}

export async function saveWorkspace(workspace) {
  const response = await fetch(`${API_BASE_URL}/workspace`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workspace }),
  })

  if (!response.ok) {
    throw new Error('Unable to save workspace.')
  }

  const payload = await response.json()
  return payload.workspace
}
