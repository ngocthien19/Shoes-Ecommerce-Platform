import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const chatApiService = {
  sendMessage: async (formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/chats/send`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data
  },

  getChatHistory: async (conversationId, page = 1, limit = 20) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/chats/history/${conversationId}?page=${page}&limit=${limit}`
    )
    return response.data
  },

  getConversationsList: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/chats/conversations`)
    return response.data
  }
}