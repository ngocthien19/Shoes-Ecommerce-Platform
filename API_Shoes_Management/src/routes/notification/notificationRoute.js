import express from 'express'
import { notificationController } from '~/controllers/notification/notificationController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', notificationController.getNotifications)
router.put('/mark-as-read', notificationController.markAllAsRead)
router.get('/unread-count', notificationController.getUnreadCount)

export const notificationRouter = router