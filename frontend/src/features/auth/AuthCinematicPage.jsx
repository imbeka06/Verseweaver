import { AlertCircle, KeyRound, LogIn, Sparkles, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import DuelScene3D from './DuelScene3D'
import useVerseStore from '../../store/useVerseStore'

function AuthCinematicPage() {
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

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = async (event) => {
    event.preventDefault()
    await login(loginForm)
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match.')
      return
    }

    await register(registerForm)
  }

  return (
    <main className="auth-scene min-h-screen text-slate-100">
      <div className="auth-scene__backdrop" />

      <section className="auth-shell mx-auto w-full max-w-[1280px] px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="auth-topbar rounded-t-3xl border border-slate-100/10 bg-slate-950/65 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 p-2 text-cyan-200">
                <Sparkles size={18} />
            </div>
              <p className="vw-headline text-lg tracking-[0.16em] text-cyan-100">VERSEWEAVER</p>
            </div>

            <div className="inline-flex rounded-full border border-slate-100/15 bg-slate-900/70 p-1 text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={[
                  'rounded-full px-4 py-2 font-semibold uppercase tracking-[0.1em] transition',
                  authMode === 'login' ? 'bg-cyan-300/20 text-cyan-100' : 'text-slate-300',
                ].join(' ')}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={[
                  'rounded-full px-4 py-2 font-semibold uppercase tracking-[0.1em] transition',
                  authMode === 'register' ? 'bg-orange-300/20 text-orange-100' : 'text-slate-300',
                ].join(' ')}
              >
                Create Account
              </button>
            </div>
          </div>
        </header>

        <DuelScene3D />

        <section className="auth-panel-wrapper px-1">
          <article className="auth-panel mx-auto w-full max-w-xl rounded-3xl border border-slate-100/15 bg-slate-950/78 p-6 backdrop-blur-xl sm:p-8">
            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              Enter the arena, then enter your writing universe. Your projects stay synchronized once you sign in.
            </p>

            {authError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-300/35 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                <AlertCircle size={15} />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-3">
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-xl border border-slate-100/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
                />
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-100/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-300/45 transition focus:ring"
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/45 bg-cyan-400/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/25"
                >
                  <LogIn size={16} />
                  Login to VerseWeaver
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Display Name"
                  className="w-full rounded-xl border border-slate-100/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 outline-none ring-orange-300/45 transition focus:ring sm:col-span-2"
                />
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="w-full rounded-xl border border-slate-100/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 outline-none ring-orange-300/45 transition focus:ring sm:col-span-2"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-100/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 outline-none ring-orange-300/45 transition focus:ring"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={registerForm.confirmPassword}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Confirm Password"
                  className="w-full rounded-xl border border-slate-100/15 bg-slate-900/75 px-4 py-3 text-sm text-slate-100 outline-none ring-orange-300/45 transition focus:ring"
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-300/45 bg-orange-400/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-orange-100 transition hover:bg-orange-300/25 sm:col-span-2"
                >
                  <UserPlus size={16} />
                  Create Account
                </button>
              </form>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-400">
              <KeyRound size={14} />
              Local prototype authentication for now
            </div>
          </article>
        </section>
      </section>
    </main>
  )
}

export default AuthCinematicPage
