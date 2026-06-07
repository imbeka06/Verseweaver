import { Worker } from 'bullmq'

const redisUrl = process.env.REDIS_URL

export function startSocialsWorker() {
  if (!redisUrl) {
    return null
  }

  const worker = new Worker(
    'socials-jobs',
    async (job) => {
      if (job.name === 'social-post-created') {
        // Placeholder for heavy async tasks (fan-out, notifications, indexing).
        return { indexed: true, postId: job.data.id }
      }

      return { ignored: true }
    },
    {
      connection: {
        url: redisUrl,
      },
    },
  )

  worker.on('failed', (job, error) => {
    console.error(`[queue] job failed (${job?.name}):`, error.message)
  })

  return worker
}
