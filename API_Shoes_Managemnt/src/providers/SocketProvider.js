import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import { userModel } from '~/models/user/userModel'

const userSocketMap = {}
let io = null

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token
    if (!token) return next(new Error('Thao tác không hợp lệ. Token bị thiếu.'))
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
      socket.userId = decoded.id
      next()
    } catch (error) {
      return next(new Error('Xác thực Socket thất bại: Token đã hết hạn hoặc không đúng.'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.userId
    userSocketMap[userId] = socket.id

    try {
      await userModel.setOnline(userId)
      io.emit('user_online_status', { userId, isOnline: true })
    } catch (err) {
      console.error('Lỗi DB khi cập nhật online status:', err.message)
    }

    socket.on('disconnect', async () => {
      delete userSocketMap[userId]
      try {
        await userModel.setOffline(userId)
        io.emit('user_online_status', { userId, isOnline: false, lastActive: new Date() })
      } catch (err) {
        console.error('Lỗi DB khi cập nhật offline status:', err.message)
      }
    })
  })

  return io
}

const emitToUser = (userId, event, data) => {
  const socketId = userSocketMap[userId]
  if (socketId && io) {
    io.to(socketId).emit(event, data)
  }
}

export const SocketProvider = {
  initSocket,
  emitToUser,
  userSocketMap
}