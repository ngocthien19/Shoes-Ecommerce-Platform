import axios from 'axios'
import { toast } from 'react-toastify'

const authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa của 1 request (10 phút)
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// Cho phép axios đính kèm và gửi cookie (nếu BE có dùng cookie/session)
authorizedAxiosInstance.defaults.withCredentials = true

// 1. Request Interceptor: Chạy trước khi gửi request lên server
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // Lấy accessToken từ localStorage
    const accessToken = localStorage.getItem('accessToken')

    // Nếu có token thì đính kèm vào Header theo chuẩn Bearer
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 2. Response Interceptor: Chạy sau khi nhận kết quả từ server về
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Response từ server có format: { status, message, data: {...} }
    return response
  },
  (error) => {
    // Xử lý lỗi tập trung

    // Nếu nhận mã 401 (Unauthorized): Thường là token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userInfo')
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.')

      // Chuyển hướng về trang login (Dùng location.href để reset lại toàn bộ state app)
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }

    // Hiển thị thông báo lỗi bằng Toastify (Ngoại trừ mã 410 và 401 đã xử lý ở trên)
    if (error.response?.status !== 410 && error.response?.status !== 401) {
      const errorMessage = error.response?.data?.message || error?.message
      toast.error(errorMessage)
    }

    return Promise.reject(error)
  }
)

export default authorizedAxiosInstance