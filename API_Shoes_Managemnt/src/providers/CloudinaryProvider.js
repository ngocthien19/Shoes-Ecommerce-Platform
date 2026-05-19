import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { env } from '~/config/environment'
import multer from 'multer'

// 1. Cấu hình kết nối Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// 2. Thiết lập bộ lưu trữ đám mây cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoes_store_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
})

// 3. Khởi tạo cấu hình Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // Giới hạn cứng 2MB từ Multer
})

export const CloudinaryProvider = {
  cloudinary,
  streamUpload: upload.single('avatar')
}