import dotenv from 'dotenv'
import { startSocialsWorker } from '../queue/socialsWorker.js'

dotenv.config()

const worker = startSocialsWorker()

if (!worker) {
  console.log('[worker] REDIS_URL is not set. Social worker not started.')
  process.exit(0)
}

console.log('[worker] Socials worker is running...')
