import axios from 'axios'
import { toast } from 'react-toastify'

let isRedirecting = false // Thêm flag để tránh redirect nhiều lần

const authorizedAxiosInstance = axios.create()

authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
authorizedAxiosInstance.defaults.withCredentials = true

authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true

      localStorage.removeItem('accessToken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('persist:root')

      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')

      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }

    if (error.response?.status === 503) {
      const maintenanceMessage = error.response?.data?.maintenanceMessage || 'Hệ thống đang bảo trì'

      // Lưu thông báo vào localStorage
      localStorage.setItem('maintenanceMessage', maintenanceMessage)
      localStorage.setItem('isMaintenance', 'true')

      // Dispatch event để các component biết
      window.dispatchEvent(new CustomEvent('maintenanceMode', {
        detail: { message: maintenanceMessage }
      }))

      // Không toast error để tránh làm phiền người dùng
      return Promise.reject(error)
    }

    // Xử lý các lỗi khác (trừ 401 và 503)
    if (error.response?.status !== 410 &&
        error.response?.status !== 401 &&
        error.response?.status !== 503) {
      const errorMessage = error.response?.data?.message || error?.message
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance