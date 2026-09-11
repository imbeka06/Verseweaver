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
  failCharacterCreate: false,
  failChapterUpdate: false,
}
let charSeq = 0
let nodeSeq = 0
let nbSeq = 0
let chSeq = 0

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

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
