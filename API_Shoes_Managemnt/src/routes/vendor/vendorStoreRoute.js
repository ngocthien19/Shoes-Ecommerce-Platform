import express from 'express'
import { vendorStoreController } from '~/controllers/vendor/vendorStoreController'
import { authGuard } from '~/middlewares/authGuard'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const router = express.Router()

router.use(authGuard.isAuthorized)

// Gọi chính xác hàm uploadStoreFiles xử lý đa file logo và banner
router.post('/register', CloudinaryProvider.uploadStoreFiles, vendorStoreController.registerStore)

router.get('/profile', vendorStoreController.getStoreProfile)

// API Cập nhật profile shop
router.put('/profile', CloudinaryProvider.uploadStoreFiles, vendorStoreController.updateStoreProfile)

export const vendorStoreRouter = router