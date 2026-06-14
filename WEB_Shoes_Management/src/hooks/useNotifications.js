import { useState, useEffect, useCallback } from 'react'
import { notificationApiService } from '~/services/notification/notificationApiService'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      const res = await notificationApiService.getNotifications(pageNum, 20)

      if (append) {
        setNotifications(prev => [...prev, ...res])
      } else {
        setNotifications(res)
        if (res.length > 0) {
          setSelectedNotification(prev => prev || res[0])
        }
      }

      setHasMore(res.length === 20)
    } catch (error) {
      console.error('Lỗi tải thông báo:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchNotifications(nextPage, true)
    }
  }, [hasMore, loadingMore, page, fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApiService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setSelectedNotification(prev => prev ? { ...prev, is_read: true } : null)
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationApiService.markAsRead(notificationId)
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setSelectedNotification(prev =>
        prev?.id === notificationId ? { ...prev, is_read: true } : prev
      )
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error)
    }
  }, [])

  const selectNotification = useCallback((notification) => {
    setSelectedNotification(notification)
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
  }, [markAsRead])

  useEffect(() => {
    fetchNotifications(1, false)
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.is_read).length

  return {
    notifications,
    loading,
    selectedNotification,
    hasMore,
    loadingMore,
    unreadCount,
    loadMore,
    markAllAsRead,
    markAsRead,
    selectNotification
  }
}