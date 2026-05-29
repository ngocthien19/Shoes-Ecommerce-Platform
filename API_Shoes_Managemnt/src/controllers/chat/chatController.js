import { chatService } from '~/services/chat/chatService'

const sendMessage = async (req, res) => {
  try {
    const senderId = req.jwtDecoded?.id
    const { storeId, content } = req.body
    const result = await chatService.sendMessage(senderId, Number(storeId), content, req.files)
    return res.status(201).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi xử lý gửi tin nhắn: ${error.message}` })
  }
}

const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params
    const result = await chatService.getChatHistory(Number(conversationId), req.query)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải lịch sử chat: ${error.message}` })
  }
}

const getConversationsList = async (req, res) => {
  try {
    const userId = req.jwtDecoded?.id
    const result = await chatService.getConversationsList(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(500).json({ message: `Lỗi tải danh mục phòng chat: ${error.message}` })
  }
}

export const chatController = { sendMessage, getChatHistory, getConversationsList }