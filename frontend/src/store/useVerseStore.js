import { create } from 'zustand'
import { fetchWorkspace, saveWorkspace } from '../api/workspaceApi'

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

const initialManuscript = {
  title: 'Aethelia Chronicle',
  content:
    '<h2>Chapter 1: Ashfall Overture</h2><p>The night sky cracked open like a lantern of molten glass. Anya pressed her palm against the atlas and felt the city shift beneath her feet.</p>',
  lastSavedAt: null,
  wordCount: 29,
}

const initialSync = {
  localDraftVersion: 1,
  cloudStatus: 'Not Synced',
  lastError: null,
}

const mergeById = (list, item) =>
  list.some((entry) => entry.id === item.id)
    ? list.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry))
    : [...list, item]

const useVerseStore = create((set, get) => ({
  characters: initialCharacters,
  roadmapNodes: initialRoadmapNodes,
  workspace: initialWorkspace,
  manuscript: initialManuscript,
  sync: initialSync,

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
      const manuscriptContent = content ?? state.manuscript.content
      const plainText = manuscriptContent.replace(/<[^>]*>/g, ' ')
      const wordCount = plainText
        .trim()
        .split(/\s+/)
        .filter(Boolean).length

      return {
        manuscript: {
          ...state.manuscript,
          title: title ?? state.manuscript.title,
          content: manuscriptContent,
          wordCount,
        },
      }
    }),

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
      manuscript: workspaceData.manuscript ?? state.manuscript,
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
      await saveWorkspace(payload)
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
      const remoteWorkspace = await fetchWorkspace()

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
}))

export default useVerseStore
