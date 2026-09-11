// Phase C render check: server-renders the chat/DM component and asserts the
// structure of what it produces (bubbles, ordering, day separator, composer,
// failed-retry affordance, empty state). Runs through the Vite SSR loader.
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import SocialsWorkspace from '../src/features/socials/SocialsWorkspace.jsx'

const noop = async () => true
const now = Date.now()
const iso = (offsetMs) => new Date(now - offsetMs).toISOString()

let passed = 0
let failed = 0
const check = (name, cond) => {
  if (cond) {
    passed += 1
    console.log(`  ok   ${name}`)
  } else {
    failed += 1
    console.log(`  FAIL ${name}`)
  }
}

const baseSocials = {
  profile: { writerId: 'u1', displayName: 'Anya Voss', handle: '@Anya.Voss', role: 'Archivist Mage' },
  stats: { followers: 2000, following: 300 },
  statuses: [],
  highlights: [],
  followers: [],
  posts: [],
  messages: [],
}

const render = (messages) =>
  renderToStaticMarkup(
    createElement(SocialsWorkspace, {
      socials: { ...baseSocials, messages },
      role: 'owner',
      authUserId: 'u1',
      onCreatePost: noop,
      onFollowWriter: noop,
      onSendMessage: noop,
      onAppendMessage: noop,
      onRetryMessage: noop,
      onRefreshSocials: noop,
    }),
  )

console.log('Phase C chat UI render verification')

// ---- populated thread ------------------------------------------------------
const html = render([
  { id: 'm3', senderName: 'Guest Reader', text: 'finished chapter two', createdAt: iso(90000), read: false },
  { id: 'm2', senderName: 'Anya Voss', text: 'glad you liked it', createdAt: iso(60000), read: false },
  { id: 'm1', senderName: 'Anya Voss', text: 'that one failed', createdAt: iso(30000), read: false, failed: true },
])

check('renders the Direct Messages panel', html.includes('Direct Messages'))
check('shows a day separator', html.includes('Today'))
check('renders every message body', html.includes('finished chapter two') && html.includes('glad you liked it') && html.includes('that one failed'))
check(
  'renders oldest first (chat order)',
  html.indexOf('finished chapter two') < html.indexOf('glad you liked it') &&
    html.indexOf('glad you liked it') < html.indexOf('that one failed'),
)
check('own messages align right', html.includes('flex-row-reverse'))
check('incoming messages show the sender name', html.includes('Guest Reader'))
check('failed message offers retry', html.includes('Failed') && html.includes('retry'))
check('realtime badge falls back to Polling without a socket', html.includes('Polling'))
check('composer shows the 2000-char budget', html.includes('/2000') || html.includes('/2,000'))
check('composer explains Enter to send', html.includes('Enter to send'))

// ---- empty state -----------------------------------------------------------
const emptyHtml = render([])
check('empty thread shows the empty state', emptyHtml.includes('No messages yet'))
check('empty state hides the day separator', !emptyHtml.includes('Today'))

// ---- sending state ---------------------------------------------------------
const sendingHtml = render([
  { id: 'pending-1', senderName: 'Anya Voss', text: 'still going', createdAt: iso(1000), sending: true },
])
check('pending message shows as sending', sendingHtml.includes('Sending'))

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
