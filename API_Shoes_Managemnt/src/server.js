import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { env } from '~/config/environment'
import { connectDB } from '~/config/db'

// import UserRoutes
import { authRouter } from '~/routes/auth/authRoute'
import { userRouter } from '~/routes/user/userRoute'
import { categoryRouter } from '~/routes/user/categoryRoute'
import { productRouter } from '~/routes/user/productRoute'
import { cartRouter } from '~/routes/user/cartRoute'
import { orderRouter } from '~/routes/user/orderRoute'
import { promotionRouter } from '~/routes/user/promotionRoute'

// import VendorRoutes
import { vendorStoreRouter } from '~/routes/vendor/vendorStoreRoute'
import { vendorProductRouter } from '~/routes/vendor/vendorProductRoute'
import { vendorOrderRouter } from '~/routes/vendor/vendorOrderRoute'
import { vendorPromotionRouter } from '~/routes/vendor/vendorPromotionRoute'
import { vendorReviewRouter } from '~/routes/vendor/vendorReviewRoute'
import { vendorFavoriteRouter } from '~/routes/vendor/vendorFavoriteRoute'
import { vendorAnalyticsRouter } from './routes/vendor/vendorAnalyticsRoute'

// import ManagerRoutes
import { managerStoreRouter } from '~/routes/manager/managerStoreRoute'

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

  // Định tuyến hệ thống API cho USER
  app.use('/api/auth', authRouter)
  app.use('/api/users', userRouter)
  app.use('/api/categories', categoryRouter)
  app.use('/api/products', productRouter)
  app.use('/api/carts', cartRouter)
  app.use('/api/orders', orderRouter)
  app.use('/api/promotions', promotionRouter)

  // Định tuyến hệ thống API cho VENDOR (Cửa hàng)
  app.use('/api/vendor/stores', vendorStoreRouter)
  app.use('/api/vendor/products', vendorProductRouter)
  app.use('/api/vendor/orders', vendorOrderRouter)
  app.use('/api/vendor/promotions', vendorPromotionRouter)
  app.use('/api/vendor/reviews', vendorReviewRouter)
  app.use('/api/vendor/favorites', vendorFavoriteRouter)
  app.use('/api/vendor/analytics', vendorAnalyticsRouter)

  // Định tuyến hệ thống API cho MANAGER (Quản lý)
  app.use('/api/manager/stores', managerStoreRouter)

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