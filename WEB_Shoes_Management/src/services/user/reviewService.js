import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const reviewService = {
  getProductReviews: async (slug) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/products/${slug}/reviews`)
    return response.data
  }
}