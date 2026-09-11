// Runs the frontend smoke checks through Vite's SSR module loader, so modules
// that read import.meta.env behave exactly as they do in the browser.
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))

const scripts = ['/scripts/phaseB.smoke.mjs', '/scripts/phaseC.chat.mjs']

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
})

try {
  for (const script of scripts) {
    await server.ssrLoadModule(script)
  }
} finally {
  await server.close()
}
