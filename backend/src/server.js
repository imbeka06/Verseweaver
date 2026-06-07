import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import http from 'node:http'
import socialsRoutes from './routes/socialsRoutes.js'
import { initializeSocketServer } from './realtime/socketServer.js'
import workspaceRoutes from './routes/workspaceRoutes.js'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)
const port = Number(process.env.PORT || 4000)
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: frontendOrigin }))
app.use(express.json({ limit: '1mb' }))
app.use('/api', workspaceRoutes)
app.use('/api', socialsRoutes)

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'verseweaver-backend',
    timestamp: new Date().toISOString(),
  })
})

initializeSocketServer(httpServer, frontendOrigin)

httpServer.listen(port, () => {
  console.log(`VerseWeaver backend running on http://localhost:${port}`)
})
