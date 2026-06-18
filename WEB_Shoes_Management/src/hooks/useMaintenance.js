import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'
import { logoutSuccess } from '~/redux/user/userSlice'

export const useMaintenance = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isMaintenance, setIsMaintenance] = useState(() => {
    return localStorage.getItem('isMaintenance') === 'true'
  })
  const [maintenanceMessage, setMaintenanceMessage] = useState(() => {
    return localStorage.getItem('maintenanceMessage') || ''
  })
  const [loading, setLoading] = useState(true)

  const checkMaintenance = async () => {
    try {
      const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/system-settings`)
      const data = response.data
      const isActive = data.is_maintenance === 1

      setIsMaintenance(isActive)
      setMaintenanceMessage(data.maintenance_message || '')

      if (isActive) {
        localStorage.setItem('isMaintenance', 'true')
        localStorage.setItem('maintenanceMessage', data.maintenance_message || '')
      } else {
        localStorage.removeItem('isMaintenance')
        localStorage.removeItem('maintenanceMessage')
      }
    } catch (error) {
      if (error.response?.status === 503) {
        const message = localStorage.getItem('maintenanceMessage') || 'Hệ thống đang bảo trì'
        setMaintenanceMessage(message)
        setIsMaintenance(true)
      } else {
        setIsMaintenance(false)
        setMaintenanceMessage('')
        localStorage.removeItem('isMaintenance')
        localStorage.removeItem('maintenanceMessage')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceLogout = () => {
    // Xóa tất cả dữ liệu localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('persist:root')
    localStorage.removeItem('isMaintenance')
    localStorage.removeItem('maintenanceMessage')

    // Dispatch logout Redux
    dispatch(logoutSuccess())

    // Điều hướng về trang login
    navigate('/login')
  }

  useEffect(() => {
    checkMaintenance()

    const handleMaintenanceEvent = (event) => {
      setIsMaintenance(true)
      setMaintenanceMessage(event.detail?.message || 'Hệ thống đang bảo trì')
      localStorage.setItem('isMaintenance', 'true')
      localStorage.setItem('maintenanceMessage', event.detail?.message || 'Hệ thống đang bảo trì')
    }

    window.addEventListener('maintenanceMode', handleMaintenanceEvent)

    return () => {
      window.removeEventListener('maintenanceMode', handleMaintenanceEvent)
    }
  }, [])

  return {
    isMaintenance,
    maintenanceMessage,
    loading,
    checkMaintenance,
    handleMaintenanceLogout
  }
}