import express from 'express'
import { promotionController } from '~/controllers/user/promotionController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.post('/apply', authGuard.isAuthorized, promotionController.applyPromotion)

export const promotionRouter = router