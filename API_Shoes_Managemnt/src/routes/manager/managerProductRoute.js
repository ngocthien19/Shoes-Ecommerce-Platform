import express from 'express'
import { managerProductController } from '~/controllers/manager/managerProductController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. Xem danh sách sản phẩm toàn sàn phục vụ trang kiểm duyệt
router.get('/', managerProductController.getProductsList)

router.put('/:id/status', managerProductController.toggleProductActive)

router.patch('/status-bulk', managerProductController.toggleProductsActiveBulk)

router.get('/:slug', managerProductController.getProductDetail)

export const managerProductRouter = router