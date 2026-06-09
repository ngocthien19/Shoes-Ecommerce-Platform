import { chatModel } from '~/models/chat/chatModel'
import { SocketProvider } from '~/providers/SocketProvider'

const sendMessage = async (senderId, storeId, content, imageFiles) => {
  const conversationId = await chatModel.getOrCreateConversation(senderId, storeId)

  let images = []
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      images.push({ public_id: file.filename, secure_url: file.path })
    })
  }

  const messageId = await chatModel.saveMessage(conversationId, senderId, content, images)

  // Logic truy vấn DB nay đã được chuyển gọn gàng xuống Model
  const info = await chatModel.getConversationInfoById(conversationId)
  const storeOwnerId = await chatModel.getStoreOwnerId(info.store_id)

  // Xác định người nhận tin nhắn (Sender là khách thì Receiver là Shop, và ngược lại)
  const receiverId = senderId === info.user_id ? storeOwnerId : info.user_id

  const messageData = {
    id: messageId,
    conversationId,
    senderId,
    content,
    images,
    createdAt: new Date()
  }

  // Bắn Socket Real-time
  SocketProvider.emitToUser(receiverId, 'new_chat_message', messageData)

  return messageData
}

const getChatHistory = async (conversationId, queryParams) => {
  const page = Number(queryParams.page) || 1
  const limit = Number(queryParams.limit) || 20
  const offset = (page - 1) * limit
  return await chatModel.getMessagesByConversation(conversationId, limit, offset)
}

const getConversationsList = async (userId) => {
  return await chatModel.getConversationsList(userId)
}

const markAsRead = async (conversationId, userId) => {
  await chatModel.markMessagesAsRead(conversationId, userId)
  return { success: true }
}

export const chatService = {
  sendMessage,
  getChatHistory,
  getConversationsList,
  markAsRead
}