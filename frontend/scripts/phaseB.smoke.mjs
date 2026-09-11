// Phase B smoke test: exercises the store's backend-wired CRUD actions against
// a mocked fetch. Run via scripts/runPhaseBSmoke.mjs (Vite SSR loader), because
// the store's api modules read import.meta.env at module scope.
//
// Note: the store is seeded with demo data (initialCharacters etc.), so
// assertions look items up by server-assigned id rather than index.
import useVerseStore from '../src/store/useVerseStore.js'

const store = useVerseStore
const { getState } = store

// ---- fake backend state ---------------------------------------------------
const fakeState = {
  characters: [],
  nodes: [],
  notebooks: [],
  chapters: [],
  messages: [],
  failCharacterCreate: false,
  failChapterUpdate: false,
  failMessage: false,
  holdMessage: false,
  releaseMessage: null,
  signalMessageRequest: null,
}
let charSeq = 0
let nodeSeq = 0
let nbSeq = 0
let chSeq = 0
let msgSeq = 0

const json = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() {
    return body
  },
})

global.fetch = async (url, init = {}) => {
  const path = String(url).replace('http://localhost:4000/api', '')
  const method = init.method || 'GET'
  const body = init.body ? JSON.parse(init.body) : {}
  let b
  let status = 200

  if (method === 'POST' && path === '/characters') {
    if (fakeState.failCharacterCreate) {
      status = 500
      b = { ok: false, message: 'boom' }
    } else {
      charSeq += 1
      const character = { id: `char-${charSeq}`, ...body }
      fakeState.characters.push(character)
      b = { ok: true, character }
    }
  } else if (method === 'PATCH' && path.startsWith('/characters/')) {
    const id = path.split('/').pop()
    const existing = fakeState.characters.find((c) => c.id === id)
    const character = { ...existing, ...body }
    fakeState.characters = fakeState.characters.map((c) => (c.id === id ? character : c))
    b = { ok: true, character }
  } else if (method === 'POST' && path === '/roadmap') {
    nodeSeq += 1
    const node = { id: `node-${nodeSeq}`, ...body }
    fakeState.nodes.push(node)
    b = { ok: true, node }
  } else if (method === 'POST' && path === '/manuscript/notebooks') {
    nbSeq += 1
    chSeq += 1
    const nbId = `nb-${nbSeq}`
    const chId = `ch-${chSeq}`
    const chapter = {
      id: chId,
      notebookId: nbId,
      title: body.firstChapterTitle || 'Chapter 1',
      content: '',
      wordCount: 0,
      version: 0,
      lastEditedAt: null,
    }
    const notebook = { id: nbId, name: body.name, chapterIds: [chId] }
    fakeState.notebooks.push(notebook)
    fakeState.chapters.push(chapter)
    b = { ok: true, notebook, chapters: [chapter] }
  } else if (method === 'POST' && path.match(/^\/manuscript\/notebooks\/[^/]+\/chapters$/)) {
    chSeq += 1
    const chId = `ch-${chSeq}`
    const chapter = {
      id: chId,
      notebookId: path.split('/')[3],
      title: body.title || 'Untitled Chapter',
      content: '',
      wordCount: 0,
      version: 0,
      lastEditedAt: null,
    }
    fakeState.chapters.push(chapter)
    b = { ok: true, chapter }
  } else if (method === 'POST' && path === '/socials/messages') {
    if (fakeState.failMessage) {
      status = 500
      b = { ok: false, message: 'message failed' }
    } else {
      msgSeq += 1
      const message = {
        id: `msg-${msgSeq}`,
        senderName: body.senderName,
        text: body.text,
        createdAt: new Date().toISOString(),
        read: false,
      }
      fakeState.messages.push(message)
      b = { ok: true, message }

      if (fakeState.holdMessage) {
        fakeState.holdMessage = false
        // Tell the test the request has arrived, then hold the response open so
        // it can inspect the optimistic (still "sending") state.
        fakeState.signalMessageRequest?.()
        fakeState.signalMessageRequest = null

        return new Promise((resolve) => {
          fakeState.releaseMessage = () => resolve(json(b, status))
        })
      }
    }
  } else if (method === 'PATCH' && path.match(/^\/manuscript\/chapters\/[^/]+$/)) {
    if (fakeState.failChapterUpdate) {
      status = 500
      b = { ok: false, message: 'network down' }
    } else {
      const id = path.split('/').pop()
      const existing = fakeState.chapters.find((c) => c.id === id)
      const plain = (body.content || '').replace(/<[^>]*>/g, ' ')
      const wordCount = plain.trim().split(/\s+/).filter(Boolean).length
      const chapter = {
        ...existing,
        title: body.title ?? existing.title,
        content: body.content ?? existing.content,
        wordCount,
        version: existing.version + 1,
        lastEditedAt: new Date().toISOString(),
      }
      fakeState.chapters = fakeState.chapters.map((c) => (c.id === id ? chapter : c))
      b = { ok: true, chapter }
    }
  } else {
    status = 404
    b = { ok: false, message: `unhandled: ${method} ${path}` }
  }

  return json(b, status)
}

