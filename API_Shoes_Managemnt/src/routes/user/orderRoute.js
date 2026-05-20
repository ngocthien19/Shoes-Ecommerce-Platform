import express from 'express'
import { orderController } from '~/controllers/user/orderController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/checkout-cod', orderController.createOrderCOD)

export const orderRouter = router