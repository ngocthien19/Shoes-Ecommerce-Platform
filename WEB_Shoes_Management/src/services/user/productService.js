import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const productService = {
  getHomepageProducts: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/homepage-products`)
    return response.data
  },

  getProductDetail: async (slug) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/detail/${slug}`)
    return response.data
  },

  searchAndFilterProducts: async (params) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/search-filter`, { params })
    return response.data
  },


  toggleFavorite: async (productId) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/products/toggle`, { productId })
    return response.data
  },

  getFavorites: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products`)
    return response.data
  }
}