// ---- assertions -----------------------------------------------------------
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

const resetStore = () => store.setState(store.getInitialState())

console.log('Phase B store wiring verification')
console.log('--- characters ---')
const addCharOk = await getState().addCharacter({ name: 'Test Mage', role: 'Mage' })
check('addCharacter returns true', addCharOk === true)
const createdChar = getState().characters.find((c) => c.id === 'char-1')
check(
  'character persisted with server id',
  createdChar && createdChar.name === 'Test Mage' && createdChar.role === 'Mage',
)
check('no sync error after success', getState().sync.lastError === null)

fakeState.failCharacterCreate = true
const addCharFail = await getState().addCharacter({ name: 'Nope', role: 'X' })
fakeState.failCharacterCreate = false
const charsAfterFail = getState().characters
check('addCharacter failure returns false', addCharFail === false)
check(
  'addCharacter failure keeps list unchanged',
  charsAfterFail.length === 7 && !charsAfterFail.some((c) => c.name === 'Nope'),
)
check('addCharacter failure sets sync.lastError', getState().sync.lastError === 'Unable to create character.')

const statusOk = await getState().updateCharacterStatus('char-1', 'Archived')
check(
  'updateCharacterStatus persists status',
  statusOk === true && getState().characters.find((c) => c.id === 'char-1').status === 'Archived',
)

console.log('--- roadmap ---')
const addNodeOk = await getState().addRoadmapNode({
  chapterTitle: 'Chapter 2: Test',
  plotSummary: 'Something happens',
  linkedCharacterIds: ['char-1'],
})
check('addRoadmapNode returns true', addNodeOk === true)
const newNode = getState().roadmapNodes.find((n) => n.id === 'node-1')
check(
  'roadmap node persisted with server id',
  newNode && newNode.chapterTitle === 'Chapter 2: Test' && newNode.linkedCharacterIds.includes('char-1'),
)
check('seed nodes kept alongside', getState().roadmapNodes.length === 4)

console.log('--- manuscript ---')
resetStore()
const nbOk = await getState().createNotebook('My Book')
const ms = getState().manuscript
const nb1 = ms.notebooks.find((n) => n.id === 'nb-1')
check('createNotebook returns true', nbOk === true)
check('notebook appended', nb1 && nb1.name === 'My Book' && ms.notebooks.length === 2)
check('notebook chapter listed', nb1.chapterIds.length === 1 && nb1.chapterIds[0] === 'ch-1')
check('active notebook/chapter selected', ms.activeNotebookId === 'nb-1' && ms.activeChapterId === 'ch-1')
check('editor shows first chapter', ms.title === 'Chapter 1' && ms.content === '')

const chOk = await getState().createChapter('Chapter 2: Ashfall')
const ms2 = getState().manuscript
check('createChapter returns true', chOk === true)
const ch2 = ms2.chapters.find((c) => c.id === 'ch-2')
check(
  'chapter appended and active',
  ch2 && ch2.title === 'Chapter 2: Ashfall' && ms2.activeChapterId === 'ch-2',
)
check('notebook chapterIds updated', ms2.notebooks.find((n) => n.id === 'nb-1').chapterIds.length === 2)

