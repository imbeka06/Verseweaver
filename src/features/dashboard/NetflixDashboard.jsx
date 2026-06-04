import {
  Archive,
  Clapperboard,
  Compass,
  Database,
  Film,
  Save,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { shallow } from 'zustand/shallow'
import useVerseStore from '../../store/useVerseStore'

const NAV_TABS = ['Dashboard', 'Roadmaps', 'Characters', 'Visualize', 'Save & Sync']

const FEATURE_CARDS = [
  {
    id: 'roadmap',
    title: 'Timeline & Plot Engine',
    description:
      'Build chapter-by-chapter momentum with visual plotting lanes and linked emotional beats.',
    icon: Compass,
    cta: 'Open Roadmaps',
    tab: 'Roadmaps',
  },
  {
    id: 'character',
    title: 'Character Lore Matrix',
    description:
      'Track traits, motivations, unresolved conflicts, and relationship arcs in a single canon.',
    icon: UserRound,
    cta: 'Browse Characters',
    tab: 'Characters',
  },
  {
    id: 'visualize',
    title: 'AI Pre-Visualize Studio',
    description:
      'Storyboards, split-screen animatics, and scene prototypes designed before prose lock-in.',
    icon: Clapperboard,
    cta: 'Launch Visualize',
    tab: 'Visualize',
  },
  {
    id: 'archive',
    title: 'Single Source Archive',
    description:
      'Sync manuscripts, roadmap nodes, and character updates into one always-current workspace.',
    icon: Database,
    cta: 'Save & Sync',
    tab: 'Save & Sync',
  },
]

function CharacterCard({ character, isSelected, onSelect, onVisualize, onEditLore }) {
  return (
    <article
      className={[
        'group relative w-[18rem] shrink-0 overflow-hidden rounded-2xl border bg-slate-900/70',
        'transition-all duration-300 ease-out md:w-[19.5rem]',
        isSelected
          ? 'translate-y-[-4px] border-cyan-300/60 shadow-[0_0_30px_rgba(54,214,255,0.25)]'
          : 'border-slate-200/10 hover:translate-y-[-4px] hover:border-cyan-300/50 hover:shadow-[0_0_24px_rgba(54,214,255,0.18)]',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full text-left"
        aria-label={`Open ${character.name}`}
      >
        <div className="relative h-64 overflow-hidden md:h-72">
          <img
            src={character.avatarImg}
            alt={character.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-[#070c18]/40 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-cyan-300/35 bg-slate-950/70 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">
            {character.status}
          </span>
        </div>
        <div className="space-y-1 p-4">
          <h3 className="text-lg font-semibold text-slate-50">{character.name}</h3>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-300/85">{character.role}</p>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-300/75">{character.backstory}</p>
        </div>
      </button>

      <div className="flex gap-2 px-4 pb-4">
        <button
          type="button"
          onClick={onVisualize}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-cyan-300/45 bg-cyan-400/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/25"
        >
          <Film size={16} />
          Visualize Scene
        </button>
        <button
          type="button"
          onClick={onEditLore}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-100/20 bg-slate-700/55 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-100/45 hover:bg-slate-600/75"
        >
          <Archive size={16} />
          Edit Lore
        </button>
      </div>
    </article>
  )
}

function NetflixDashboard() {
  const {
    activeTab,
    selectedCharacterId,
    characters,
    roadmapNodes,
    setActiveTab,
    selectCharacter,
  } = useVerseStore(
    (state) => ({
      activeTab: state.workspace.activeTab,
      selectedCharacterId: state.workspace.selectedCharacterId,
      characters: state.characters,
      roadmapNodes: state.roadmapNodes,
      setActiveTab: state.setActiveTab,
      selectCharacter: state.selectCharacter,
    }),
    shallow,
  )

  const selectedCharacter = useMemo(
    () => characters.find((character) => character.id === selectedCharacterId) ?? characters[0],
    [characters, selectedCharacterId],
  )

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
              const isActive = tab === activeTab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em] transition sm:text-sm',
                    isActive
                      ? 'border-cyan-200/75 bg-cyan-300/20 text-cyan-100 shadow-[0_0_20px_rgba(54,214,255,0.35)]'
                      : 'border-slate-100/10 bg-slate-800/45 text-slate-200 hover:border-slate-100/30 hover:bg-slate-700/60',
                  ].join(' ')}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto mt-6 flex w-full max-w-[1300px] flex-col gap-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/10 bg-slate-950/55 px-6 py-8 shadow-[0_18px_38px_rgba(1,6,18,0.55)] backdrop-blur-sm sm:px-10 sm:py-12">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(56,189,248,0.08),transparent_25%,rgba(255,144,82,0.11)_82%)]" />
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/90">Creative Command Workspace</p>
          <h1 className="vw-headline mt-4 max-w-4xl text-3xl leading-tight text-white sm:text-5xl lg:text-6xl">
            CRAFT YOUR MASTERPIECE. MAP YOUR WORLDS.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Unify manuscript writing, visual story architecture, character intelligence, and cinematic
            pre-visualization into one continuously synced source of truth.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            <Save size={14} />
            Global Sync Ready
          </div>
        </section>

        <section className="space-y-4">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="vw-headline text-2xl text-white sm:text-3xl">Character Gallery</h2>
              <p className="text-sm text-slate-300">Select a profile to update your unified story graph.</p>
            </div>
            {selectedCharacter && (
              <div className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
                Selected: <span className="font-semibold">{selectedCharacter.name}</span>
              </div>
            )}
          </header>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={character.id === selectedCharacterId}
                onSelect={() => selectCharacter(character.id)}
                onVisualize={() => {
                  selectCharacter(character.id)
                  setActiveTab('Visualize')
                }}
                onEditLore={() => {
                  selectCharacter(character.id)
                  setActiveTab('Characters')
                }}
              />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-100/10 bg-slate-900/55 p-6 shadow-[0_16px_30px_rgba(3,7,20,0.45)] transition hover:border-cyan-300/45 hover:bg-slate-900/75"
              >
                <div className="absolute -right-16 -top-14 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/20" />
                <div className="relative">
                  <div className="inline-flex rounded-xl border border-cyan-300/35 bg-cyan-300/10 p-2 text-cyan-100">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{feature.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-slate-400">
                    <span>{roadmapNodes.length} active timeline nodes</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab(feature.tab)}
                      className="rounded-full border border-slate-100/15 bg-slate-800/45 px-3 py-1.5 font-semibold text-slate-200 transition hover:border-cyan-200/65 hover:bg-cyan-400/15 hover:text-cyan-100"
                    >
                      {feature.cta}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </main>
    </div>
  )
}

export default NetflixDashboard
