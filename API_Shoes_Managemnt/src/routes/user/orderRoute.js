import express from 'express'
import { orderController } from '~/controllers/user/orderController'
import { orderTrackingController } from '~/controllers/user/orderTrackingController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/checkout-cod', orderController.createOrderCOD)

router.get('/history', orderTrackingController.getOrderHistory)

router.put('/cancel/:orderId', orderTrackingController.cancelOrderByUser)

export const orderRouter = router