console.log('--- saveManuscript ---')
getState().updateManuscript({ title: 'Chapter 2: Ashfall', content: '<p>hello world</p>' })
const saveOk = await getState().saveManuscript()
const ms3 = getState().manuscript
check('saveManuscript returns true', saveOk === true)
check('cloudStatus Synced To Backend', getState().sync.cloudStatus === 'Synced To Backend')
check('version bumped by server', ms3.chapters.find((c) => c.id === 'ch-2').version === 1)
check('wordCount reconciled', ms3.wordCount === 2)
check('lastSavedAt stamped', ms3.lastSavedAt !== null)
check('expectedVersion sent (PATCH body carried version 0)', fakeState.chapters.find((c) => c.id === 'ch-2').version === 1)

fakeState.failChapterUpdate = true
const saveFail = await getState().saveManuscript()
fakeState.failChapterUpdate = false
check('saveManuscript failure returns false', saveFail === false)
check('cloudStatus Sync Failed', getState().sync.cloudStatus === 'Sync Failed')
check('lastError set on save failure', getState().sync.lastError === 'Unable to update chapter.')

console.log('--- chat: optimistic send, live append, retry ---')
resetStore()
fakeState.messages = []

// Optimistic: hold the response open and assert the pending bubble exists.
// (The request fires after an async hop, so wait for the mock to see it.)
fakeState.holdMessage = true
const messageRequestArrived = new Promise((resolve) => {
  fakeState.signalMessageRequest = resolve
})
const sendPromise = getState().sendSocialMessage({ senderName: 'Test Mage', text: 'hello there' })
await messageRequestArrived
const pending = getState().socials.messages[0]
check(
  'pending bubble appears before the server responds',
  pending && pending.id.startsWith('pending-') && pending.sending === true && pending.text === 'hello there',
)
check('pending bubble is newest-first', getState().socials.messages.length === 1)

fakeState.releaseMessage()
const sendOk = await sendPromise
const confirmed = getState().socials.messages[0]
check('sendSocialMessage resolves true', sendOk === true)
check(
  'pending bubble replaced by server message',
  confirmed.id === 'msg-1' && confirmed.sending === false && confirmed.failed === false,
)
check('no duplicate after confirm', getState().socials.messages.length === 1)

// Live append (socket path) + dedupe when the same message arrives twice.
getState().appendSocialMessage({ id: 'live-1', senderName: 'Follower', text: 'incoming', createdAt: new Date().toISOString(), read: false })
getState().appendSocialMessage({ id: 'live-1', senderName: 'Follower', text: 'incoming', createdAt: new Date().toISOString(), read: false })
const afterAppend = getState().socials.messages
check('live append adds the incoming message', afterAppend.some((m) => m.id === 'live-1'))
check('live append is deduped by id', afterAppend.filter((m) => m.id === 'live-1').length === 1)
check('newest message is first', afterAppend[0].id === 'live-1' && afterAppend[1].id === 'msg-1')

// Failure marks the bubble retryable; retry re-sends and confirms.
fakeState.failMessage = true
const failOk = await getState().sendSocialMessage({ senderName: 'Test Mage', text: 'will fail' })
const failedMessage = getState().socials.messages.find((m) => m.text === 'will fail')
check('sendSocialMessage resolves false on failure', failOk === false)
check('failed bubble is flagged for retry', failedMessage.failed === true && failedMessage.sending === false)

fakeState.failMessage = false
const retryOk = await getState().retrySocialMessage(failedMessage.id)
const retried = getState().socials.messages.find((m) => m.text === 'will fail')
check('retrySocialMessage resolves true', retryOk === true)
check('retried bubble is confirmed with a server id', retried.id === 'msg-2' && retried.failed === false)
check('retry did not duplicate the bubble', getState().socials.messages.filter((m) => m.text === 'will fail').length === 1)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)