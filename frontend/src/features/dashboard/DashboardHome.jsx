import { Film, GitBranch, PenSquare, Save, Users } from 'lucide-react'
import SocialsWorkspace from '../socials/SocialsWorkspace'

function CharacterStripCard({ character, isSelected, onSelect, onVisualize, onEditLore }) {
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
      <button type="button" onClick={onSelect} className="block w-full text-left" aria-label={`Open ${character.name}`}>
        <div className="relative h-64 overflow-hidden md:h-72">
          <img
            src={character.avatarImg}
            alt={character.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-[#070c18]/40 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-cyan-300/35 bg-slate-950/70 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">
            {character.category} / {character.style}
          </span>
          <span className="absolute right-4 top-4 rounded-full border border-orange-300/35 bg-slate-950/70 px-3 py-1 text-xs font-semibold tracking-wide text-orange-200">
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
          <Users size={16} />
          Edit Lore
        </button>
      </div>
    </article>
  )
}

function DashboardHome({
  characters,
  selectedCharacter,
  selectedCharacterId,
  roadmapNodes,
  socials,
  role,
  surfaceMode,
  onSelectCharacter,
  onOpenCharacters,
  onOpenVisualize,
  onOpenRoadmaps,
  onOpenManuscript,
  onOpenSave,
  onOpenSocials = () => {},
  onCreateSocialPost = async () => false,
  onFollowWriter = async () => false,
  onSendSocialMessage = async () => false,
}) {
  const canAccessPrivate = role === 'owner' || role === 'admin'
  const showSocialsOnly = !canAccessPrivate || surfaceMode === 'socials'

  if (showSocialsOnly) {
    return (
      <div className="space-y-4">
        <header className="rounded-2xl border border-slate-100/10 bg-slate-950/55 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Public Audience View</p>
          <h1 className="vw-headline mt-2 text-3xl text-white">SOCIALS PORTAL</h1>
          <p className="mt-2 text-sm text-slate-300">Followers can access published work, highlights, and direct messages only.</p>
        </header>

        <SocialsWorkspace
          socials={socials}
          role={role}
          onCreatePost={onCreateSocialPost}
          onFollowWriter={onFollowWriter}
          onSendMessage={onSendSocialMessage}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="relative overflow-hidden rounded-3xl border border-slate-200/10 bg-slate-950/55 px-6 py-8 shadow-[0_18px_38px_rgba(1,6,18,0.55)] backdrop-blur-sm sm:px-8 sm:py-10">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(56,189,248,0.08),transparent_25%,rgba(255,144,82,0.11)_82%)]" />
          <p className="text-sm uppercase tracking-[0.22em] text-cyan-200/90">Ink Your Thoughts</p>
          <h1 className="vw-headline mt-4 text-3xl leading-tight text-white sm:text-5xl">
            CRAFT YOUR MASTERPIECE. MAP YOUR WORLDS.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Preserve your private pipeline for manuscript drafting, roadmap plotting, character curation, and scene visualization.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenManuscript}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/25"
            >
              <PenSquare size={14} />
              Open Writer Studio
            </button>
            <button
              type="button"
              onClick={onOpenRoadmaps}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/20 bg-slate-800/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100 transition hover:border-slate-200/45"
            >
              <GitBranch size={14} />
              Plot Roadmap
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            {[
              { label: 'Manuscript', action: onOpenManuscript },
              { label: 'Roadmaps', action: onOpenRoadmaps },
              { label: 'Characters', action: onOpenCharacters },
              { label: 'Visualize', action: onOpenVisualize },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="rounded-xl border border-slate-100/15 bg-slate-900/55 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-100/35"
              >
                {item.label}
              </button>
            ))}
          </div>
        </article>

        <div className="rounded-3xl border border-slate-100/10 bg-slate-950/45 p-2">
          <SocialsWorkspace
            socials={socials}
            role={role}
            compact
            onCreatePost={onCreateSocialPost}
            onFollowWriter={onFollowWriter}
            onSendMessage={onSendSocialMessage}
          />
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={onOpenSocials}
              className="w-full rounded-full border border-cyan-300/45 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100"
            >
              Open Full Socials View
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="vw-headline text-2xl text-white sm:text-3xl">Character Gallery</h2>
            <p className="text-sm text-slate-300">Mix real people and fictional animated heroes in one canon.</p>
          </div>
          {selectedCharacter && (
            <div className="rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
              Selected: <span className="font-semibold">{selectedCharacter.name}</span>
            </div>
          )}
        </header>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {characters.map((character) => (
            <CharacterStripCard
              key={character.id}
              character={character}
              isSelected={character.id === selectedCharacterId}
              onSelect={() => onSelectCharacter(character.id)}
              onVisualize={() => {
                onSelectCharacter(character.id)
                onOpenVisualize()
              }}
              onEditLore={() => {
                onSelectCharacter(character.id)
                onOpenCharacters()
              }}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-100/10 bg-slate-900/55 p-6 shadow-[0_16px_30px_rgba(3,7,20,0.45)]">
          <div className="inline-flex rounded-xl border border-cyan-300/35 bg-cyan-300/10 p-2 text-cyan-100">
            <GitBranch size={18} />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">Roadmap Timeline</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {roadmapNodes.length} active nodes currently shaping your narrative arcs.
          </p>
          <button
            type="button"
            onClick={onOpenRoadmaps}
            className="mt-4 rounded-full border border-cyan-300/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-300/15"
          >
            Open Roadmaps
          </button>
        </article>

        <article className="rounded-2xl border border-slate-100/10 bg-slate-900/55 p-6 shadow-[0_16px_30px_rgba(3,7,20,0.45)]">
          <div className="inline-flex rounded-xl border border-emerald-300/35 bg-emerald-300/10 p-2 text-emerald-100">
            <Save size={18} />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">Save and Sync</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Trigger local saves, cloud sync status, and workspace export from one operational panel.
          </p>
          <button
            type="button"
            onClick={onOpenSave}
            className="mt-4 rounded-full border border-emerald-300/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-300/15"
          >
            Open Save and Sync
          </button>
        </article>
      </section>
    </div>
  )
}

export default DashboardHome
