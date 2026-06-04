import { Bold, Heading1, Italic, Save, Underline } from 'lucide-react'
import { useRef } from 'react'

function ManuscriptStudio({ manuscript, onUpdate, onSave }) {
  const editorRef = useRef(null)

  const applyFormat = (command, value) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    document.execCommand(command, false, value)
    onUpdate({ content: editor.innerHTML })
  }

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200/10 bg-slate-950/55 p-5 shadow-[0_16px_28px_rgba(3,8,24,0.5)] sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="vw-headline text-2xl text-white">Writer Studio</h2>
          <p className="text-sm text-slate-300">Word-like drafting space with formatting tools and save flow.</p>
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

      <input
        type="text"
        value={manuscript.title}
        onChange={(event) => onUpdate({ title: event.target.value })}
        className="w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
        placeholder="Manuscript title"
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

      <footer className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.14em] text-slate-400">
        <span>{manuscript.wordCount} words</span>
        <span>{manuscript.lastSavedAt ? `Last saved: ${new Date(manuscript.lastSavedAt).toLocaleString()}` : 'Not saved yet'}</span>
      </footer>
    </section>
  )
}

export default ManuscriptStudio
