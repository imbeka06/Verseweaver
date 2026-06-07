import { Globe, Heart, MessageCircle, PlusCircle, Send, Share2, UserPlus, Users } from 'lucide-react'
import { useState } from 'react'

function SocialsWorkspace({
  socials,
  role,
  compact = false,
  onCreatePost,
  onFollowWriter,
  onSendMessage,
}) {
  const [postExcerpt, setPostExcerpt] = useState('')
  const [followerName, setFollowerName] = useState('')
  const [dmText, setDmText] = useState('')

  const canWrite = role === 'owner' || role === 'admin'

  const submitPost = async (event) => {
    event.preventDefault()
    if (!postExcerpt.trim()) return
    const success = await onCreatePost({ excerpt: postExcerpt, mediaUrl: null })
    if (success) {
      setPostExcerpt('')
    }
  }

  const submitFollow = async (event) => {
    event.preventDefault()
    if (!followerName.trim()) return
    const success = await onFollowWriter(followerName)
    if (success) {
      setFollowerName('')
    }
  }

  const submitMessage = async (event) => {
    event.preventDefault()
    if (!dmText.trim()) return
    const success = await onSendMessage({
      senderName: canWrite ? socials.profile.displayName : 'Follower',
      text: dmText,
    })
    if (success) {
      setDmText('')
    }
  }

  return (
    <section
      className={[
        'rounded-3xl border border-slate-100/10 bg-[#070d1f]/70 p-5 shadow-[0_14px_30px_rgba(2,6,20,0.5)]',
        compact ? 'space-y-4' : 'space-y-5',
      ].join(' ')}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2">
            <h2 className="vw-headline text-2xl text-white">Socials</h2>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
              Beta Int.
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Explore posted work, stories, and direct audience conversation.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-slate-100/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
          <Globe size={14} />
          {socials.profile.handle}
        </span>
      </header>

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100/10 bg-slate-900/40 p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=220&q=80"
              alt={socials.profile.displayName}
              className="h-14 w-14 rounded-full border border-slate-100/20 object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{socials.profile.displayName}</h3>
              <p className="text-sm text-slate-300">{socials.profile.role}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {socials.statuses.map((item) => (
              <div
                key={item.id}
                className="rounded-full border border-slate-100/20 bg-slate-800/55 px-3 py-2 text-xs text-slate-200"
              >
                {item.title}
              </div>
            ))}
            {socials.highlights.map((item) => (
              <div
                key={item.id}
                className="rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100"
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-3 rounded-xl border border-slate-100/10 bg-slate-950/45 p-3">
          <div className="inline-flex items-center gap-2 text-sm text-white">
            <Users size={14} />
            <span>Followers: {socials.stats.followers}</span>
          </div>
          <p className="text-xs text-slate-400">Following: {socials.stats.following}</p>

          <form onSubmit={submitFollow} className="space-y-2">
            <input
              type="text"
              value={followerName}
              onChange={(event) => setFollowerName(event.target.value)}
              placeholder="Follower name"
              className="w-full rounded-lg border border-slate-100/15 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 outline-none"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/45 bg-cyan-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100"
            >
              <UserPlus size={14} />
              Follow Writer
            </button>
          </form>
        </aside>
      </section>

      {canWrite && (
        <form onSubmit={submitPost} className="space-y-2 rounded-2xl border border-slate-100/10 bg-slate-900/35 p-4">
          <label className="text-xs uppercase tracking-[0.14em] text-slate-400">Post Online Work</label>
          <textarea
            value={postExcerpt}
            onChange={(event) => setPostExcerpt(event.target.value)}
            rows={3}
            placeholder="Share a snippet from your chapter..."
            className="w-full resize-none rounded-lg border border-slate-100/15 bg-slate-950/75 px-3 py-2 text-sm text-slate-100 outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/45 bg-emerald-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100"
          >
            <PlusCircle size={14} />
            Publish Excerpt
          </button>
        </form>
      )}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          {socials.posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-slate-100/10 bg-slate-900/40 p-4">
              <p className="text-sm leading-relaxed text-slate-100">{post.excerpt}</p>
              {post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt="post"
                  className="mt-3 h-36 w-full rounded-xl object-cover"
                  loading="lazy"
                />
              )}
              <footer className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Heart size={13} />
                  {post.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle size={13} />
                  {post.comments}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Share2 size={13} />
                  {post.shares}
                </span>
              </footer>
            </article>
          ))}
        </div>

        <aside className="space-y-3 rounded-2xl border border-slate-100/10 bg-slate-900/45 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">Direct Messages</h3>
          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {socials.messages.map((message) => (
              <article key={message.id} className="rounded-xl border border-slate-100/10 bg-slate-950/55 p-2">
                <p className="text-xs font-semibold text-cyan-100">{message.senderName}</p>
                <p className="mt-1 text-xs text-slate-300">{message.text}</p>
              </article>
            ))}
          </div>
          <form onSubmit={submitMessage} className="space-y-2">
            <input
              type="text"
              value={dmText}
              onChange={(event) => setDmText(event.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-lg border border-slate-100/15 bg-slate-950/75 px-3 py-2 text-xs text-slate-100 outline-none"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-fuchsia-300/45 bg-fuchsia-400/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-100"
            >
              <Send size={13} />
              Send Message
            </button>
          </form>
        </aside>
      </section>
    </section>
  )
}

export default SocialsWorkspace
