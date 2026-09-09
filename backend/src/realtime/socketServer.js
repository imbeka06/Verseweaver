import { Server } from 'socket.io'

let io = null

export function initializeSocketServer(httpServer, frontendOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: frontendOrigin,
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    socket.on('socials:join', (payload) => {
      const writerId = payload?.writerId
      if (writerId) {
        socket.join(`socials:${writerId}`)
      }
    })

    socket.on('disconnect', () => {
      // Connection lifecycle placeholder for metrics/hooks.
    })
  })

  return io
}

export function emitSocialEvent(eventName, payload, writerId) {
  if (!io || !writerId) return
  io.to(`socials:${writerId}`).emit(eventName, payload)
}
