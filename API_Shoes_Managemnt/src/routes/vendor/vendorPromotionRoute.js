import express from 'express'
import { vendorPromotionController } from '~/controllers/vendor/vendorPromotionController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', vendorPromotionController.getVendorPromotions)

router.get('/detail/:id', vendorPromotionController.getPromotionById)

router.post('/add', vendorPromotionController.createPromotion)

router.put('/update/:id', vendorPromotionController.updatePromotion)

router.delete('/delete/:id', vendorPromotionController.deletePromotion)

export const vendorPromotionRouter = router