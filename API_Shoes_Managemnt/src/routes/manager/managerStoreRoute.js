import express from 'express'
import { managerStoreController } from '~/controllers/manager/managerStoreController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. Lấy danh sách gian hàng có phân trang,
router.get('/', managerStoreController.getStoresList)

// 2. Duyệt hàng loạt các shop được tích chọn checkbox
router.patch('/approve-bulk', managerStoreController.approveStoresBulk)
router.patch('/reject-bulk', managerStoreController.rejectStoresBulk)

// 3. Khóa hàng loạt các shop vi phạm
router.patch('/ban-bulk', managerStoreController.banStoresBulk)

router.get('/:id', managerStoreController.getStoreDetail)

router.put('/:id/approve', managerStoreController.approveStoreSingle)

router.delete('/:id/reject', managerStoreController.rejectStoreSingle)

router.put('/:id/ban', managerStoreController.banStoreSingle)

export const managerStoreRouter = router