import dotenv from 'dotenv'
import { startSocialsWorker } from '../queue/socialsWorker.js'

dotenv.config()

const worker = startSocialsWorker()

if (!worker) {
  console.log('[worker] REDIS_URL is not set. Social worker not started.')
  process.exit(0)
}

console.log('[worker] Socials worker is running...')

async function shutdown(signal) {
  console.log(`[worker] received ${signal}, closing...`)
  try {
    await worker.close()
  } catch {
    // ignore — process is exiting anyway
  }
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
