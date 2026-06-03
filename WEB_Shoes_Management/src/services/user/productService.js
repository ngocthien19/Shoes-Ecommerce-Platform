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
  }
}