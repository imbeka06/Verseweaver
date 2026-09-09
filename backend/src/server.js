import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'node:http'
import rateLimit from 'express-rate-limit'
import { authenticateRequest } from './middleware/auth.js'
import { ensureUser } from './middleware/ensureUser.js'
import authRoutes from './routes/authRoutes.js'
import charactersRoutes from './routes/charactersRoutes.js'
import manuscriptRoutes from './routes/manuscriptRoutes.js'
import roadmapRoutes from './routes/roadmapRoutes.js'
import socialsRoutes from './routes/socialsRoutes.js'
import { closeSocketServer, initializeSocketServer } from './realtime/socketServer.js'
import workspaceRoutes from './routes/workspaceRoutes.js'
import { prisma } from './lib/prisma.js'
import { disconnectRedis } from './lib/redis.js'
import { closeSocialsQueue } from './queue/socialsQueue.js'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)
const port = Number(process.env.PORT || 4000)
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

// In production behind a reverse proxy, enable `app.set('trust proxy', 1)` so
// the limiter keys on the real client IP instead of the proxy's.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, message: 'Too many requests, please try again later.' },
})

app.use(cors({ origin: frontendOrigin }))
app.use(express.json({ limit: '1mb' }))
app.use('/api', apiLimiter)
app.use('/api', authenticateRequest)
app.use('/api', ensureUser)
app.use('/api', authRoutes)
app.use('/api', workspaceRoutes)
app.use('/api', manuscriptRoutes)
app.use('/api', charactersRoutes)
app.use('/api', roadmapRoutes)
app.use('/api', socialsRoutes)

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'verseweaver-backend',
    timestamp: new Date().toISOString(),
  })
})

async function start() {
  await initializeSocketServer(httpServer, frontendOrigin)

  httpServer.listen(port, () => {
    console.log(`VerseWeaver backend running on http://localhost:${port}`)
  })
}

let shuttingDown = false

async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`[shutdown] received ${signal}, closing gracefully...`)

  const forceExit = setTimeout(() => {
    console.error('[shutdown] timed out after 10s, forcing exit')
    process.exit(1)
  }, 10_000)
  forceExit.unref()

  try {
    await closeSocketServer()
    await new Promise((resolve) => httpServer.close(resolve))
    await closeSocialsQueue()
    await disconnectRedis()
    await prisma.$disconnect()
    console.log('[shutdown] complete')
    process.exit(0)
  } catch (error) {
    console.error('[shutdown] error:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
