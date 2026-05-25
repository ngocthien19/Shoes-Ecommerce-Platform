import express from 'express'
import { adminAppealController } from '~/controllers/admin/adminAppealController'
import { adminAppealValidation } from '~/validations/admin/adminAppealValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. Vendor đăng nhập gửi đơn khiếu nại (Tự bốc ID từ Token)
router.post(
  '/submit',
  CloudinaryProvider.uploadAppealFields,
  adminAppealValidation.createAppeal,
  adminAppealController.submitStoreAppeal
)

router.get('/', adminAppealController.getAppealsList)

router.patch('/process/:id', adminAppealValidation.handleAppeal, adminAppealController.processStoreAppeal)

export const adminAppealRouter = router