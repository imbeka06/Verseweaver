import { create } from 'zustand'
import {
  createSocialPost,
  fetchSocialsOverview,
  followWriter as followWriterApi,
  sendDirectMessage,
} from '../api/socialsApi'
import { fetchWorkspace, saveWorkspace } from '../api/workspaceApi'

const AUTH_STORAGE_KEY = 'verseweaver-auth'
const ACCOUNTS_STORAGE_KEY = 'verseweaver-accounts'

const isBrowser = typeof window !== 'undefined'

const readJsonStorage = (key, fallback) => {
  if (!isBrowser) return fallback

  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const persistJsonStorage = (key, value) => {
  if (!isBrowser) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

const initialCharacters = [
  {
    id: 'anya',
    name: 'Anya Voss',
    role: 'Archivist Mage',
    category: 'Fiction',
    style: 'Animation',
    avatarImg:
      'https://images.unsplash.com/photo-1631897451010-5904f3071328?auto=format&fit=crop&w=700&q=80',
    traits: ['Intuitive', 'Relentless', 'Empathic'],
    backstory:
      'Raised by mapkeepers of the drowned libraries, Anya can thread memory into tangible illusions.',
    status: 'Active',
  },
  {
    id: 'kaelen',
    name: 'Kaelen Dray',
    role: 'Exiled Strategist',
    category: 'Fiction',
    style: 'Animation',
    avatarImg:
      'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=700&q=80',
    traits: ['Analytical', 'Reserved', 'Loyal'],
    backstory:
      'A former imperial tactician who now designs rebellions from coded verses hidden in trade routes.',
    status: 'Locked Arc',
  },
  {
    id: 'elara',
    name: 'Elara Nyx',
    role: 'Shadow Ranger',
    category: 'Fiction',
    style: 'Animation',
    avatarImg:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80',
    traits: ['Adaptive', 'Bold', 'Guarded'],
    backstory:
      'Elara patrols the obsidian borderlands and tracks emotional signatures left by forbidden spells.',
    status: 'In Revision',
  },
  {
    id: 'soren',
    name: 'Soren Vale',
    role: 'Oracle Engineer',
    category: 'Fiction',
    style: 'Animation',
    avatarImg:
      'https://images.unsplash.com/photo-1525875975471-999f65706a10?auto=format&fit=crop&w=700&q=80',
    traits: ['Inventive', 'Chaotic', 'Visionary'],
    backstory:
      'Soren builds prophetic engines that model future plot branches before they happen in-world.',
    status: 'Drafting',
  },
  {
    id: 'mara',
    name: 'Mara Quinn',
    role: 'Field Journalist',
    category: 'Real',
    style: 'Live Action',
    avatarImg:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80',
    traits: ['Curious', 'Brave', 'Observant'],
    backstory:
      'Mara documents mythic events as they unfold, bridging grounded realism and fantastic lore.',
    status: 'Active',
  },
  {
    id: 'adrian',
    name: 'Adrian Cole',
    role: 'Historian',
    category: 'Real',
    style: 'Live Action',
    avatarImg:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
    traits: ['Methodical', 'Calm', 'Insightful'],
    backstory:
      'Adrian archives true war records and cross-checks every fantastical claim against eyewitness accounts.',
    status: 'Drafting',
  },
]

const initialRoadmapNodes = [
  {
    id: 'node-01',
    chapterTitle: 'Chapter 01: Ashfall Overture',
    plotSummary:
      'A celestial breach opens over Aethelia, forcing Anya and Kaelen into a reluctant alliance.',
    linkedCharacterIds: ['anya', 'kaelen'],
  },
  {
    id: 'node-02',
    chapterTitle: 'Chapter 07: Ember Cartography',
    plotSummary:
      'Elara uncovers a hidden atlas that reveals the empire has rewritten entire districts of memory.',
    linkedCharacterIds: ['elara', 'anya'],
  },
  {
    id: 'node-03',
    chapterTitle: 'Chapter 12: The Ninth Script',
    plotSummary:
      'Soren decodes an impossible timeline and discovers one of the heroes is a manufactured legend.',
    linkedCharacterIds: ['soren', 'kaelen', 'anya'],
  },
]

const initialWorkspace = {
  activeTab: 'Dashboard',
  selectedCharacterId: 'anya',
  selectedRoadmapNodeId: 'node-01',
}

const initialSocials = {
  profile: {
    writerId: 'anya',
    displayName: 'Anya Voss',
    handle: '@Anya.Voss',
    role: 'Archivist Mage',
    bio: 'Call the action now what followers see.',
  },
  stats: {
    followers: 2000,
    following: 300,
  },
  statuses: [],
  highlights: [],
  followers: [],
  posts: [],
  messages: [],
}

const initialManuscript = {
  title: 'Aethelia Chronicle',
  content:
    '<h2>Chapter 1: Ashfall Overture</h2><p>The night sky cracked open like a lantern of molten glass. Anya pressed her palm against the atlas and felt the city shift beneath her feet.</p>',
  lastSavedAt: null,
  wordCount: 29,
  writingMode: 'Flow',
  notebooks: [
    {
      id: 'notebook-main',
      name: 'Main Notebook',
      chapterIds: ['chapter-1'],
    },
  ],
  chapters: [
    {
      id: 'chapter-1',
      notebookId: 'notebook-main',
      title: 'Chapter 1: Ashfall Overture',
      content:
        '<h2>Chapter 1: Ashfall Overture</h2><p>The night sky cracked open like a lantern of molten glass. Anya pressed her palm against the atlas and felt the city shift beneath her feet.</p>',
      lastEditedAt: null,
    },
  ],
  activeNotebookId: 'notebook-main',
  activeChapterId: 'chapter-1',
}

const initialSync = {
  localDraftVersion: 1,
  cloudStatus: 'Not Synced',
  lastError: null,
}

const initialAuth = {
  isAuthenticated: false,
  mode: 'login',
  user: null,
  error: null,
  role: 'guest',
  surfaceMode: 'socials',
}

const persistedAuth = readJsonStorage(AUTH_STORAGE_KEY, initialAuth)

const deriveWordCount = (htmlContent) => {
  const plainText = (htmlContent ?? '').replace(/<[^>]*>/g, ' ')
  return plainText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

const getAccessContext = (state) => ({
  role: state.auth.role,
  userId: state.auth.user?.email || 'anonymous',
})

const normalizeManuscript = (incomingManuscript) => {
  const source = incomingManuscript ?? initialManuscript

  const notebooks =
    Array.isArray(source.notebooks) && source.notebooks.length > 0
      ? source.notebooks
      : initialManuscript.notebooks

  const activeNotebookId =
    source.activeNotebookId && notebooks.some((notebook) => notebook.id === source.activeNotebookId)
      ? source.activeNotebookId
      : notebooks[0].id

  const baseChapters =
    Array.isArray(source.chapters) && source.chapters.length > 0
      ? source.chapters
      : [
          {
            id: 'chapter-legacy',
            notebookId: activeNotebookId,
            title: source.title || 'Chapter 1',
            content: source.content || '<p></p>',
            lastEditedAt: source.lastSavedAt || null,
          },
        ]

  const chapters = baseChapters.map((chapter, index) => ({
    ...chapter,
    id: chapter.id || `chapter-${index + 1}`,
    notebookId: chapter.notebookId || activeNotebookId,
    title: chapter.title || `Chapter ${index + 1}`,
    content: chapter.content || '<p></p>',
    lastEditedAt: chapter.lastEditedAt || null,
  }))

  const activeChapterId =
    source.activeChapterId && chapters.some((chapter) => chapter.id === source.activeChapterId)
      ? source.activeChapterId
      : chapters[0].id

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0]

  return {
    ...initialManuscript,
    ...source,
    writingMode: source.writingMode || 'Flow',
    notebooks,
    chapters,
    activeNotebookId,
    activeChapterId,
    title: activeChapter.title,
    content: activeChapter.content,
    wordCount: deriveWordCount(activeChapter.content),
  }
}

const mergeById = (list, item) =>
  list.some((entry) => entry.id === item.id)
    ? list.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry))
    : [...list, item]

