import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import workspaceRoutes from './routes/workspaceRoutes.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 4000)
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: frontendOrigin }))
app.use(express.json({ limit: '1mb' }))
app.use('/api', workspaceRoutes)

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'verseweaver-backend',
    timestamp: new Date().toISOString(),
  })
})

app.listen(port, () => {
  console.log(`VerseWeaver backend running on http://localhost:${port}`)
})
