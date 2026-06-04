import { useMemo, useState } from 'react'

function VisualizeWorkspace({ selectedCharacter, selectedRoadmapNode }) {
  const [cameraMood, setCameraMood] = useState('Cinematic Wide Shot')

  const previewBrief = useMemo(() => {
    if (!selectedCharacter || !selectedRoadmapNode) {
      return 'Select both a character and roadmap node to generate a preview brief.'
    }

    return `${cameraMood}. Scene focus: ${selectedCharacter.name} (${selectedCharacter.role}). Context: ${selectedRoadmapNode.chapterTitle}. Beat: ${selectedRoadmapNode.plotSummary}`
  }, [cameraMood, selectedCharacter, selectedRoadmapNode])

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <h2 className="vw-headline text-2xl text-white">Visualize Studio</h2>
        <p className="mt-1 text-sm text-slate-300">Pre-visualize scenes from your selected cast and timeline node.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100/10 bg-slate-900/55 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Selected Character</p>
            {selectedCharacter ? (
              <>
                <img
                  src={selectedCharacter.avatarImg}
                  alt={selectedCharacter.name}
                  className="mt-3 h-44 w-full rounded-xl object-cover"
                />
                <p className="mt-3 font-semibold text-white">{selectedCharacter.name}</p>
                <p className="text-sm text-cyan-100">{selectedCharacter.role}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No character selected.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100/10 bg-slate-900/55 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Selected Timeline Event</p>
            {selectedRoadmapNode ? (
              <>
                <p className="mt-3 font-semibold text-white">{selectedRoadmapNode.chapterTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedRoadmapNode.plotSummary}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No roadmap event selected.</p>
            )}
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <h3 className="text-xl font-semibold text-white">Scene Brief Generator</h3>
        <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-slate-400">Camera and Mood</label>
        <select
          value={cameraMood}
          onChange={(event) => setCameraMood(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
        >
          <option>Cinematic Wide Shot</option>
          <option>Moody Close-Up</option>
          <option>Epic Drone Reveal</option>
          <option>Handheld Documentary</option>
        </select>

        <div className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-cyan-100">Preview Brief</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-100">{previewBrief}</p>
        </div>
      </article>
    </section>
  )
}

export default VisualizeWorkspace
