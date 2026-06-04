import { useShallow } from 'zustand/react/shallow'
import LoginScreen from './features/auth/LoginScreen'
import NetflixDashboard from './features/dashboard/NetflixDashboard'
import useVerseStore from './store/useVerseStore'

function App() {
  const { isAuthenticated } = useVerseStore(
    useShallow((state) => ({
      isAuthenticated: state.auth.isAuthenticated,
    })),
  )

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <NetflixDashboard />
}

export default App
