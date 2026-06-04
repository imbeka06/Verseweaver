function SaveSyncWorkspace({ manuscript, sync, characters, roadmapNodes, onSaveManuscript, onSetCloudStatus }) {
  const exportWorkspace = () => {
    const payload = {
      manuscript,
      sync,
      characters,
      roadmapNodes,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'verseweaver-workspace-export.json'
    anchor.click()
    URL.revokeObjectURL(url)
    onSetCloudStatus('Exported Backup Ready')
  }

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <article className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <h2 className="vw-headline text-2xl text-white">Save and Sync</h2>
        <p className="mt-1 text-sm text-slate-300">Control local save state and workspace exports.</p>

        <div className="mt-4 space-y-3 rounded-2xl border border-slate-100/10 bg-slate-900/60 p-4 text-sm text-slate-200">
          <p>Draft version: {sync.localDraftVersion}</p>
          <p>Cloud status: {sync.cloudStatus}</p>
          <p>Last manuscript save: {manuscript.lastSavedAt ? new Date(manuscript.lastSavedAt).toLocaleString() : 'Never'}</p>
          <p>Word count: {manuscript.wordCount}</p>
          <p>Characters: {characters.length}</p>
          <p>Roadmap nodes: {roadmapNodes.length}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSaveManuscript}
            className="rounded-full border border-emerald-300/45 bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-300/20"
          >
            Save Manuscript
          </button>
          <button
            type="button"
            onClick={() => onSetCloudStatus('Cloud Sync Simulated')}
            className="rounded-full border border-cyan-300/45 bg-cyan-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Simulate Cloud Sync
          </button>
          <button
            type="button"
            onClick={exportWorkspace}
            className="rounded-full border border-orange-300/45 bg-orange-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-orange-100 transition hover:bg-orange-300/20"
          >
            Export Workspace JSON
          </button>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <h3 className="text-xl font-semibold text-white">What This Means</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          You now have a functional local-first suite. If you are a solo writer and work from one device,
          local save plus export backup may be enough to start. Database becomes important for multi-device
          sync, team collaboration, version history, and secure auth.
        </p>
      </article>
    </section>
  )
}

export default SaveSyncWorkspace
