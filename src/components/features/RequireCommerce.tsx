import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/store/session'

export function RequireCommerce() {
  const commerce = useSessionStore((s) => s.commerce)
  if (!commerce) return <Navigate to="/comercio/login" replace />
  return <Outlet />
}
