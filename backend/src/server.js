import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(cors())
app.use(express.json({ limit: '1mb' }))

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
