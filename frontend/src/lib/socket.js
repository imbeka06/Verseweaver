import { io } from 'socket.io-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

// The socket server runs on the API host, not under /api.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, '')

export const SOCIALS_EVENTS = {
  messageCreated: 'socials:message-created',
  postCreated: 'socials:post-created',
  followerAdded: 'socials:follower-added',
}

let socket = null
let joinedWriterId = null

// Re-joins the writer's room on every (re)connect, so a network blip or a token
// refresh doesn't silently stop live delivery.
const joinRoom = () => {
  if (socket && joinedWriterId) {
    socket.emit('socials:join', { writerId: joinedWriterId })
  }
}

export function connectSocialsSocket(writerId) {
  if (!writerId) return null

  if (!socket) {
    socket = io(SOCKET_URL, { transports: ['websocket'] })
    socket.on('connect', joinRoom)
  }

  joinedWriterId = writerId
  if (socket.connected) joinRoom()

  return socket
}

export function disconnectSocialsSocket() {
  if (!socket) return

  socket.disconnect()
  socket = null
  joinedWriterId = null
}

export const isSocketConfigured = () => Boolean(SOCKET_URL)
