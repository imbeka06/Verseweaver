import { create } from 'zustand'
import { fetchCurrentUser } from '../api/authApi'
import { fetchCharacters } from '../api/charactersApi'
import { fetchManuscript } from '../api/manuscriptApi'
import { fetchRoadmap } from '../api/roadmapApi'
import {
  createSocialPost as createSocialPostApi,
  fetchSocialsOverview,
  followWriter as followWriterApi,
  likeSocialPost,
  sendDirectMessage,
  unlikeSocialPost,
} from '../api/socialsApi'
import { fetchWorkspace, saveWorkspace } from '../api/workspaceApi'
import { supabase } from '../lib/supabase'

const AUTH_STORAGE_KEY = 'verseweaver-auth'

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

  completeAuthentication: async () => {
    try {
      const { user, access } = await fetchCurrentUser()

      const nextAuth = {
        isAuthenticated: true,
        mode: 'login',
        user,
        error: null,
        role: access?.role || 'owner',
        surfaceMode: access?.role === 'owner' || access?.role === 'admin' ? 'hybrid' : 'socials',
      }

      persistJsonStorage(AUTH_STORAGE_KEY, nextAuth)
      set({ auth: nextAuth })
      await get().hydrateFromBackend()
      return true
    } catch (error) {
      set((state) => ({
        auth: { ...state.auth, error: error.message || 'Failed to load account.' },
      }))
      return false
    }
  },

  login: async ({ email, password }) => {
    if (!supabase) {
      set((state) => ({
        auth: {
          ...state.auth,
          error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
        },
      }))
      return false
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        set((state) => ({ auth: { ...state.auth, error: error.message } }))
        return false
      }

      if (!data?.session) {
        set((state) => ({ auth: { ...state.auth, error: 'No session returned. Try again.' } }))
        return false
      }

      return get().completeAuthentication()
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, error: error.message || 'Login failed.' } }))
      return false
    }
  },

  register: async ({ name, email, password }) => {
    if (!supabase) {
      set((state) => ({
        auth: {
          ...state.auth,
          error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
        },
      }))
      return false
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: name.trim() } },
      })

      if (error) {
        set((state) => ({ auth: { ...state.auth, error: error.message } }))
        return false
      }

      if (data?.session) {
        return get().completeAuthentication()
      }

      set((state) => ({
        auth: { ...state.auth, error: 'Check your email to confirm your account.' },
      }))
      return false
    } catch (error) {
      set((state) => ({ auth: { ...state.auth, error: error.message || 'Registration failed.' } }))
      return false
    }
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {})
    }

    const nextAuth = { ...initialAuth, mode: 'login' }
    persistJsonStorage(AUTH_STORAGE_KEY, nextAuth)
    set({ auth: nextAuth })
  },

  restoreSession: async () => {
    if (!supabase) return false

    const { data } = await supabase.auth.getSession()
    if (!data?.session) return false

    return get().completeAuthentication()
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

  hydrateFromBackend: async () => {
    const results = await Promise.allSettled([
      get().loadManuscriptFromBackend(),
      get().loadCharactersFromBackend(),
      get().loadRoadmapFromBackend(),
      get().loadSocialsFromBackend(),
      get().loadWorkspaceFromBackend(),
    ])
    return results.every((result) => result.status === 'fulfilled')
  },

  loadManuscriptFromBackend: async () => {
    try {
      const { manuscript } = await fetchManuscript()
      if (manuscript) {
        set((state) => ({
          manuscript: normalizeManuscript({ ...state.manuscript, ...manuscript }),
        }))
      }
      return true
    } catch {
      return false
    }
  },

  loadCharactersFromBackend: async () => {
    try {
      const { characters } = await fetchCharacters()
      if (Array.isArray(characters)) {
        set({ characters })
      }
      return true
    } catch {
      return false
    }
  },

  loadRoadmapFromBackend: async () => {
    try {
      const { roadmapNodes } = await fetchRoadmap()
      if (Array.isArray(roadmapNodes)) {
        set({ roadmapNodes })
      }
      return true
    } catch {
      return false
    }
  },

  loadSocialsFromBackend: async () => {
    try {
      const response = await fetchSocialsOverview()
      set((state) => ({
        socials: response.socials ?? state.socials,
      }))
      return true
    } catch {
      return false
    }
  },

  loadWorkspaceFromBackend: async () => {
    set((state) => ({
      sync: { ...state.sync, cloudStatus: 'Loading Backend Data...', lastError: null },
    }))

    try {
      const payload = await fetchWorkspace()
      const workspace = payload?.workspace

      if (workspace) {
        set((state) => ({
          workspace: { ...state.workspace, ...workspace },
          sync: { ...state.sync, cloudStatus: 'Loaded From Backend', lastError: null },
        }))
      } else {
        set((state) => ({
          sync: { ...state.sync, cloudStatus: 'No Remote Workspace Found', lastError: null },
        }))
      }

      return true
    } catch (error) {
      set((state) => ({
        sync: { ...state.sync, cloudStatus: 'Load Failed', lastError: error.message },
      }))
      return false
    }
  },

  saveWorkspaceToBackend: async () => {
    set((state) => ({
      sync: { ...state.sync, cloudStatus: 'Syncing...', lastError: null },
    }))

    try {
      await saveWorkspace(get().workspace)
      set((state) => ({
        sync: { ...state.sync, cloudStatus: 'Synced To Backend', lastError: null },
      }))
      return true
    } catch (error) {
      set((state) => ({
        sync: { ...state.sync, cloudStatus: 'Sync Failed', lastError: error.message },
      }))
      return false
    }
  },

  createSocialPost: async ({ excerpt, mediaUrl }) => {
    try {
      const response = await createSocialPostApi({ excerpt, mediaUrl })
      set({ socials: response.socials ?? get().socials })
      return true
    } catch {
      return false
    }
  },

  followWriter: async (followerName) => {
    try {
      const response = await followWriterApi(followerName)
      set({ socials: response.socials ?? get().socials })
      return true
    } catch {
      return false
    }
  },

  sendSocialMessage: async ({ senderName, text }) => {
    try {
      const response = await sendDirectMessage({ senderName, text })
      set({ socials: response.socials ?? get().socials })
      return true
    } catch {
      return false
    }
  },

  likeSocialPost: async (postId) => {
    try {
      const response = await likeSocialPost(postId)
      set((state) => ({
        socials: {
          ...state.socials,
          posts: state.socials.posts.map((post) => (post.id === postId ? response.post : post)),
        },
      }))
      return true
    } catch {
      return false
    }
  },

  unlikeSocialPost: async (postId) => {
    try {
      const response = await unlikeSocialPost(postId)
      set((state) => ({
        socials: {
          ...state.socials,
          posts: state.socials.posts.map((post) => (post.id === postId ? response.post : post)),
        },
      }))
      return true
    } catch {
      return false
    }
  },
}))

export default useVerseStore
