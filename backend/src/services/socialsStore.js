import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const storageFilePath = path.resolve(__dirname, '../data/socials.json')

const parseJsonSafe = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export async function readSocials() {
  try {
    const content = await fs.readFile(storageFilePath, 'utf8')
    const parsed = parseJsonSafe(content)
    return parsed ?? null
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}

export async function writeSocials(data) {
  const payload = JSON.stringify(data, null, 2)
  await fs.mkdir(path.dirname(storageFilePath), { recursive: true })
  await fs.writeFile(storageFilePath, payload, 'utf8')
}
