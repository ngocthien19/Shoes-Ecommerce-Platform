import express from 'express'
import { userController } from '~/controllers/user/userController'
import { userMiddleware } from '~/middlewares/userMiddleware'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/profile', userController.getUserProfile)

router.put('/update-profile',
  userMiddleware.uploadAvatar,
  userMiddleware.validateUpdateProfile,
  userController.updateProfile
)

export const userRouter = router