import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL

let redisClient = null

if (redisUrl) {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,
    lazyConnect: true,
  })

  redisClient.on('error', (error) => {
    console.error('[redis] connection error:', error.message)
  })
}

export async function getCache(key) {
  if (!redisClient) return null

  try {
    await redisClient.connect()
  } catch {
    // ignore connect race/ready errors for fallback behavior
  }

  try {
    return await redisClient.get(key)
  } catch {
    return null
  }
}

export async function setCache(key, value, ttlSeconds = 30) {
  if (!redisClient) return false

  try {
    await redisClient.connect()
  } catch {
    // ignore connect race/ready errors for fallback behavior
  }

  try {
    await redisClient.set(key, value, 'EX', ttlSeconds)
    return true
  } catch {
    return false
  }
}

export async function deleteCache(key) {
  if (!redisClient) return false

  try {
    await redisClient.connect()
  } catch {
    // ignore connect race/ready errors for fallback behavior
  }

  try {
    await redisClient.del(key)
    return true
  } catch {
    return false
  }
}
