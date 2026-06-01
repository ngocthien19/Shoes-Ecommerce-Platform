import { notificationModel } from '~/models/notification/notificationModel'
import { SocketProvider } from '~/providers/SocketProvider'

const createAndPushNotification = async ({ userId, title, content, type, referenceId }) => {
  const notificationId = await notificationModel.createNotification({
    userId, title, content, type, referenceId
  })

  const notificationData = {
    id: notificationId,
    title,
    content,
    type,
    referenceId,
    isRead: false,
    createdAt: new Date()
  }

  SocketProvider.emitToUser(userId, 'new_notification', notificationData)
  return notificationData
}

const getNotifications = async (userId, queryParams) => {
  const page = Number(queryParams.page) || 1
  const limit = Number(queryParams.limit) || 10
  const offset = (page - 1) * limit
  return await notificationModel.getNotificationsByUserId(userId, limit, offset)
}

const markAllAsRead = async (userId) => {
  const affectedRows = await notificationModel.markAllAsRead(userId)
  return { message: 'Đã đánh dấu xem toàn bộ thông báo hệ thống thành công.', affectedRows }
}

export const notificationService = {
  createAndPushNotification,
  getNotifications,
  markAllAsRead
}