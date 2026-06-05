import { AlertCircle, LogIn, Sparkles, UserPlus } from 'lucide-react'
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usernameOrEmail.trim() || !password.trim()) {
      setAuthError('Please enter both username/email and password.')
      return
    }
    if (authMode === 'login') {
      await login({ email: usernameOrEmail, password })
    } else {
      await register({ name: usernameOrEmail, email: usernameOrEmail, password })
    }
  }

  return (
    <div className="vw-page">
      {/* ── Top nav ─────────────────────────────────────────── */}
      <nav className="vw-nav">
        <div className="vw-nav-brand">
          <span className="vw-nav-icon"><Sparkles size={16} /></span>
          <span className="vw-nav-title">VERSEWEAVER</span>
        </div>
        <div className="vw-nav-tabs">
          <button
            type="button"
            className={`vw-tab ${authMode === 'login' ? 'vw-tab--active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            LOGIN
          </button>
          <button
            type="button"
            className={`vw-tab ${authMode === 'register' ? 'vw-tab--active-reg' : ''}`}
            onClick={() => setAuthMode('register')}
          >
            CREATE ACCOUNT
          </button>
        </div>
      </nav>

      {/* ── Hero illustration ──────────────────────────────── */}
      <div className="vw-hero">
        <img
          className="vw-hero-img vw-hero-img--1"
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1800&q=90"
          alt=""
          aria-hidden="true"
        />
        <img
          className="vw-hero-img vw-hero-img--2"
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1800&q=90"
          alt=""
          aria-hidden="true"
        />
        <img
          className="vw-hero-img vw-hero-img--3"
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1800&q=90"
          alt=""
          aria-hidden="true"
        />
        <div className="vw-hero-overlay" />
      </div>

      {/* ── Overlapping auth card ──────────────────────────── */}
      <div className="vw-card-wrap">
        <div className="vw-card">
          {/* brand row */}
          <div className="vw-card-brand">
            <span className="vw-card-brand-icon"><Sparkles size={13} /></span>
            <div>
              <p className="vw-card-brand-name">VERSEWEAVER</p>
              <p className="vw-card-brand-access">CINEMATIC AUTHOR ACCESS</p>
            </div>
          </div>

          {/* mode toggle */}
          <div className="vw-toggle">
            <button
              type="button"
              className={`vw-toggle-btn ${authMode === 'login' ? 'vw-toggle-btn--on' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              LOGIN
            </button>
            <button
              type="button"
              className={`vw-toggle-btn ${authMode === 'register' ? 'vw-toggle-btn--on' : ''}`}
              onClick={() => setAuthMode('register')}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {/* body copy */}
          <p className="vw-card-body">
            Enter the arena, then enter your writing universe. Your projects stay
            synchronized once you sign in.
          </p>

          {/* error */}
          {authError && (
            <div className="vw-error">
              <AlertCircle size={14} />
              <span>{authError}</span>
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="vw-form">
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="imbeka"
              className="vw-input"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              className="vw-input"
            />
            <button type="submit" className="vw-submit">
              {authMode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
              &nbsp;→ LOGIN TO VERSEWEAVER
            </button>
          </form>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .vw-page {
          min-height: 100vh;
          background: #08111f;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ── nav ── */
        .vw-nav {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 22px;
          background: rgba(8, 17, 35, 0.88);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .vw-nav-brand {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .vw-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(99,179,237,0.15);
          border: 1px solid rgba(99,179,237,0.35);
          color: #90cdf4;
        }

        .vw-nav-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #bee3f8;
        }

        .vw-nav-tabs {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 3px;
        }

        .vw-tab {
          padding: 5px 16px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #94a3b8;
          transition: all .2s;
        }

        .vw-tab--active {
          background: rgba(99,179,237,0.22);
          color: #bee3f8;
          box-shadow: 0 0 14px rgba(99,179,237,0.22);
        }

        /* ── hero ── */
        .vw-hero {
          position: relative;
          width: 100%;
          height: clamp(340px, 54vh, 560px);
          overflow: hidden;
          flex-shrink: 0;
          background: #08111f;
        }

        .vw-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 40%;
          display: block;
          opacity: 0;
          animation: heroFade 18s infinite;
        }

        .vw-hero-img--1 { animation-delay: 0s; }
        .vw-hero-img--2 { animation-delay: 6s; }
        .vw-hero-img--3 { animation-delay: 12s; }

        @keyframes heroFade {
          0%   { opacity: 0; }
          8%   { opacity: 1; }
          33%  { opacity: 1; }
          41%  { opacity: 0; }
          100% { opacity: 0; }
        }

        .vw-hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            to bottom,
            rgba(8,17,35,0.22) 0%,
            rgba(8,17,35,0.28) 55%,
            rgba(8,17,35,0.78) 100%
          );
        }

        /* ── card wrap ── */
        .vw-card-wrap {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: center;
          margin-top: -130px;
          padding: 0 16px 40px;
        }

        /* ── card ── */
        .vw-card {
          width: 100%;
          max-width: 468px;
          background: rgba(10, 19, 38, 0.86);
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 16px;
          padding: 24px 24px 20px;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow:
            0 24px 60px rgba(0,0,0,0.55),
            0 2px 0 rgba(255,255,255,0.04) inset;
        }

        .vw-card-headline {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 1.25;
          color: #f1f5f9;
          text-align: center;
          text-transform: uppercase;
        }

        .vw-card-sub {
          margin-top: 6px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }

        .vw-card-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
        }

        .vw-card-brand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: rgba(99,179,237,0.14);
          border: 1px solid rgba(99,179,237,0.3);
          color: #90cdf4;
          flex-shrink: 0;
        }

        .vw-card-brand-name {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #bee3f8;
        }

        .vw-card-brand-access {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: #64748b;
          text-transform: uppercase;
          margin-top: 1px;
        }

        /* ── toggle ── */
        .vw-toggle {
          display: flex;
          align-items: center;
          gap: 2px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 3px;
          margin-top: 12px;
        }

        .vw-toggle-btn {
          flex: 1;
          padding: 5px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          border: none;
          cursor: pointer;
          background: transparent;
          color: #64748b;
          transition: all .2s;
        }

        .vw-toggle-btn--on {
          background: rgba(99,179,237,0.2);
          color: #bee3f8;
        }

        .vw-card-body {
          margin-top: 12px;
          font-size: 12.5px;
          line-height: 1.6;
          color: #94a3b8;
        }

        /* ── form ── */
        .vw-form {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vw-input {
          width: 100%;
          padding: 10px 14px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(148,163,184,0.18);
          border-radius: 10px;
          font-size: 13px;
          color: #e2e8f0;
          outline: none;
          transition: border-color .2s;
        }

        .vw-input::placeholder { color: #475569; }
        .vw-input:focus { border-color: rgba(99,179,237,0.45); }

        .vw-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: 1px solid rgba(56,189,248,0.4);
          background: linear-gradient(135deg, rgba(14,116,144,0.65), rgba(21,94,117,0.5));
          color: #bae6fd;
          cursor: pointer;
          transition: all .2s;
        }

        .vw-submit:hover {
          background: linear-gradient(135deg, rgba(14,116,144,0.85), rgba(21,94,117,0.7));
        }

        /* ── error ── */
        .vw-error {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(220,38,38,0.12);
          border: 1px solid rgba(252,165,165,0.25);
          font-size: 12px;
          color: #fca5a5;
        }
      `}</style>
    </div>
  )
}

export default LoginScreen
