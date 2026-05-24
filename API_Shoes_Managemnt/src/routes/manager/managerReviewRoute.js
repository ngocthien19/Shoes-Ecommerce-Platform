import express from 'express'
import { managerReviewController } from '~/controllers/manager/managerReviewController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', managerReviewController.getReportedReviews)

router.get('/:id', managerReviewController.getReviewDetail)

router.patch('/resolve-bulk', managerReviewController.resolveReviewsBulk)

export const managerReviewRouter = router