import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'

import { chatApiService } from '~/services/chat/chatApiService'
import { DEV_API_URL } from '~/utils/constant'
import { formatLastActive, formatRelativeTime } from '~/utils/formatters'
import { VendorConversationList } from './VendorConversationList'
import { VendorChatArea } from './VendorChatArea'

let socket = null

export const VendorChatPage = () => {
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  const currentUser = useSelector((state) => state.user.userInfo)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)

  const messagesEndRef = useRef(null)
  const activeChatRef = useRef(activeChat)

  // Cập nhật ref khi activeChat thay đổi
  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('accessToken')
    socket = io(DEV_API_URL, {
      auth: { token }
    })

    socket.on('new_chat_message', (newMessage) => {
      // Dùng ref để lấy activeChat mới nhất mà không cần dependency
      if (activeChatRef.current && activeChatRef.current.conversation_id === newMessage.conversationId) {
        setMessages(prev => [...prev, newMessage])
      }
      fetchConversations()
    })

    socket.on('user_online_status', ({ userId, isOnline, lastActive }) => {
      updateConversationOnlineStatus(userId, isOnline, lastActive)
      if (activeChatRef.current && activeChatRef.current.client_id === userId) {
        setActiveChat(prev => prev ? { ...prev, client_online: isOnline, client_last_active: lastActive } : prev)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated])

  const updateConversationOnlineStatus = (userId, isOnline, lastActive) => {
    setConversations(prev => prev.map(conv => {
      if (conv.client_id === userId) {
        return { ...conv, client_online: isOnline, client_last_active: lastActive }
      }
      return conv
    }))
  }

  // Lấy danh sách hội thoại
  const fetchConversations = async () => {
    try {
      const data = await chatApiService.getConversationsList()
      setConversations(data)
    } catch (err) {
      console.error('Lỗi tải danh sách:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingList(true)
      fetchConversations().finally(() => setLoadingList(false))
    }
  }, [isAuthenticated])

  // Lấy lịch sử tin nhắn khi chọn phòng chat
  useEffect(() => {
    if (activeChat) {
      setLoadingChat(true)
      chatApiService.getChatHistory(activeChat.conversation_id)
        .then(data => {
          setMessages(data)
        })
        .catch(() => toast.error('Không thể tải tin nhắn'))
        .finally(() => setLoadingChat(false))
    }
  }, [activeChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  // Đánh dấu đã đọc khi chọn phòng chat
  useEffect(() => {
    if (activeChat && activeChat.unread_count > 0) {
      const markAsRead = async () => {
        try {
          await chatApiService.markAsRead(activeChat.conversation_id)
          setConversations(prev => prev.map(c =>
            c.conversation_id === activeChat.conversation_id ? { ...c, unread_count: 0 } : c
          ))
        } catch (error) {
          console.error('Lỗi khi đánh dấu đã đọc', error)
        }
      }
      markAsRead()
    }
  }, [activeChat])

  const handleSelectConversation = (conv) => {
    setActiveChat(conv)
  }

  const handleSendMessage = async (messageText, selectedImage) => {
    const formData = new FormData()
    formData.append('storeId', activeChat.store_id)
    formData.append('content', messageText.trim())
    if (selectedImage) {
      formData.append('chatImages', selectedImage)
    }

    try {
      const result = await chatApiService.sendMessage(formData)
      setMessages(prev => [...prev, result])
      fetchConversations()
      scrollToBottom()
      return true
    } catch (error) {
      toast.error('Gửi tin nhắn thất bại')
      console.error(error)
      return false
    }
  }

  const getOnlineStatus = (conv) => {
    const isOnline = conv.client_online
    const lastActive = conv.client_last_active

    if (isOnline) {
      return { text: 'Đang hoạt động', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  if (!isAuthenticated) return null

  return (
    <div className="h-[calc(100vh-120px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col"
      >
        <div className="flex-1 flex overflow-hidden w-full h-full">
          <VendorConversationList
            activeChat={activeChat}
            conversations={conversations}
            loadingList={loadingList}
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            getOnlineStatus={getOnlineStatus}
          />

          <VendorChatArea
            activeChat={activeChat}
            messages={messages}
            loadingChat={loadingChat}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveChat(null)}
            onClose={() => setActiveChat(null)}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </motion.div>
    </div>
  )
}