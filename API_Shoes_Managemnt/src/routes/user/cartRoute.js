import express from 'express'
import { cartController } from '~/controllers/user/cartController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// Áp dụng middleware bảo mật cho toàn bộ các API trong giỏ hàng
router.use(authGuard.isAuthorized)

router.post('/add', cartController.addToCart)
router.get('/', cartController.getCart)
router.put('/update', cartController.updateQuantity)
router.delete('/remove/:variantId', cartController.removeFromCart)

export const cartRouter = router