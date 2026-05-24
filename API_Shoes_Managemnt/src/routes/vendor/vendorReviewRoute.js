import express from 'express'
import { vendorReviewController } from '~/controllers/vendor/vendorReviewController.js'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', vendorReviewController.getVendorReviews)

router.get('/:id', vendorReviewController.getReviewDetail)

router.put('/:id/report', vendorReviewController.reportReview)

router.patch('/report-bulk', vendorReviewController.reportReviewsBulk)

router.patch('/request-reopen-bulk', vendorReviewController.requestReviewsReopenBulk)

export const vendorReviewRouter = router