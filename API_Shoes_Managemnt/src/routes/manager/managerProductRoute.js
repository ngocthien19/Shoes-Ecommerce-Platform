import express from 'express'
import { managerProductController } from '~/controllers/manager/managerProductController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// Ép toàn bộ các route kiểm duyệt sản phẩm phải đi qua tầng check token đăng nhập của Manager
router.use(authGuard.isAuthorized)

// 1. Xem danh sách sản phẩm toàn sàn phục vụ trang kiểm duyệt
router.get('/', managerProductController.getProductsList)

// 2. Khóa/Bật trạng thái sản phẩm vi phạm
router.put('/:id/toggle-active', managerProductController.toggleProductActive)

router.patch('/toggle-active-bulk', managerProductController.toggleProductsActiveBulk)

router.get('/:slug', managerProductController.getProductDetail)

export const managerProductRouter = router