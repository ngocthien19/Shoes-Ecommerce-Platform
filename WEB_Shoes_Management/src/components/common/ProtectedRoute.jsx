import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const ROLE_REDIRECT_MAP = {
  1: '/admin/dashboard',
  2: '/manager/stores',
  3: '/vendor/dashboard',
  4: '/'
}

export const ProtectedRoute = () => {
  const location = useLocation()

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const user = useSelector((state) => state.user.userInfo)
  const loading = useSelector((state) => state.user.loading)

  // Lấy trạng thái hydrate từ persist
  const isHydrated = useSelector((state) => state._persist?.hydrated)

  // Nếu chưa hydrate hoặc đang loading -> hiển thị loading
  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Nếu đang ở "/" và có user -> redirect theo role
  if (location.pathname === '/') {
    const redirectPath = ROLE_REDIRECT_MAP[user.roleId] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export const RejectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const user = useSelector((state) => state.user.userInfo)
  const loading = useSelector((state) => state.user.loading)
  const isHydrated = useSelector((state) => state._persist?.hydrated)

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAuthenticated && user) {
    const redirectPath = ROLE_REDIRECT_MAP[user.roleId] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}