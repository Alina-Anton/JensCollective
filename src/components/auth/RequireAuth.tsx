import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth() {
  const { user, loading, authReady } = useAuth()
  const location = useLocation()

  if (!authReady) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-transparent px-4">
        <p className="text-sm text-muted">Signing you in…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />
  }

  return <Outlet />
}
