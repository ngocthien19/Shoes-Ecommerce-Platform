import express from 'express'
import { orderController } from '~/controllers/user/orderController'
import { orderTrackingController } from '~/controllers/user/orderTrackingController'
import { reviewController } from '~/controllers/user/reviewController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/checkout-cod', orderController.createOrderCOD)

router.get('/history', orderTrackingController.getOrderHistory)

router.put('/cancel/:orderId', orderTrackingController.cancelOrderByUser)

router.put('/cancel-withdraw/:orderId', orderTrackingController.withdrawCancelRequest)

router.post('/:orderId/reviews', reviewController.createReview)

router.post('/:orderId/store-reviews', reviewController.createStoreReview)

export const orderRouter = router