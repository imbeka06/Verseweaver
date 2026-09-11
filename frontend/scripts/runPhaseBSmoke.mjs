// Runs frontend/scripts/phaseB.smoke.mjs through Vite's SSR module loader, so
// the store's api modules can read import.meta.env exactly as in the browser.
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))

const server = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
})

try {
  await server.ssrLoadModule('/scripts/phaseB.smoke.mjs')
} finally {
  await server.close()
}
