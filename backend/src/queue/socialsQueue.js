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
  })

  return true
}
