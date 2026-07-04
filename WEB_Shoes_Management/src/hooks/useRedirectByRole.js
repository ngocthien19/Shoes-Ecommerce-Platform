import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'

export const useRedirectByRole = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const userInfo = useSelector((state) => state.user.userInfo)
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !userInfo || hasRedirected.current) return

    // Chỉ redirect từ trang chủ "/"
    if (location.pathname === '/') {
      hasRedirected.current = true

      let redirectUrl = '/'
      if (userInfo.roleId === 1) redirectUrl = '/admin/dashboard'
      else if (userInfo.roleId === 2) redirectUrl = '/manager/stores'
      else if (userInfo.roleId === 3) redirectUrl = '/vendor/dashboard'

      if (redirectUrl !== '/') {
        navigate(redirectUrl, { replace: true })
      }
    }
  }, [isAuthenticated, userInfo, location.pathname, navigate])
}