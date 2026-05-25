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
  limits: { fileSize: 5 * 1024 * 1024 }
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
  limits: { fileSize: 5 * 1024 * 1024 }
})

// 4. Cấu hình lưu trữ hình ảnh Feedback Đánh giá từ Khách hàng
const reviewStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoes_store_reviews',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
})
const uploadReview = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
})

// 5. Cấu hình lưu trữ hình ảnh bằng chứng khiếu nại từ Khách hàng
const appealStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoes_store_appeals',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
})
const uploadAppeal = multer({
  storage: appealStorage,
  limits: { fileSize: 3 * 1024 * 1024 } // Giới hạn 3MB mỗi ảnh bằng chứng
})

// 6. Cấu hình lưu trữ hình ảnh danh mục sản phẩm (Nếu có)
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shoes_categories',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }]
  }
})
const uploadCategory = multer({
  storage: categoryStorage,
  limits: { fileSize: 3 * 1024 * 1024 }
})

export const CloudinaryProvider = {
  cloudinary,
  streamUpload: uploadAvatar.single('avatar'),
  uploadStoreFiles: uploadStore.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
  ]),
  uploadProductFields: uploadProduct.array('images', 10),
  uploadReviewFields: uploadReview.array('reviewImages', 10),
  uploadAppealFields: uploadAppeal.array('evidenceImages', 5),
  streamUploadCategory: uploadCategory.single('categoryImage')
}