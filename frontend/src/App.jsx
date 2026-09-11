import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import LoginScreen from './features/auth/LoginScreen'
import NetflixDashboard from './features/dashboard/NetflixDashboard'
import useVerseStore from './store/useVerseStore'

function App() {
  const { isAuthenticated, restoreSession } = useVerseStore(
    useShallow((state) => ({
      isAuthenticated: state.auth.isAuthenticated,
      restoreSession: state.restoreSession,
    })),
  )

  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    let active = true
    restoreSession().finally(() => {
      if (active) setRestoring(false)
    })
    return () => {
      active = false
    }
  }, [restoreSession])

  if (restoring) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <NetflixDashboard />
}

export default App
