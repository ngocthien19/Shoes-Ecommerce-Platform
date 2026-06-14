import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const vendorProductApiService = {
  getVendorProducts: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)
    if (filters.search) params.append('search', filters.search)
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    if (filters.isActive !== undefined && filters.isActive !== null) params.append('isActive', filters.isActive)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)

    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/products?${params.toString()}`)
    return response.data
  },

  // Cập nhật trạng thái hiển thị (Ẩn/Hiện) của 1 sản phẩm
  toggleActiveSingle: async (id, isActive) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/products/${id}/toggle-active`, { isActive })
    return response.data
  },

  // Tạm ẩn/Hiện hàng loạt sản phẩm qua checkbox
  toggleActiveBulk: async (productIds, isActive) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/products/toggle-active-bulk`, { productIds, isActive })
    return response.data
  },

  // Xóa cứng đơn lẻ một sản phẩm
  deleteProductSingle: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/vendor/products/delete/${id}`)
    return response.data
  },

  // Xóa hàng loạt sản phẩm đã chọn từ checkbox
  deleteProductsBulk: async (productIds) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/vendor/products/delete-bulk`, { data: { productIds } })
    return response.data
  },

  // Gửi khiếu nại kiểm duyệt lại hàng loạt cho các giày bị Banned
  requestReapprovalBulk: async (productIds) => {
    const response = await authorizedAxiosInstance.patch(`${DEV_API_URL}/api/vendor/products/request-reapproval-bulk`, { productIds })
    return response.data
  },

  createProduct: async (formData) => {
    const res = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/vendor/products/add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },
  updateProduct: async (id, formData) => {
    const res = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/vendor/products/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },
  getProductDetail: async (id) => {
    const res = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/vendor/products/detail/${id}`)
    return res.data
  },
  createVariant: async (productId, variantData) => {
    const res = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/vendor/products/add/${productId}/variants`, variantData)
    return res.data
  }
}