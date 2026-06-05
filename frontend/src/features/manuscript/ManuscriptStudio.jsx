import {
  Bold,
  BookOpen,
  Heading1,
  Italic,
  Library,
  ListMusic,
  Plus,
  Save,
  Underline,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

const WRITING_MODES = [
  {
    id: 'Flow',
    name: 'Flow Mode',
    description: 'Minimal chrome for uninterrupted drafting.',
  },
  {
    id: 'Sprint',
    name: 'Sprint Mode',
    description: 'Focused sessions for fast chapter progression.',
  },
  {
    id: 'Edit',
    name: 'Edit Mode',
    description: 'Revision-centered workspace for cleanup passes.',
  },
]

function ManuscriptStudio({
  manuscript,
  onUpdate,
  onSave,
  onCreateNotebook,
  onSelectNotebook,
  onCreateChapter,
  onSelectChapter,
  onSetWritingMode,
}) {
  const editorRef = useRef(null)
  const [newNotebookName, setNewNotebookName] = useState('')
  const [newChapterName, setNewChapterName] = useState('')

  const applyFormat = (command, value) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    document.execCommand(command, false, value)
    onUpdate({ content: editor.innerHTML })
  }

  const notebooks = manuscript.notebooks ?? []
  const chapters = manuscript.chapters ?? []

  const activeNotebook = useMemo(
    () => notebooks.find((notebook) => notebook.id === manuscript.activeNotebookId) ?? null,
    [notebooks, manuscript.activeNotebookId],
  )

  const notebookChapters = useMemo(() => {
    if (!activeNotebook) return []

    const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]))
    return activeNotebook.chapterIds
      .map((chapterId) => chapterMap.get(chapterId))
      .filter(Boolean)
  }, [activeNotebook, chapters])

  const handleCreateNotebook = () => {
    onCreateNotebook(newNotebookName)
    setNewNotebookName('')
  }

  const handleCreateChapter = () => {
    onCreateChapter(newChapterName)
    setNewChapterName('')
  }

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-3xl border border-slate-200/10 bg-slate-950/55 p-4 shadow-[0_16px_28px_rgba(3,8,24,0.5)] sm:p-5">
        <div>
          <h2 className="vw-headline text-xl text-white">Notebook Library</h2>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            OneNote-style organization
          </p>
        </div>

        <div className="space-y-2">
          {notebooks.map((notebook) => {
            const isActive = notebook.id === manuscript.activeNotebookId
            return (
              <button
                key={notebook.id}
                type="button"
                onClick={() => onSelectNotebook(notebook.id)}
                className={[
                  'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition',
                  isActive
                    ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100'
                    : 'border-slate-100/10 bg-slate-900/55 text-slate-200 hover:border-slate-100/25',
                ].join(' ')}
              >
                <span className="inline-flex items-center gap-2">
                  <Library size={14} />
                  {notebook.name}
                </span>
                <span className="text-xs text-slate-400">{notebook.chapterIds.length}</span>
              </button>
            )
          })}
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-100/10 bg-slate-900/55 p-3">
          <label className="text-xs uppercase tracking-[0.14em] text-slate-400">Create Notebook</label>
          <input
            type="text"
            value={newNotebookName}
            onChange={(event) => setNewNotebookName(event.target.value)}
            className="w-full rounded-lg border border-slate-100/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
            placeholder="Worldbuilding Notes"
          />
          <button
            type="button"
            onClick={handleCreateNotebook}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/45 bg-cyan-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/20"
          >
            <Plus size={14} />
            Add Notebook
          </button>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-100/10 bg-slate-900/55 p-3">
          <label className="text-xs uppercase tracking-[0.14em] text-slate-400">Chapters</label>
          <div className="max-h-44 space-y-2 overflow-auto pr-1">
            {notebookChapters.map((chapter) => {
              const isActive = chapter.id === manuscript.activeChapterId
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onSelectChapter(chapter.id)}
                  className={[
                    'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition',
                    isActive
                      ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-100'
                      : 'border-slate-100/10 bg-slate-950/45 text-slate-200 hover:border-slate-100/25',
                  ].join(' ')}
                >
                  <BookOpen size={13} />
                  <span className="truncate">{chapter.title}</span>
                </button>
              )
            })}
          </div>

          <input
            type="text"
            value={newChapterName}
            onChange={(event) => setNewChapterName(event.target.value)}
            className="w-full rounded-lg border border-slate-100/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
            placeholder="Chapter title"
          />
          <button
            type="button"
            onClick={handleCreateChapter}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300/45 bg-emerald-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-300/20"
          >
            <Plus size={14} />
            Add Chapter
          </button>
        </div>
      </aside>

      <section className="space-y-4 rounded-3xl border border-slate-200/10 bg-slate-950/55 p-5 shadow-[0_16px_28px_rgba(3,8,24,0.5)] sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="vw-headline text-2xl text-white">Writer Studio</h2>
            <p className="text-sm text-slate-300">
              Resume any chapter where you left off and switch writing modes by preference.
            </p>
          </div>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/45 bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-300/20"
          >
            <Save size={14} />
            Save Draft
          </button>
        </header>

        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-100/10 bg-slate-900/45 p-3 sm:grid-cols-3">
          {WRITING_MODES.map((mode) => {
            const isActive = manuscript.writingMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSetWritingMode(mode.id)}
                className={[
                  'rounded-xl border p-3 text-left transition',
                  isActive
                    ? 'border-fuchsia-300/60 bg-fuchsia-400/15 text-fuchsia-100'
                    : 'border-slate-100/10 bg-slate-950/40 text-slate-200 hover:border-slate-100/25',
                ].join(' ')}
              >
                <p className="text-sm font-semibold">{mode.name}</p>
                <p className="mt-1 text-xs text-slate-300">{mode.description}</p>
              </button>
            )
          })}
        </div>

        <input
          type="text"
          value={manuscript.title}
          onChange={(event) => onUpdate({ title: event.target.value })}
          className="w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
          placeholder="Chapter title"
        />

        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-100/10 bg-slate-900/50 p-2">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="rounded-lg border border-slate-100/15 bg-slate-800/60 p-2 text-slate-100 hover:border-slate-100/35"
            aria-label="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="rounded-lg border border-slate-100/15 bg-slate-800/60 p-2 text-slate-100 hover:border-slate-100/35"
            aria-label="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            className="rounded-lg border border-slate-100/15 bg-slate-800/60 p-2 text-slate-100 hover:border-slate-100/35"
            aria-label="Underline"
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('formatBlock', '<h2>')}
            className="rounded-lg border border-slate-100/15 bg-slate-800/60 p-2 text-slate-100 hover:border-slate-100/35"
            aria-label="Heading"
          >
            <Heading1 size={16} />
          </button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => onUpdate({ content: event.currentTarget.innerHTML })}
          className="min-h-[22rem] rounded-2xl border border-slate-100/15 bg-slate-950/80 p-5 text-base leading-7 text-slate-100 outline-none ring-cyan-300/40 focus:ring"
          dangerouslySetInnerHTML={{ __html: manuscript.content }}
        />

        <section className="rounded-2xl border border-slate-100/10 bg-gradient-to-r from-emerald-500/10 to-cyan-400/10 p-4">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
                <ListMusic size={18} />
                Spotify Writing Soundtrack
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Frontend preview: connect your Spotify account here in a later backend step.
              </p>
            </div>
            <button
              type="button"
              className="rounded-full border border-emerald-300/50 bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-300/20"
            >
              Connect Spotify
            </button>
          </header>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {['Deep Focus Drafts', 'Cinematic Chapters', 'Rainy Library Ambience'].map((playlist) => (
              <article
                key={playlist}
                className="rounded-xl border border-slate-100/10 bg-slate-950/45 p-3 text-sm text-slate-200"
              >
                <p className="font-semibold text-white">{playlist}</p>
                <p className="mt-1 text-xs text-slate-400">Preview UI card</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-slate-400">
          <span>{manuscript.wordCount} words</span>
          <span>{manuscript.lastSavedAt ? `Last saved: ${new Date(manuscript.lastSavedAt).toLocaleString()}` : 'Not saved yet'}</span>
        </footer>
      </section>
    </section>
  )
}

export default ManuscriptStudio
