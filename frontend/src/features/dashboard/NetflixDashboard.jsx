import { BookOpenText, Clapperboard, Compass, Save, Sparkles, UserRound } from 'lucide-react'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import CharactersWorkspace from '../characters/CharactersWorkspace'
import ManuscriptStudio from '../manuscript/ManuscriptStudio'
import RoadmapsWorkspace from '../roadmaps/RoadmapsWorkspace'
import SaveSyncWorkspace from '../sync/SaveSyncWorkspace'
import VisualizeWorkspace from '../visualize/VisualizeWorkspace'
import DashboardHome from './DashboardHome'
import useVerseStore from '../../store/useVerseStore'

const NAV_TABS = [
  { label: 'Dashboard', icon: Sparkles },
  { label: 'Manuscript', icon: BookOpenText },
  { label: 'Roadmaps', icon: Compass },
  { label: 'Characters', icon: UserRound },
  { label: 'Visualize', icon: Clapperboard },
  { label: 'Save & Sync', icon: Save },
]

function NetflixDashboard() {
  const {
    activeTab,
    selectedCharacterId,
    selectedRoadmapNodeId,
    characters,
    roadmapNodes,
    manuscript,
    sync,
    setActiveTab,
    selectCharacter,
    selectRoadmapNode,
    addRoadmapNode,
    addCharacter,
    updateManuscript,
    saveManuscript,
    setCloudStatus,
    saveWorkspaceToBackend,
    loadWorkspaceFromBackend,
  } = useVerseStore(
    useShallow((state) => ({
      activeTab: state.workspace.activeTab,
      selectedCharacterId: state.workspace.selectedCharacterId,
      selectedRoadmapNodeId: state.workspace.selectedRoadmapNodeId,
      characters: state.characters,
      roadmapNodes: state.roadmapNodes,
      manuscript: state.manuscript,
      sync: state.sync,
      setActiveTab: state.setActiveTab,
      selectCharacter: state.selectCharacter,
      selectRoadmapNode: state.selectRoadmapNode,
      addRoadmapNode: state.addRoadmapNode,
      addCharacter: state.addCharacter,
      updateManuscript: state.updateManuscript,
      saveManuscript: state.saveManuscript,
      setCloudStatus: state.setCloudStatus,
      saveWorkspaceToBackend: state.saveWorkspaceToBackend,
      loadWorkspaceFromBackend: state.loadWorkspaceFromBackend,
    })),
  )

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) ?? null,
    [characters, selectedCharacterId],
  )

  const selectedRoadmapNode = useMemo(
    () => roadmapNodes.find((node) => node.id === selectedRoadmapNodeId) ?? null,
    [roadmapNodes, selectedRoadmapNodeId],
  )

  const renderWorkspace = () => {
    if (activeTab === 'Manuscript') {
      return <ManuscriptStudio manuscript={manuscript} onUpdate={updateManuscript} onSave={saveManuscript} />
    }

    if (activeTab === 'Roadmaps') {
      return (
        <RoadmapsWorkspace
          roadmapNodes={roadmapNodes}
          characters={characters}
          onSelectNode={selectRoadmapNode}
          onAddNode={addRoadmapNode}
        />
      )
    }

    if (activeTab === 'Characters') {
      return (
        <CharactersWorkspace
          characters={characters}
          selectedCharacterId={selectedCharacterId}
          onSelectCharacter={selectCharacter}
          onAddCharacter={addCharacter}
        />
      )
    }

    if (activeTab === 'Visualize') {
      return <VisualizeWorkspace selectedCharacter={selectedCharacter} selectedRoadmapNode={selectedRoadmapNode} />
    }

    if (activeTab === 'Save & Sync') {
      return (
        <SaveSyncWorkspace
          manuscript={manuscript}
          sync={sync}
          characters={characters}
          roadmapNodes={roadmapNodes}
          onSaveManuscript={saveManuscript}
          onSetCloudStatus={setCloudStatus}
          onSaveToBackend={saveWorkspaceToBackend}
          onLoadFromBackend={loadWorkspaceFromBackend}
        />
      )
    }

    return (
      <DashboardHome
        characters={characters}
        selectedCharacter={selectedCharacter}
        selectedCharacterId={selectedCharacterId}
        roadmapNodes={roadmapNodes}
        onSelectCharacter={selectCharacter}
        onOpenCharacters={() => setActiveTab('Characters')}
        onOpenVisualize={() => setActiveTab('Visualize')}
        onOpenRoadmaps={() => setActiveTab('Roadmaps')}
        onOpenManuscript={() => setActiveTab('Manuscript')}
        onOpenSave={() => setActiveTab('Save & Sync')}
      />
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 pb-12 pt-4 text-slate-100 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(54,214,255,0.22),transparent_35%),radial-gradient(circle_at_88%_12%,rgba(255,144,82,0.18),transparent_34%)]" />

      <nav className="sticky top-3 z-40 rounded-2xl border border-slate-200/10 bg-slate-950/70 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 p-2 text-cyan-200">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="vw-headline text-base leading-none tracking-[0.2em] text-cyan-100">VERSEWEAVER</p>
              <p className="text-xs tracking-[0.14em] text-slate-400">Integrated Creative Suite</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {NAV_TABS.map((tab) => {
              const isActive = tab.label === activeTab
              const Icon = tab.icon

              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.label)}
                  className={[
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.12em] transition sm:text-sm',
                    isActive
                      ? 'border-cyan-200/75 bg-cyan-300/20 text-cyan-100 shadow-[0_0_20px_rgba(54,214,255,0.35)]'
                      : 'border-slate-100/10 bg-slate-800/45 text-slate-200 hover:border-slate-100/30 hover:bg-slate-700/60',
                  ].join(' ')}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto mt-6 flex w-full max-w-[1300px] flex-col gap-8">{renderWorkspace()}</main>
    </div>
  )
}

export default NetflixDashboard
