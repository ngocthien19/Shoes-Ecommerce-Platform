import express from 'express'
import { vendorFavoriteController } from '~/controllers/vendor/vendorFavoriteController.js'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', vendorFavoriteController.getFavoriteAnalytics)

export const vendorFavoriteRouter = router