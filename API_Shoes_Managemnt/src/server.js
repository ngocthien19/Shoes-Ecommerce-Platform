import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { env } from '~/config/environment'
import { connectDB } from '~/config/db'
import { authRouter } from '~/routes/auth/authRoute'
import { userRouter } from '~/routes/user/userRoute'
import { corsOptions } from '~/config/corsOptions'
import cookieParser from 'cookie-parser'

dotenv.config()

const START_SERVER = () => {
  const app = express()
  // Cấu hình middleware để đọc cookie từ request
  app.use(cookieParser())

  // Cấu hình CORS để cho phép Frontend (Vite) kết nối bảo mật sang Backend
  app.use(cors(corsOptions))

  // Cho phép Express đọc dữ liệu dạng JSON gửi lên từ req.body
  app.use(express.json())

  //Giúp giải mã dữ liệu text từ form-data (Postman/Frontend gửi lên)
  app.use(express.urlencoded({ extended: true }))

  // Định tuyến hệ thống API
  app.use('/api/auth', authRouter)

  app.use('/api/users', userRouter)

  // Khởi động Server Node.js lắng nghe trên Port từ file môi trường
  const port = env.APP_PORT || 8000
  app.listen(port, () => {
    console.log(`Backend Shoes Store đang chạy tại http://localhost:${port} 🚀`)
  })
}

// 6. Thực thi luồng: Kết nối Database thành công rồi mới chính thức khởi động Server
(async () => {
  try {
    // console.log('Đang kết nối tới Cơ sở dữ liệu...')
    await connectDB()
    START_SERVER()
  } catch (error) {
    console.error('Khởi động Server thất bại:', error.message)
    process.exit(1)
  }
})()