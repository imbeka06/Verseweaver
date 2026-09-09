import { Worker } from 'bullmq'

const redisUrl = process.env.REDIS_URL

export function startSocialsWorker() {
  if (!redisUrl) {
    return null
  }

  const worker = new Worker(
    'socials-jobs',
    async (job) => {
      switch (job.name) {
        case 'social-post-created': {
          // Post-processing hook: fan-out to followers, notifications, search
          // indexing. Add integrations here as the product grows.
          return { indexed: true, postId: job.data.id }
        }
        default:
          return { ignored: true }
      }
    },
    {
      connection: {
        url: redisUrl,
      },
      concurrency: 5,
    },
  )

  worker.on('completed', (job) => {
    console.log(`[queue] completed ${job.name} (${job.id})`)
  })

  worker.on('failed', (job, error) => {
    console.error(`[queue] failed ${job?.name} (${job?.id}):`, error.message)
  })

  worker.on('error', (error) => {
    console.error('[queue] worker error:', error.message)
  })

  return worker
}
