import { Queue } from 'bullmq'

const redisUrl = process.env.REDIS_URL

let socialsQueue = null

if (redisUrl) {
  socialsQueue = new Queue('socials-jobs', {
    connection: {
      url: redisUrl,
    },
  })
}

export async function enqueueSocialPostCreated(post) {
  if (!socialsQueue) return false

  await socialsQueue.add('social-post-created', post, {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })

  return true
}

export async function closeSocialsQueue() {
  if (!socialsQueue) return

  await socialsQueue.close()
  socialsQueue = null
}
