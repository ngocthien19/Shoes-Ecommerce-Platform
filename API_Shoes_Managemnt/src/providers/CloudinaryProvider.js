import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { env } from '~/config/environment'
import multer from 'multer'

// Cấu hình kết nối tài khoản Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

// Ảnh Đại Diện Avatar của User
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoes_store_avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
})
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }
})

// Logo & Banner của Shop
const storeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoes_store_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
})
const uploadStore = multer({
  storage: storeStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB cho banner chất lượng cao
})

// Product Vendor
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoes_store_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
})
const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 3 * 1024 * 1024 }
})

export const CloudinaryProvider = {
  cloudinary,
  streamUpload: uploadAvatar.single('avatar'),
  uploadStoreFiles: uploadStore.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  uploadProductFields: uploadProduct.array('images', 5)
}