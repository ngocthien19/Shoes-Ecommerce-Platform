import express from 'express'
import { adminStoreController } from '~/controllers/admin/adminStoreController'
import { adminStoreValidation } from '~/validations/admin/adminStoreValidation'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', adminStoreController.getStoresList)

router.get('/:id', adminStoreController.getStoreDetail)

router.patch('/toggle-active-bulk', adminStoreValidation.checkStoreIdsMandatory, adminStoreController.toggleStoreActiveBulk)

router.patch('/commission-bulk', adminStoreValidation.updateCommissionBulk, adminStoreController.updateStoreCommissionBulk)

router.post('/enforce-balance', adminStoreValidation.enforceBalance, adminStoreController.enforceStoreBalance)

router.post(
  '/add',
  CloudinaryProvider.uploadStoreFiles,
  adminStoreValidation.createStore,
  adminStoreController.createStore
)

router.delete(
  '/delete-bulk',
  adminStoreValidation.checkStoreIdsBulk,
  adminStoreController.deleteStoresBulk
)
export const adminStoreRouter = router