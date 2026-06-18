import axios from 'axios'
import { toast } from 'react-toastify'
import { DEV_API_URL } from '~/utils/constant'

let isRedirecting = false
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const authorizedAxiosInstance = axios.create()

authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10
authorizedAxiosInstance.defaults.withCredentials = true

// Request interceptor - thêm access token vào header
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

// Response interceptor - xử lý refresh token
authorizedAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh, đợi và retry
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return authorizedAxiosInstance(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Gọi API refresh token
        const response = await axios.post(
          `${DEV_API_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = response.data.accessToken

        // Lưu token mới vào localStorage
        localStorage.setItem('accessToken', newAccessToken)

        // Cập nhật header cho request hiện tại
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        // Process queue
        processQueue(null, newAccessToken)

        // Retry request gốc
        return authorizedAxiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh token thất bại
        processQueue(refreshError, null)

        // Xóa token và chuyển hướng về login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('persist:root')

        if (!isRedirecting) {
          isRedirecting = true
          toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Xử lý lỗi 503 (Maintenance)
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