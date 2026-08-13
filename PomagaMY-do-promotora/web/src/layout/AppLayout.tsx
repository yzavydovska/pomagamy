import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AppFooter } from '../components/AppFooter'

export function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}
