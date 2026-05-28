import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/store/session'

export function RequireAuth() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
