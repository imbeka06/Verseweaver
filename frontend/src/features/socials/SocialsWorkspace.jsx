import {
  Globe,
  Heart,
  MessageCircle,
  PlusCircle,
  RotateCcw,
  Send,
  Share2,
  UserPlus,
  Users,
} from 'lucide-react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { SOCIALS_EVENTS, connectSocialsSocket, disconnectSocialsSocket } from '../../lib/socket'

const MAX_MESSAGE_LENGTH = 2000
const POLL_INTERVAL_MS = 15000

const dayKey = (iso) => new Date(iso).toDateString()

const formatDayLabel = (iso) => {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const initialsOf = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

function SocialsWorkspace({
  socials,
  role,
  compact = false,
  onCreatePost,
  onFollowWriter,
  onSendMessage,
  onAppendMessage,
  onRetryMessage,
  onRefreshSocials,
  authUserId,
}) {
  const [postExcerpt, setPostExcerpt] = useState('')
  const [followerName, setFollowerName] = useState('')
  const [dmText, setDmText] = useState('')
  const [sending, setSending] = useState(false)
  const [live, setLive] = useState(false)

  const canWrite = role === 'owner' || role === 'admin'
  const myName = socials.profile.displayName

  // ── message ordering + day separators ──────────────────────────────────
  const orderedMessages = useMemo(
    () =>
      [...socials.messages].sort(
        (left, right) => new Date(left.createdAt) - new Date(right.createdAt),
      ),
    [socials.messages],
  )

  // ── auto-scroll (only while pinned near the bottom) ────────────────────
  const scrollRef = useRef(null)
  const pinnedRef = useRef(true)

  const scrollToBottom = (smooth) => {
    const element = scrollRef.current
    if (!element) return
    element.scrollTo({ top: element.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(() => {
    if (pinnedRef.current) scrollToBottom(orderedMessages.length > 1)
  }, [orderedMessages.length])

  useEffect(() => {
    scrollToBottom(false)
  }, [])

  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return
    pinnedRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80
  }

  // ── realtime delivery with polling fallback ────────────────────────────
  const liveRef = useRef(false)
  const refreshRef = useRef(onRefreshSocials)

  useEffect(() => {
    liveRef.current = live
  }, [live])

  useEffect(() => {
    refreshRef.current = onRefreshSocials
  }, [onRefreshSocials])

  useEffect(() => {
    if (!authUserId || !onAppendMessage) return undefined

    const socket = connectSocialsSocket(authUserId)
    if (!socket) return undefined

    const handleConnect = () => setLive(true)
    const handleDisconnect = () => setLive(false)
    const handleMessageCreated = (message) => {
      if (message?.id) onAppendMessage(message)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on(SOCIALS_EVENTS.messageCreated, handleMessageCreated)

    // The socket may already be connected (module singleton): reflect that
    // asynchronously so the effect never sets state synchronously.
    let syncTimer = null
    if (socket.connected) {
      syncTimer = setTimeout(() => setLive(true), 0)
    }

    return () => {
      if (syncTimer) clearTimeout(syncTimer)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off(SOCIALS_EVENTS.messageCreated, handleMessageCreated)
      disconnectSocialsSocket()
    }
  }, [authUserId, onAppendMessage])

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!liveRef.current) refreshRef.current?.()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [])

  // ── handlers ───────────────────────────────────────────────────────────
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
    if (event?.preventDefault) event.preventDefault()
    const text = dmText.trim()
    if (!text || sending) return

    // Optimistic: clear the composer immediately; the bubble appears as
    // "sending" until the backend confirms (or flags it for retry).
    setDmText('')
    setSending(true)
    try {
      await onSendMessage({ senderName: canWrite ? myName : 'Follower', text })
    } finally {
      setSending(false)
    }
  }

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitMessage(event)
    }
  }

  const textareaRef = useRef(null)
  useEffect(() => {
    const element = textareaRef.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 120)}px`
  }, [dmText])

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

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
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

        {/* ── Direct messages ─────────────────────────────────────────── */}
        <aside className="flex flex-col rounded-2xl border border-slate-100/10 bg-slate-900/45 p-4">
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">
              Direct Messages
            </h3>
            <span
              className={[
                'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                live
                  ? 'border-emerald-300/35 bg-emerald-400/10 text-emerald-100'
                  : 'border-slate-100/15 bg-slate-900/60 text-slate-400',
              ].join(' ')}
            >
              <span
                className={[
                  'h-1.5 w-1.5 rounded-full',
                  live ? 'animate-pulse bg-emerald-300' : 'bg-slate-500',
                ].join(' ')}
              />
              {live ? 'Live' : 'Polling'}
            </span>
          </header>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="mt-3 h-[400px] space-y-2 overflow-y-auto pr-1"
          >
            {orderedMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-100/10 text-center">
                <MessageCircle size={20} className="text-slate-500" />
                <p className="max-w-[200px] text-xs text-slate-400">
                  No messages yet — start the conversation.
                </p>
              </div>
            ) : (
              orderedMessages.map((message, index) => {
                const previous = orderedMessages[index - 1]
                const showDaySeparator =
                  !previous || dayKey(previous.createdAt) !== dayKey(message.createdAt)
                const mine = message.senderName === myName

                return (
                  <Fragment key={message.id}>
                    {showDaySeparator && (
                      <div className="pt-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {formatDayLabel(message.createdAt)}
                      </div>
                    )}
                    <div className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                      <span
                        className={[
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                          mine
                            ? 'border-cyan-300/30 bg-cyan-400/15 text-cyan-100'
                            : 'border-slate-100/20 bg-slate-800/70 text-slate-300',
                        ].join(' ')}
                      >
                        {initialsOf(message.senderName)}
                      </span>
                      <div
                        className={[
                          'max-w-[80%] rounded-2xl border px-3 py-2',
                          mine
                            ? 'rounded-br-sm border-cyan-300/25 bg-cyan-400/10'
                            : 'rounded-bl-sm border-slate-100/10 bg-slate-800/70',
                        ].join(' ')}
                      >
                        {!mine && (
                          <p className="text-[11px] font-semibold text-cyan-100/80">
                            {message.senderName}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100">
                          {message.text}
                        </p>
                        <div className="mt-1 flex items-center justify-end gap-2 text-[10px] text-slate-400">
                          <span>{formatTime(message.createdAt)}</span>
                          {mine && message.sending && <span className="text-slate-300">Sending…</span>}
                          {mine && message.failed && (
                            <button
                              type="button"
                              onClick={() => onRetryMessage(message.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-300/35 bg-rose-400/10 px-2 py-0.5 font-semibold text-rose-100"
                            >
                              <RotateCcw size={10} />
                              Failed — retry
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Fragment>
                )
              })
            )}
          </div>

          <form onSubmit={submitMessage} className="mt-3 space-y-2">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={dmText}
                onChange={(event) => {
                  if (event.target.value.length <= MAX_MESSAGE_LENGTH) {
                    setDmText(event.target.value)
                  }
                }}
                onKeyDown={handleComposerKeyDown}
                rows={1}
                placeholder="Type a message…  (Enter to send, Shift+Enter for a new line)"
                className="max-h-[120px] min-h-[38px] w-full resize-none rounded-lg border border-slate-100/15 bg-slate-950/75 px-3 py-2 text-sm text-slate-100 outline-none"
              />
              <button
                type="submit"
                disabled={!dmText.trim() || sending}
                className="inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-lg border border-fuchsia-300/45 bg-fuchsia-400/15 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={13} />
                Send
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{sending ? 'Sending…' : 'Messages are delivered live when connected.'}</span>
              <span className={dmText.length > MAX_MESSAGE_LENGTH - 100 ? 'text-amber-200/80' : ''}>
                {dmText.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </form>
        </aside>
      </section>
    </section>
  )
}

export default SocialsWorkspace
