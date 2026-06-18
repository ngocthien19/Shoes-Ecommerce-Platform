import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const adminPayoutApiService = {
  // Lấy danh sách yêu cầu rút tiền
  getPayouts: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.status) params.append('status', filters.status)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/payouts?${params.toString()}`)
    return response.data
  },

  // Lấy chi tiết yêu cầu rút tiền
  getPayoutDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/admin/payouts/${id}`)
    return response.data
  },

  // Xử lý yêu cầu rút tiền (duyệt/từ chối)
  processPayout: async (id, targetStatus, adminNote) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/admin/payouts/${id}/process`,
      { targetStatus, adminNote }
    )
    return response.data
  }
}