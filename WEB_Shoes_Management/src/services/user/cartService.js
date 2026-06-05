import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const cartApiService = {
  addToCart: async (variantId, quantity) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/carts/add`, {
      variantId,
      quantity
    })
    return response.data
  },

  getCart: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/carts`)
    return response.data
  }
}