import { AlertCircle, KeyRound, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import useVerseStore from '../../store/useVerseStore'

function LoginScreen() {
  const { login, register, authMode, setAuthMode, authError, setAuthError } = useVerseStore(
    useShallow((state) => ({
      login: state.login,
      register: state.register,
      authMode: state.auth.mode,
      setAuthMode: state.setAuthMode,
      authError: state.auth.error,
      setAuthError: state.setAuthError,
    })),
  )

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!usernameOrEmail.trim() || !password.trim()) {
      setAuthError('Please enter both username/email and password.')
      return
    }

    if (authMode === 'login') {
      await login({ email: usernameOrEmail, password })
      return
    }

    await register({
      name: usernameOrEmail,
      email: usernameOrEmail,
      password,
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1600&q=80"
      >
        <source src="/videos/arena-duel.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

      <section className="vw-login-hero pointer-events-none absolute inset-x-0 top-0 z-10 h-[62vh]">
        <div className="vw-login-hero__frame" />
        <div className="vw-login-ring" />
        <figure className="vw-login-fighter vw-login-fighter--ice" />
        <figure className="vw-login-fighter vw-login-fighter--fire" />
      </section>

      <header className="relative z-30 flex items-center justify-between px-4 pb-2 pt-4 sm:px-8">
        <div className="inline-flex items-center gap-3">
          <div className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 p-2 text-cyan-200">
            <Sparkles size={18} />
          </div>
          <p className="vw-headline text-lg tracking-[0.16em] text-cyan-100">VERSEWEAVER</p>
        </div>

        <div className="inline-flex rounded-full border border-slate-100/20 bg-slate-950/65 p-1 text-xs">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={[
              'rounded-full px-4 py-2 font-semibold uppercase tracking-[0.1em] transition',
              authMode === 'login'
                ? 'bg-cyan-300/20 text-cyan-100 shadow-[0_0_18px_rgba(54,214,255,0.22)]'
                : 'text-slate-300',
            ].join(' ')}
          >
            LOGIN
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={[
              'rounded-full px-4 py-2 font-semibold uppercase tracking-[0.1em] transition',
              authMode === 'register'
                ? 'bg-orange-300/20 text-orange-100 shadow-[0_0_18px_rgba(255,156,88,0.2)]'
                : 'text-slate-300',
            ].join(' ')}
          >
            CREATE ACCOUNT
          </button>
        </div>
      </header>

      <section className="relative z-30 flex min-h-[calc(100vh-64px)] flex-col items-center justify-end px-4 pb-10 sm:px-8">
        <article className="w-full max-w-xl rounded-2xl border border-cyan-200/20 bg-[#0B1520]/80 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-7">
          <h1 className="vw-headline text-center text-2xl leading-tight text-slate-100 sm:text-3xl">
            PROVE YOUR FATE IN THE ARENA. THEN CRAFT YOUR LEGEND.
          </h1>
          <p className="mt-2 text-center text-sm text-slate-300">Visual Pre-Visualization & Inspiration Lab</p>
          <p className="mt-2 text-center text-xs uppercase tracking-[0.14em] text-cyan-100/90">
            VERSEWEAVER - CINEMATIC AUTHOR ACCESS
          </p>

          <div className="mt-5 inline-flex w-full rounded-full border border-slate-100/20 bg-slate-900/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={[
                'w-1/2 rounded-full px-4 py-2 font-semibold uppercase tracking-[0.1em] transition',
                authMode === 'login' ? 'bg-cyan-300/20 text-cyan-100' : 'text-slate-300',
              ].join(' ')}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={[
                'w-1/2 rounded-full px-4 py-2 font-semibold uppercase tracking-[0.1em] transition',
                authMode === 'register' ? 'bg-orange-300/20 text-orange-100' : 'text-slate-300',
              ].join(' ')}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-300">
            Enter the arena, then enter your writing universe. Your projects stay synchronized once you sign in.
          </p>

          {authError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-300/35 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
              <AlertCircle size={15} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(event) => setUsernameOrEmail(event.target.value)}
              placeholder="Username or Email"
              className="w-full rounded-xl border border-slate-100/20 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-100/20 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/55 bg-gradient-to-r from-cyan-500/35 to-teal-400/30 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100 shadow-[0_0_20px_rgba(54,214,255,0.25)] transition hover:from-cyan-400/40 hover:to-teal-300/35"
            >
              {authMode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              →] LOGIN TO VERSEWEAVER
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
            <KeyRound size={14} />
            LOCAL PROTOTYPE AUTHENTICATION FOR NOW
          </div>
        </article>
      </section>

      <style>{`
        .vw-login-hero__frame {
          position: absolute;
          inset: 54px 18px auto;
          height: min(50vh, 460px);
          border-radius: 22px;
          border: 1px solid rgba(170, 201, 255, 0.25);
          box-shadow: 0 24px 60px rgba(5, 10, 26, 0.45), inset 0 0 40px rgba(12, 27, 56, 0.4);
          background: linear-gradient(180deg, rgba(8, 12, 25, 0.15), rgba(8, 12, 25, 0.45));
        }

        .vw-login-ring {
          position: absolute;
          left: 50%;
          bottom: 8%;
          width: min(74vw, 880px);
          height: clamp(110px, 19vh, 180px);
          transform: translateX(-50%);
          border-radius: 999px;
          border: 2px solid rgba(255, 166, 109, 0.6);
          box-shadow: 0 0 24px rgba(255, 143, 84, 0.56), inset 0 0 30px rgba(255, 181, 117, 0.22);
          animation: ringPulse 2.6s ease-in-out infinite;
        }

        .vw-login-fighter {
          position: absolute;
          bottom: 14%;
          width: clamp(180px, 22vw, 340px);
          height: clamp(240px, 52vh, 430px);
          border-radius: 28px;
          border: 1px solid rgba(216, 232, 255, 0.25);
          background-size: cover;
          background-position: center;
          box-shadow: 0 24px 48px rgba(3, 8, 18, 0.65);
          overflow: hidden;
        }

        .vw-login-fighter::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 20%, rgba(8, 13, 26, 0.66));
        }

        .vw-login-fighter--ice {
          left: 14%;
          background-image: url('https://images.unsplash.com/photo-1519338381761-c7523edc1f46?auto=format&fit=crop&w=900&q=80');
          transform: rotateY(18deg) rotateZ(-5deg);
          animation: iceFighterMove 3.8s ease-in-out infinite;
          filter: drop-shadow(0 0 28px rgba(97, 205, 255, 0.35));
        }

        .vw-login-fighter--fire {
          right: 14%;
          background-image: url('https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=900&q=80');
          transform: rotateY(-18deg) rotateZ(5deg);
          animation: fireFighterMove 3.8s ease-in-out infinite;
          filter: drop-shadow(0 0 28px rgba(255, 153, 87, 0.35));
        }

        @keyframes ringPulse {
          0%, 100% { transform: translateX(-50%) scale(0.98); opacity: 0.74; }
          50% { transform: translateX(-50%) scale(1.02); opacity: 1; }
        }

        @keyframes iceFighterMove {
          0%, 100% { transform: translateY(8px) rotateY(18deg) rotateZ(-5deg) scale(0.97); }
          50% { transform: translateY(-10px) rotateY(10deg) rotateZ(-2deg) scale(1.04); }
        }

        @keyframes fireFighterMove {
          0%, 100% { transform: translateY(8px) rotateY(-18deg) rotateZ(5deg) scale(0.97); }
          50% { transform: translateY(-10px) rotateY(-10deg) rotateZ(2deg) scale(1.04); }
        }

        @media (max-width: 1024px) {
          .vw-login-hero {
            height: clamp(320px, 46vh, 400px);
          }

          .vw-login-fighter {
            width: clamp(130px, 18vw, 220px);
            height: clamp(180px, 36vh, 310px);
            bottom: 18%;
          }

          .vw-login-fighter--ice { left: 8%; }
          .vw-login-fighter--fire { right: 8%; }
        }

        @media (max-width: 640px) {
          .vw-login-hero {
            height: 320px;
          }

          .vw-login-fighter {
            width: 112px;
            height: 180px;
            bottom: 24%;
          }

          .vw-login-fighter--ice { left: 4%; }
          .vw-login-fighter--fire { right: 4%; }

          .vw-login-hero__frame {
            inset: 58px 8px auto;
          }
        }
      `}</style>
    </main>
  )
}

export default LoginScreen
