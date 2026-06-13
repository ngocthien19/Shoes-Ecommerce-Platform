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
  const conversationsRef = useRef(conversations)
  const socketInitialized = useRef(false)

  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return
    if (socketInitialized.current) return

    socketInitialized.current = true

    socket = io(DEV_API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socket.on('connect', () => {
      console.log('Vendor Socket connected')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      socketInitialized.current = false
    })

    socket.on('new_chat_message', (newMessage) => {
      console.log('Vendor received:', newMessage)

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
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
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
        if (conv.client_id === userId) {
          return { ...conv, client_online: isOnline, client_last_active: lastActive }
        }
        return conv
      }))

      if (activeChatRef.current && activeChatRef.current.client_id === userId) {
        setActiveChat(prev => prev ? { ...prev, client_online: isOnline, client_last_active: lastActive } : prev)
      }
    })

    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
        socketInitialized.current = false
      }
    }
  }, [isAuthenticated, currentUser])

  const fetchConversations = async () => {
    try {
      const data = await chatApiService.getConversationsList()
      setConversations(data)
    } catch (err) {
      console.error('Loi tai danh sach:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setLoadingList(true)
      fetchConversations().finally(() => setLoadingList(false))
    }
  }, [isAuthenticated, currentUser])

  useEffect(() => {
    if (activeChat) {
      setLoadingChat(true)
      chatApiService.getChatHistory(activeChat.conversation_id)
        .then(data => setMessages(data))
        .catch(() => toast.error('Khong the tai tin nhan'))
        .finally(() => setLoadingChat(false))
    }
  }, [activeChat])

  useEffect(() => {
    if (messages.length > 0 && activeChat) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, activeChat])

  useEffect(() => {
    if (activeChat && activeChat.unread_count > 0) {
      const markAsRead = async () => {
        try {
          await chatApiService.markAsRead(activeChat.conversation_id)
          setConversations(prev => prev.map(c =>
            c.conversation_id === activeChat.conversation_id ? { ...c, unread_count: 0 } : c
          ))
        } catch (error) {
          console.error('Loi khi danh dau da doc', error)
        }
      }
      markAsRead()
    }
  }, [activeChat])

  const handleSelectConversation = (conv) => {
    setActiveChat(conv)
  }

  const handleSendMessage = async (messageText, selectedImage) => {
    if (!activeChat || !currentUser) return false

    const formData = new FormData()
    formData.append('userId', activeChat.client_id)
    formData.append('content', messageText.trim())
    if (selectedImage) {
      formData.append('chatImages', selectedImage)
    }

    const tempMessage = {
      id: Date.now(),
      conversationId: activeChat.conversation_id,
      senderId: currentUser.id,
      content: messageText.trim(),
      images: selectedImage ? [{ secure_url: URL.createObjectURL(selectedImage) }] : [],
      createdAt: new Date().toISOString(),
      isTemp: true
    }
    setMessages(prev => [...prev, tempMessage])

    setConversations(prev => {
      const updatedConv = prev.find(c => c.conversation_id === activeChat.conversation_id)
      if (updatedConv) {
        const newList = prev.filter(c => c.conversation_id !== activeChat.conversation_id)
        return [{ ...updatedConv, updated_at: new Date().toISOString() }, ...newList]
      }
      return prev
    })

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)

    try {
      const result = await chatApiService.sendMessage(formData)
      setMessages(prev => prev.map(msg => msg.id === tempMessage.id ? result : msg))
      return true
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      toast.error('Gui tin nhan that bai')
      console.error(error)
      return false
    }
  }

  const getOnlineStatus = (conv) => {
    const isOnline = conv.client_online
    const lastActive = conv.client_last_active

    if (isOnline) {
      return { text: 'Dang hoat dong', isOnline: true, lastActiveText: null }
    }
    return { text: formatLastActive(lastActive), isOnline: false, lastActiveText: formatRelativeTime(lastActive) }
  }

  if (!isAuthenticated || !currentUser) return null

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