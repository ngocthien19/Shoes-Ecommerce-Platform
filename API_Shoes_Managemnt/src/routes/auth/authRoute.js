import express from 'express'
import { authController } from '~/controllers/auth/authController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.post('/register',
  authMiddleware.registerLimiter,
  authMiddleware.validateRegister,
  authController.register
)

router.post('/verify-otp',
  authMiddleware.validateVerifyOtp,
  authController.verifyOtp
)

router.post('/login',
  authMiddleware.loginLimiter,
  authMiddleware.validateLogin,
  authController.login
)

export const authRouter = router