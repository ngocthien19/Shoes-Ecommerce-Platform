import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import { chatApiService } from '~/services/chat/chatApiService'
import { DEV_API_URL } from '~/utils/constant'
import { formatLastActive, formatRelativeTime } from '~/utils/formatters'
import { ChatButton } from './ChatButton'
import { ChatModal } from './ChatModal'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

let socket = null

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const currentUser = useSelector((state) => state.user.userInfo)

  // Khởi tạo Socket.io khi Modal mở ra
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      const token = localStorage.getItem('accessToken')
      socket = io(DEV_API_URL, {
        auth: { token }
      })

      socket.on('new_chat_message', (newMessage) => {
        if (activeChat && activeChat.conversation_id === newMessage.conversationId) {
          setMessages(prev => [...prev, newMessage])
        }
        fetchConversations()
      })

      socket.on('user_online_status', ({ userId, isOnline, lastActive }) => {
        updateConversationOnlineStatus(userId, isOnline, lastActive)
        updateActiveChatOnlineStatus(userId, isOnline, lastActive)
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [isOpen, isAuthenticated, activeChat])

  const updateConversationOnlineStatus = (userId, isOnline, lastActive) => {
    setConversations(prev => prev.map(conv => {
      const isUserClient = currentUser.id === conv.client_id
      if (isUserClient && conv.store_owner_id === userId) {
        return { ...conv, store_online: isOnline, store_last_active: lastActive }
      }
      if (!isUserClient && conv.client_id === userId) {
        return { ...conv, client_online: isOnline, client_last_active: lastActive }
      }
      return conv
    }))
  }

  const updateActiveChatOnlineStatus = (userId, isOnline, lastActive) => {
    if (!activeChat) return

    const isUserClient = currentUser.id === activeChat.client_id
    if (isUserClient && activeChat.store_owner_id === userId) {
      setActiveChat(prev => ({ ...prev, store_online: isOnline, store_last_active: lastActive }))
    }
    if (!isUserClient && activeChat.client_id === userId) {
      setActiveChat(prev => ({ ...prev, client_online: isOnline, client_last_active: lastActive }))
    }
  }

  // Lấy danh sách Chat bên trái
  const fetchConversations = async () => {
    try {
      const data = await chatApiService.getConversationsList()
      setConversations(data)
    } catch (err) {
      console.error('Lỗi tải danh sách:', err)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setActiveChat(null)
      setMessages([])
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      setLoadingList(true)
      fetchConversations().finally(() => setLoadingList(false))
    }
  }, [isOpen, isAuthenticated])

  // Gọi khi Click chọn 1 phòng chat để lấy lịch sử
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

  const handleSelectConversation = async (conv) => {
    setActiveChat(conv)

    if (conv.unread_count > 0) {
      try {
        await chatApiService.markAsRead(conv.conversation_id)
        setConversations(prev => prev.map(c =>
          c.conversation_id === conv.conversation_id ? { ...c, unread_count: 0 } : c
        ))
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc', error)
      }
    }
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
      return true
    } catch (error) {
      toast.error('Gửi tin nhắn thất bại')
      return false
    }
  }

  const handleToggleModal = () => {
    setIsOpen(prev => !prev)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const getOnlineStatus = (conv) => {
    const isUserClient = currentUser.id === conv.client_id
    const isOnline = isUserClient ? conv.store_online : conv.client_online
    const lastActive = isUserClient ? conv.store_last_active : conv.client_last_active

    if (isOnline) {
      return { text: 'Đang hoạt động', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  if (!isAuthenticated) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <ChatModal
            activeChat={activeChat}
            conversations={conversations}
            messages={messages}
            loadingList={loadingList}
            loadingChat={loadingChat}
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            onSendMessage={handleSendMessage}
            onClose={handleCloseModal}
            onBack={() => setActiveChat(null)}
            getOnlineStatus={getOnlineStatus}
          />
        )}
      </AnimatePresence>

      <Tooltip>
        <TooltipTrigger asChild>
          <ChatButton isOpen={isOpen} onClick={handleToggleModal} />
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isOpen ? 'Đóng chat' : 'Mở chat'}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}