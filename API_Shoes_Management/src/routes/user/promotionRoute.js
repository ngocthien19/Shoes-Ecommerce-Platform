import express from 'express'
import { promotionController } from '~/controllers/user/promotionController'
import { promotionValidation } from '~/validations/user/promotionValidation'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.post('/apply', authGuard.isAuthorized, promotionValidation.validateApplyPromotion, promotionController.applyPromotion)

export const promotionRouter = router