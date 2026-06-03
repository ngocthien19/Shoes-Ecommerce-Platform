import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const storeService = {
  getStoreDetail: async (storeId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/stores/detail/${storeId}`)
    return response.data
  }
}