import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

// Map role_id -> redirect path
const ROLE_REDIRECT_MAP = {
  1: '/admin/dashboard',
  2: '/manager/stores',
  3: '/vendor/dashboard',
  4: '/'
}

// 1. Chỉ cho phép truy cập ĐÃ ĐĂNG NHẬP. Chưa đăng nhập đá về /login
export const ProtectedRoute = () => {
  const location = useLocation()
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const user = useSelector((state) => state.user.userInfo)
  const loading = useSelector((state) => state.user.loading)

  // Đang loading thì chưa redirect
  if (loading) {
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

// 2. Chặn người dùng quay lại các trang Auth khi ĐÃ ĐĂNG NHẬP
export const RejectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const user = useSelector((state) => state.user.userInfo)
  const loading = useSelector((state) => state.user.loading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Nếu đã đăng nhập rồi mà cố vào /login, /register -> Đá về dashboard theo role
  if (isAuthenticated && user) {
    const redirectPath = ROLE_REDIRECT_MAP[user.roleId] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}