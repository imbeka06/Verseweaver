import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

let io = null
const cleanupFns = []

// Enables cross-instance realtime: with multiple backend instances behind a load
// balancer, the Redis adapter fans socket events out to every instance so a
// client connected to instance A still receives events emitted by instance B.
export async function initializeSocketServer(httpServer, frontendOrigin) {
  const redisUrl = process.env.REDIS_URL

  io = new Server(httpServer, {
    cors: {
      origin: frontendOrigin,
      methods: ['GET', 'POST'],
    },
  })

  if (redisUrl) {
    const pubClient = createClient({ url: redisUrl })
    const subClient = pubClient.duplicate()

    pubClient.on('error', (error) => console.error('[socketio:redis] pub:', error.message))
    subClient.on('error', (error) => console.error('[socketio:redis] sub:', error.message))

    try {
      await Promise.race([
        Promise.all([pubClient.connect(), subClient.connect()]),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('redis connect timeout')), 5000),
        ),
      ])

      io.adapter(createAdapter(pubClient, subClient))
      cleanupFns.push(() => Promise.allSettled([pubClient.quit(), subClient.quit()]))
      console.log('[socketio] Redis adapter enabled (multi-instance realtime)')
    } catch (error) {
      console.error('[socketio] Redis adapter unavailable, using in-memory adapter:', error.message)
      try {
        pubClient.destroy?.()
      } catch {}
      try {
        subClient.destroy?.()
      } catch {}
    }
  }

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

export async function closeSocketServer() {
  if (io) {
    await new Promise((resolve) => io.close(resolve))
    io = null
  }

  await Promise.all(cleanupFns.map((fn) => fn().catch(() => {})))
  cleanupFns.length = 0
}

export function emitSocialEvent(eventName, payload, writerId) {
  if (!io || !writerId) return
  io.to(`socials:${writerId}`).emit(eventName, payload)
}
