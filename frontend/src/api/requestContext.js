export function buildAccessHeaders({ role, userId }) {
  const headers = {}

  if (role) {
    headers['x-vw-role'] = role
  }

  if (userId) {
    headers['x-vw-user-id'] = userId
  }

  return headers
}
