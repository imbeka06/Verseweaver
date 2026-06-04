import { useState } from 'react'

function RoadmapsWorkspace({ roadmapNodes, characters, onSelectNode, onAddNode }) {
  const [chapterTitle, setChapterTitle] = useState('')
  const [plotSummary, setPlotSummary] = useState('')
  const [linkedCharacterIds, setLinkedCharacterIds] = useState([])

  const toggleCharacter = (characterId) => {
    setLinkedCharacterIds((prev) =>
      prev.includes(characterId) ? prev.filter((id) => id !== characterId) : [...prev, characterId],
    )
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!chapterTitle.trim() || !plotSummary.trim()) return

    onAddNode({
      chapterTitle: chapterTitle.trim(),
      plotSummary: plotSummary.trim(),
      linkedCharacterIds,
    })

    setChapterTitle('')
    setPlotSummary('')
    setLinkedCharacterIds([])
  }

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <h2 className="vw-headline text-2xl text-white">Roadmap Engine</h2>
        <p className="mt-1 text-sm text-slate-300">Track chapter sequence, plot summaries, and linked characters.</p>

        <div className="mt-4 space-y-3">
          {roadmapNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelectNode(node.id)}
              className="w-full rounded-xl border border-slate-100/10 bg-slate-900/60 p-4 text-left transition hover:border-cyan-300/45"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100">{node.chapterTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{node.plotSummary}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-400">
                Linked cast: {node.linkedCharacterIds.length}
              </p>
            </button>
          ))}
        </div>
      </article>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <h3 className="text-xl font-semibold text-white">Add Timeline Node</h3>

        <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-slate-400">Chapter Title</label>
        <input
          type="text"
          value={chapterTitle}
          onChange={(event) => setChapterTitle(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
          placeholder="Chapter 15: Fractured Crown"
        />

        <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-slate-400">Plot Summary</label>
        <textarea
          value={plotSummary}
          onChange={(event) => setPlotSummary(event.target.value)}
          className="mt-1 h-28 w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
          placeholder="Describe what happens in this chapter..."
        />

        <p className="mt-4 text-xs uppercase tracking-[0.12em] text-slate-400">Link Characters</p>
        <div className="mt-2 max-h-44 space-y-2 overflow-auto rounded-xl border border-slate-100/10 bg-slate-900/55 p-3">
          {characters.map((character) => (
            <label key={character.id} className="flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={linkedCharacterIds.includes(character.id)}
                onChange={() => toggleCharacter(character.id)}
                className="h-4 w-4 accent-cyan-400"
              />
              <span>{character.name}</span>
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-xl border border-cyan-300/45 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/25"
        >
          Add Roadmap Node
        </button>
      </form>
    </section>
  )
}

export default RoadmapsWorkspace
