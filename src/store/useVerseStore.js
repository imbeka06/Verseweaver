import { create } from 'zustand'

const initialCharacters = [
  {
    id: 'anya',
    name: 'Anya Voss',
    role: 'Archivist Mage',
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
    avatarImg:
      'https://images.unsplash.com/photo-1525875975471-999f65706a10?auto=format&fit=crop&w=700&q=80',
    traits: ['Inventive', 'Chaotic', 'Visionary'],
    backstory:
      'Soren builds prophetic engines that model future plot branches before they happen in-world.',
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

const mergeById = (list, item) =>
  list.some((entry) => entry.id === item.id)
    ? list.map((entry) => (entry.id === item.id ? { ...entry, ...item } : entry))
    : [...list, item]

const useVerseStore = create((set, get) => ({
  characters: initialCharacters,
  roadmapNodes: initialRoadmapNodes,
  workspace: initialWorkspace,

  setActiveTab: (tab) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        activeTab: tab,
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
}))

export default useVerseStore
