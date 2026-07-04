import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export const RejectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const userInfo = useSelector((state) => state.user.userInfo)

  // Nếu đã đăng nhập, redirect theo role
  if (isAuthenticated && userInfo) {
    if (userInfo.roleId === 1) {
      return <Navigate to="/admin/dashboard" replace />
    } else if (userInfo.roleId === 2) {
      return <Navigate to="/manager/stores" replace />
    } else if (userInfo.roleId === 3) {
      return <Navigate to="/vendor/dashboard" replace />
    }
    // USER (roleId = 4) về trang chủ
    return <Navigate to="/" replace />
  }

  // Chưa đăng nhập -> cho vào trang auth
  return <Outlet />
}

// Role Guard
export const RoleGuard = ({ allowedRoles, children }) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const userInfo = useSelector((state) => state.user.userInfo)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(userInfo?.roleId)) {
    return <Navigate to="/" replace />
  }

  return children
}