import { useMemo, useState } from 'react'

function CharactersWorkspace({ characters, selectedCharacterId, onSelectCharacter, onAddCharacter }) {
  const [filter, setFilter] = useState('All')
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    role: '',
    category: 'Fiction',
    style: 'Animation',
    avatarImg: '',
    traits: '',
    backstory: '',
  })

  const visibleCharacters = useMemo(() => {
    if (filter === 'All') return characters
    return characters.filter((character) => character.category === filter)
  }, [characters, filter])

  const submitCharacter = (event) => {
    event.preventDefault()
    if (!newCharacter.name.trim() || !newCharacter.role.trim()) return

    onAddCharacter({
      ...newCharacter,
      name: newCharacter.name.trim(),
      role: newCharacter.role.trim(),
      avatarImg:
        newCharacter.avatarImg.trim() ||
        'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=700&q=80',
      traits: newCharacter.traits
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
      status: 'Drafting',
    })

    setNewCharacter({
      name: '',
      role: '',
      category: 'Fiction',
      style: 'Animation',
      avatarImg: '',
      traits: '',
      backstory: '',
    })
  }

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="vw-headline text-2xl text-white">Character Atlas</h2>
          <div className="flex gap-2">
            {['All', 'Real', 'Fiction'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]',
                  filter === item
                    ? 'border-cyan-200/75 bg-cyan-300/20 text-cyan-100'
                    : 'border-slate-100/20 text-slate-200 hover:border-slate-100/45',
                ].join(' ')}
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleCharacters.map((character) => (
            <button
              key={character.id}
              type="button"
              onClick={() => onSelectCharacter(character.id)}
              className={[
                'overflow-hidden rounded-2xl border text-left transition',
                selectedCharacterId === character.id
                  ? 'border-cyan-300/60 bg-slate-900/80 shadow-[0_0_24px_rgba(54,214,255,0.25)]'
                  : 'border-slate-100/10 bg-slate-900/50 hover:border-cyan-300/45',
              ].join(' ')}
            >
              <img src={character.avatarImg} alt={character.name} className="h-44 w-full object-cover" loading="lazy" />
              <div className="space-y-1 p-3">
                <p className="font-semibold text-white">{character.name}</p>
                <p className="text-xs uppercase tracking-[0.12em] text-cyan-100">
                  {character.category} / {character.style}
                </p>
                <p className="text-sm text-slate-300">{character.role}</p>
              </div>
            </button>
          ))}
        </div>
      </article>

      <form onSubmit={submitCharacter} className="rounded-3xl border border-slate-100/10 bg-slate-950/55 p-5">
        <h3 className="text-xl font-semibold text-white">Add Character</h3>
        <p className="mt-1 text-sm text-slate-300">Supports both real-world and fictional animated profiles.</p>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={newCharacter.name}
            onChange={(event) => setNewCharacter((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 focus:ring"
            placeholder="Name"
          />
          <input
            type="text"
            value={newCharacter.role}
            onChange={(event) => setNewCharacter((prev) => ({ ...prev, role: event.target.value }))}
            className="w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 focus:ring"
            placeholder="Role"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newCharacter.category}
              onChange={(event) => setNewCharacter((prev) => ({ ...prev, category: event.target.value }))}
              className="rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option>Fiction</option>
              <option>Real</option>
            </select>
            <select
              value={newCharacter.style}
              onChange={(event) => setNewCharacter((prev) => ({ ...prev, style: event.target.value }))}
              className="rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none"
            >
              <option>Animation</option>
              <option>Live Action</option>
            </select>
          </div>
          <input
            type="url"
            value={newCharacter.avatarImg}
            onChange={(event) => setNewCharacter((prev) => ({ ...prev, avatarImg: event.target.value }))}
            className="w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 focus:ring"
            placeholder="Avatar image URL (optional)"
          />
          <input
            type="text"
            value={newCharacter.traits}
            onChange={(event) => setNewCharacter((prev) => ({ ...prev, traits: event.target.value }))}
            className="w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 focus:ring"
            placeholder="Traits (comma separated)"
          />
          <textarea
            value={newCharacter.backstory}
            onChange={(event) => setNewCharacter((prev) => ({ ...prev, backstory: event.target.value }))}
            className="h-24 w-full rounded-xl border border-slate-100/15 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300/45 focus:ring"
            placeholder="Backstory"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-xl border border-cyan-300/45 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/25"
        >
          Add Character
        </button>
      </form>
    </section>
  )
}

export default CharactersWorkspace
