import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import { chatApiService } from '~/services/chat/chatApiService'
import { DEV_API_URL } from '~/utils/constant'
import { formatLastActive, formatRelativeTime } from '~/utils/formatters'
import { ChatButton } from './ChatButton'
import { ChatModal } from './ChatModal'
import { useChat } from '~/contexts/ChatContext'
import { ROLE_ID } from '~/utils/constant'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '~/components/ui/tooltip'

let socket = null

export const ChatWidget = () => {
  const { isOpen: contextIsOpen, targetStore, closeChat, clearTargetStore } = useChat()
  const [localIsOpen, setLocalIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)

  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const currentUser = useSelector((state) => state.user.userInfo)

  const activeChatRef = useRef(activeChat)
  const conversationsRef = useRef(conversations)

  // Sync refs
  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  const isOpen = contextIsOpen || localIsOpen

  useEffect(() => {
    if (targetStore && isAuthenticated && conversations.length > 0 && currentUser) {
      const existingConv = conversations.find(conv =>
        conv.store_id === targetStore.storeId || conv.store_owner_id === targetStore.storeId
      )
      if (existingConv) {
        setActiveChat(existingConv)
      }
      clearTargetStore()
    }
  }, [targetStore, isAuthenticated, conversations, clearTargetStore, currentUser])

  // Khởi tạo Socket.io khi Modal mở ra
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !currentUser) return

    socket = io(DEV_API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      console.log('Socket connected')
    })

    socket.on('new_chat_message', (newMessage) => {
      console.log('New message:', newMessage)

      const currentConvId = activeChatRef.current?.conversation_id
      const isCurrentConversation = currentConvId === newMessage.conversationId

      if (isCurrentConversation) {
        setMessages(prev => [...prev, newMessage])
        chatApiService.markAsRead(newMessage.conversationId).catch(console.error)
        setConversations(prev => prev.map(conv =>
          conv.conversation_id === newMessage.conversationId
            ? { ...conv, unread_count: 0 }
            : conv
        ))
      } else {
        setConversations(prev => prev.map(conv => {
          if (conv.conversation_id === newMessage.conversationId) {
            return { ...conv, unread_count: (conv.unread_count || 0) + 1 }
          }
          return conv
        }))
      }

      setConversations(prev => {
        const updatedConv = prev.find(c => c.conversation_id === newMessage.conversationId)
        if (updatedConv) {
          const newList = prev.filter(c => c.conversation_id !== newMessage.conversationId)
          return [{ ...updatedConv, updated_at: new Date().toISOString() }, ...newList]
        }
        return prev
      })
    })

    socket.on('user_online_status', ({ userId, isOnline, lastActive }) => {
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

      if (activeChatRef.current) {
        const isUserClient = currentUser.id === activeChatRef.current.client_id
        if (isUserClient && activeChatRef.current.store_owner_id === userId) {
          setActiveChat(prev => ({ ...prev, store_online: isOnline, store_last_active: lastActive }))
        }
        if (!isUserClient && activeChatRef.current.client_id === userId) {
          setActiveChat(prev => ({ ...prev, client_online: isOnline, client_last_active: lastActive }))
        }
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [isOpen, isAuthenticated, currentUser])

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
      closeChat()
    }
  }, [isOpen, closeChat])

  useEffect(() => {
    if (isOpen && isAuthenticated && currentUser) {
      setLoadingList(true)
      fetchConversations().finally(() => setLoadingList(false))
    }
  }, [isOpen, isAuthenticated, currentUser])

  useEffect(() => {
    if (activeChat) {
      setLoadingChat(true)
      chatApiService.getChatHistory(activeChat.conversation_id)
        .then(data => setMessages(data))
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
        console.error('Lỗi đánh dấu đã đọc', error)
      }
    }
  }

  const handleSendMessage = async (messageText, selectedImage) => {
    if (!activeChat) return false

    const formData = new FormData()
    formData.append('storeId', activeChat.store_id)
    formData.append('content', messageText.trim())
    if (selectedImage) {
      formData.append('chatImages', selectedImage)
    }

    try {
      const result = await chatApiService.sendMessage(formData)
      setMessages(prev => [...prev, result])

      setConversations(prev => {
        const updatedConv = prev.find(c => c.conversation_id === activeChat.conversation_id)
        if (updatedConv) {
          const newList = prev.filter(c => c.conversation_id !== activeChat.conversation_id)
          return [{ ...updatedConv, updated_at: new Date().toISOString() }, ...newList]
        }
        return prev
      })

      return true
    } catch (error) {
      toast.error('Gửi tin nhắn thất bại')
      return false
    }
  }

  const handleToggleModal = () => {
    if (isOpen) {
      closeChat()
      setLocalIsOpen(false)
    } else {
      setLocalIsOpen(true)
    }
  }

  const handleCloseModal = () => {
    closeChat()
    setLocalIsOpen(false)
  }

  const getOnlineStatus = (conv) => {
    if (!currentUser) return { text: 'Đang tải...', isOnline: false, lastActiveText: null }

    const isUserClient = currentUser.id === conv.client_id
    const isOnline = isUserClient ? conv.store_online : conv.client_online
    const lastActive = isUserClient ? conv.store_last_active : conv.client_last_active

    if (isOnline) {
      return { text: 'Đang hoạt động', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  if (!isAuthenticated || !currentUser || currentUser?.roleId !== ROLE_ID.USER) return null

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