const useVerseStore = create((set, get) => ({
  characters: initialCharacters,
  roadmapNodes: initialRoadmapNodes,
  workspace: initialWorkspace,
  manuscript: normalizeManuscript(initialManuscript),
  socials: initialSocials,
  sync: initialSync,
  auth: {
    ...initialAuth,
    ...persistedAuth,
  },

  setAuthMode: (mode) =>
    set((state) => ({
      auth: {
        ...state.auth,
        mode,
        error: null,
      },
    })),

  setAuthError: (error) =>
    set((state) => ({
      auth: {
        ...state.auth,
        error,
      },
    })),

  login: async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const accounts = readJsonStorage(ACCOUNTS_STORAGE_KEY, [])

    const account = accounts.find((entry) => entry.email === normalizedEmail)
    if (!account || account.password !== password) {
      set((state) => ({
        auth: {
          ...state.auth,
          error: 'Invalid credentials. Please try again.',
        },
      }))
      return false
    }

    const nextAuth = {
      isAuthenticated: true,
      mode: 'login',
      user: {
        name: account.name,
        email: account.email,
      },
      error: null,
      role: 'owner',
      surfaceMode: 'hybrid',
    }

    persistJsonStorage(AUTH_STORAGE_KEY, nextAuth)
    set({ auth: nextAuth })
    return true
  },

  register: async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const displayName = name.trim()

    const accounts = readJsonStorage(ACCOUNTS_STORAGE_KEY, [])
    const alreadyExists = accounts.some((entry) => entry.email === normalizedEmail)

    if (alreadyExists) {
      set((state) => ({
        auth: {
          ...state.auth,
          error: 'An account with this email already exists.',
        },
      }))
      return false
    }

    const updatedAccounts = [
      ...accounts,
      {
        id: crypto.randomUUID(),
        name: displayName,
        email: normalizedEmail,
        password,
      },
    ]

    persistJsonStorage(ACCOUNTS_STORAGE_KEY, updatedAccounts)

    const nextAuth = {
      isAuthenticated: true,
      mode: 'register',
      user: {
        name: displayName,
        email: normalizedEmail,
      },
      error: null,
      role: 'owner',
      surfaceMode: 'hybrid',
    }

    persistJsonStorage(AUTH_STORAGE_KEY, nextAuth)
    set({ auth: nextAuth })
    return true
  },

  logout: () => {
    const nextAuth = {
      ...initialAuth,
      mode: 'login',
    }
    persistJsonStorage(AUTH_STORAGE_KEY, nextAuth)
    set({ auth: nextAuth })
  },

  setViewerRole: (role) =>
    set((state) => {
      const nextRole = ['owner', 'follower', 'guest', 'admin'].includes(role) ? role : 'guest'
      const nextSurfaceMode = nextRole === 'owner' || nextRole === 'admin' ? 'hybrid' : 'socials'

      const nextAuth = {
        ...state.auth,
        role: nextRole,
        surfaceMode: nextSurfaceMode,
      }

      persistJsonStorage(AUTH_STORAGE_KEY, nextAuth)

      return {
        auth: nextAuth,
      }
    }),

  setSurfaceMode: (surfaceMode) =>
    set((state) => {
      const canAccessPrivate = state.auth.role === 'owner' || state.auth.role === 'admin'
      const nextSurfaceMode = canAccessPrivate ? surfaceMode : 'socials'
      const nextAuth = {
        ...state.auth,
        surfaceMode: nextSurfaceMode,
      }

      persistJsonStorage(AUTH_STORAGE_KEY, nextAuth)

      return {
        auth: nextAuth,
      }
    }),

  setActiveTab: (tab) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        activeTab: tab,
      },
    })),

  jumpToWorkspace: ({ tab, characterId, roadmapNodeId }) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        activeTab: tab ?? state.workspace.activeTab,
        selectedCharacterId: characterId ?? state.workspace.selectedCharacterId,
        selectedRoadmapNodeId: roadmapNodeId ?? state.workspace.selectedRoadmapNodeId,
      },
    })),

  selectCharacter: (characterId) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        selectedCharacterId: characterId,
      },
    })),

  selectRoadmapNode: (nodeId) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        selectedRoadmapNodeId: nodeId,
      },
    })),

  upsertCharacter: (character) =>
    set((state) => ({
      characters: mergeById(state.characters, character),
    })),

  addCharacter: (character) =>
    set((state) => ({
      characters: [...state.characters, { ...character, id: character.id ?? crypto.randomUUID() }],
    })),

  updateCharacterStatus: (characterId, status) =>
    set((state) => ({
      characters: state.characters.map((character) =>
        character.id === characterId ? { ...character, status } : character,
      ),
    })),

  upsertRoadmapNode: (roadmapNode) =>
    set((state) => ({
      roadmapNodes: mergeById(state.roadmapNodes, roadmapNode),
    })),

  addRoadmapNode: ({ chapterTitle, plotSummary, linkedCharacterIds }) =>
    set((state) => ({
      roadmapNodes: [
        ...state.roadmapNodes,
        {
          id: `node-${String(state.roadmapNodes.length + 1).padStart(2, '0')}`,
          chapterTitle,
          plotSummary,
          linkedCharacterIds,
        },
      ],
    })),

  linkCharacterToNode: (nodeId, characterId) =>
    set((state) => ({
      roadmapNodes: state.roadmapNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              linkedCharacterIds: Array.from(
                new Set([...node.linkedCharacterIds, characterId]),
              ),
            }
          : node,
      ),
    })),

  getSelectedCharacter: () => {
    const { characters, workspace } = get()
    return characters.find((character) => character.id === workspace.selectedCharacterId) ?? null
  },

  getSelectedRoadmapNode: () => {
    const { roadmapNodes, workspace } = get()
    return roadmapNodes.find((node) => node.id === workspace.selectedRoadmapNodeId) ?? null
  },

  updateManuscript: ({ title, content }) =>
    set((state) => {
      const currentChapterId = state.manuscript.activeChapterId
      const updatedChapters = state.manuscript.chapters.map((chapter) => {
        if (chapter.id !== currentChapterId) {
          return chapter
        }

        return {
          ...chapter,
          title: title ?? chapter.title,
          content: content ?? chapter.content,
          lastEditedAt: new Date().toISOString(),
        }
      })

      const activeChapter =
        updatedChapters.find((chapter) => chapter.id === currentChapterId) ?? updatedChapters[0]
      const manuscriptContent = activeChapter.content
      const wordCount = deriveWordCount(manuscriptContent)

      return {
        manuscript: {
          ...state.manuscript,
          chapters: updatedChapters,
          title: activeChapter.title,
          content: manuscriptContent,
          wordCount,
        },
      }
    }),

  createNotebook: (name) =>
    set((state) => {
      const notebookName = name?.trim() || `Notebook ${state.manuscript.notebooks.length + 1}`
      const notebookId = crypto.randomUUID()
      const chapterId = crypto.randomUUID()

      const notebooks = [
        ...state.manuscript.notebooks,
        {
          id: notebookId,
          name: notebookName,
          chapterIds: [chapterId],
        },
      ]

      const chapters = [
        ...state.manuscript.chapters,
        {
          id: chapterId,
          notebookId,
          title: 'Chapter 1',
          content: '<p></p>',
          lastEditedAt: null,
        },
      ]

      return {
        manuscript: {
          ...state.manuscript,
          notebooks,
          chapters,
          activeNotebookId: notebookId,
          activeChapterId: chapterId,
          title: 'Chapter 1',
          content: '<p></p>',
          wordCount: 0,
        },
      }
    }),

  selectNotebook: (notebookId) =>
    set((state) => {
      const notebook = state.manuscript.notebooks.find((item) => item.id === notebookId)
      if (!notebook) return {}

      const firstChapterId = notebook.chapterIds[0]
      const activeChapter =
        state.manuscript.chapters.find((chapter) => chapter.id === firstChapterId) ??
        state.manuscript.chapters.find((chapter) => chapter.notebookId === notebookId)

      if (!activeChapter) {
        return {
          manuscript: {
            ...state.manuscript,
            activeNotebookId: notebookId,
          },
        }
      }

      return {
        manuscript: {
          ...state.manuscript,
          activeNotebookId: notebookId,
          activeChapterId: activeChapter.id,
          title: activeChapter.title,
          content: activeChapter.content,
          wordCount: deriveWordCount(activeChapter.content),
        },
      }
    }),

  createChapter: (title) =>
    set((state) => {
      const chapterTitle = title?.trim() || `Chapter ${state.manuscript.chapters.length + 1}`
      const chapterId = crypto.randomUUID()
      const notebookId = state.manuscript.activeNotebookId

      const chapters = [
        ...state.manuscript.chapters,
        {
          id: chapterId,
          notebookId,
          title: chapterTitle,
          content: '<p></p>',
          lastEditedAt: null,
        },
      ]

      const notebooks = state.manuscript.notebooks.map((notebook) =>
        notebook.id === notebookId
          ? {
              ...notebook,
              chapterIds: [...notebook.chapterIds, chapterId],
            }
          : notebook,
      )

      return {
        manuscript: {
          ...state.manuscript,
          notebooks,
          chapters,
          activeChapterId: chapterId,
          title: chapterTitle,
          content: '<p></p>',
          wordCount: 0,
        },
      }
    }),

  selectChapter: (chapterId) =>
    set((state) => {
      const chapter = state.manuscript.chapters.find((item) => item.id === chapterId)
      if (!chapter) return {}

      return {
        manuscript: {
          ...state.manuscript,
          activeNotebookId: chapter.notebookId,
          activeChapterId: chapter.id,
          title: chapter.title,
          content: chapter.content,
          wordCount: deriveWordCount(chapter.content),
        },
      }
    }),

  setWritingMode: (writingMode) =>
    set((state) => ({
      manuscript: {
        ...state.manuscript,
        writingMode,
      },
    })),

  saveManuscript: () =>
    set((state) => ({
      manuscript: {
        ...state.manuscript,
        lastSavedAt: new Date().toISOString(),
      },
      sync: {
        ...state.sync,
        localDraftVersion: state.sync.localDraftVersion + 1,
        cloudStatus: 'Synced Locally',
      },
    })),

  setCloudStatus: (status) =>
    set((state) => ({
      sync: {
        ...state.sync,
        cloudStatus: status,
      },
    })),

  hydrateWorkspace: (workspaceData) =>
    set((state) => ({
      workspace: workspaceData.workspace ?? state.workspace,
      manuscript: normalizeManuscript(workspaceData.manuscript ?? state.manuscript),
      socials: workspaceData.socials ?? state.socials,
      sync: {
        ...state.sync,
        ...(workspaceData.sync ?? {}),
        cloudStatus: 'Loaded From Backend',
        lastError: null,
      },
      characters:
        Array.isArray(workspaceData.characters) && workspaceData.characters.length > 0
          ? workspaceData.characters
          : state.characters,
      roadmapNodes:
        Array.isArray(workspaceData.roadmapNodes) && workspaceData.roadmapNodes.length > 0
          ? workspaceData.roadmapNodes
          : state.roadmapNodes,
    })),

  saveWorkspaceToBackend: async () => {
    const snapshot = get()
    const payload = {
      workspace: snapshot.workspace,
      manuscript: snapshot.manuscript,
      sync: {
        ...snapshot.sync,
        cloudStatus: 'Synced To Backend',
        lastError: null,
      },
      socials: snapshot.socials,
      characters: snapshot.characters,
      roadmapNodes: snapshot.roadmapNodes,
    }

    set((state) => ({
      sync: {
        ...state.sync,
        cloudStatus: 'Syncing...',
        lastError: null,
      },
    }))

    try {
      await saveWorkspace(payload, getAccessContext(snapshot))
      set((state) => ({
        sync: {
          ...state.sync,
          cloudStatus: 'Synced To Backend',
          lastError: null,
        },
      }))
      return true
    } catch (error) {
      set((state) => ({
        sync: {
          ...state.sync,
          cloudStatus: 'Sync Failed',
          lastError: error.message,
        },
      }))
      return false
    }
  },

  loadWorkspaceFromBackend: async () => {
    set((state) => ({
      sync: {
        ...state.sync,
        cloudStatus: 'Loading Backend Data...',
        lastError: null,
      },
    }))

    try {
      const remoteWorkspace = await fetchWorkspace(getAccessContext(get()))

      if (remoteWorkspace) {
        get().hydrateWorkspace(remoteWorkspace)
      } else {
        set((state) => ({
          sync: {
            ...state.sync,
            cloudStatus: 'No Remote Workspace Found',
            lastError: null,
          },
        }))
      }

      return true
    } catch (error) {
      set((state) => ({
        sync: {
          ...state.sync,
          cloudStatus: 'Load Failed',
          lastError: error.message,
        },
      }))
      return false
    }
  },

  loadSocialsFromBackend: async () => {
    try {
      const response = await fetchSocialsOverview(getAccessContext(get()))
      set((state) => ({
        socials: response.socials ?? state.socials,
      }))
      return true
    } catch {
      return false
    }
  },

  createSocialPost: async ({ excerpt, mediaUrl }) => {
    try {
      const socials = await createSocialPost(
        {
          excerpt,
          mediaUrl,
        },
        getAccessContext(get()),
      )
      set({ socials })
      return true
    } catch {
      return false
    }
  },

  followWriter: async (followerName) => {
    try {
      const socials = await followWriterApi(followerName, getAccessContext(get()))
      set({ socials })
      return true
    } catch {
      return false
    }
  },

  sendSocialMessage: async ({ senderName, text }) => {
    try {
      const socials = await sendDirectMessage(
        {
          senderName,
          text,
        },
        getAccessContext(get()),
      )
      set({ socials })
      return true
    } catch {
      return false
    }
  },
}))

export default useVerseStore
