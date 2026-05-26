import express from 'express'
import { orderController } from '~/controllers/user/orderController'
import { orderTrackingController } from '~/controllers/user/orderTrackingController'
import { reviewController } from '~/controllers/user/reviewController'
import { orderValidation } from '~/validations/user/orderValidation'
import { orderTrackingValidation } from '~/validations/user/orderTrackingValidation'
import { reviewValidation } from '~/validations/user/reviewValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/checkout-cod', orderValidation.createOrderCOD, orderController.createOrderCOD)
router.get('/history', orderTrackingController.getOrderHistory)

router.put('/cancel/:orderId', orderTrackingValidation.checkOrderIdParam,
  orderTrackingController.cancelOrderByUser)
router.put('/cancel-withdraw/:orderId', orderTrackingValidation.checkOrderIdParam,
  orderTrackingController.withdrawCancelRequest)

router.post('/:orderId/reviews', reviewValidation.validateProductReviewBody,
  CloudinaryProvider.uploadReviewFields, reviewController.createReview)
router.post('/:orderId/store-reviews', reviewValidation.validateStoreReviewBody,
  reviewController.createStoreReview)

export const orderRouter = router