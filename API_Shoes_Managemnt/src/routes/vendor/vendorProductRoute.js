import express from 'express'
import { vendorProductController } from '~/controllers/vendor/vendorProductController'
import { authGuard } from '~/middlewares/authGuard'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.post('/add', CloudinaryProvider.uploadProductFields, vendorProductController.createProduct)

router.put('/update/:id', CloudinaryProvider.uploadProductFields, vendorProductController.updateProduct)

router.delete('/delete/:id', vendorProductController.deleteProduct)

router.post('/add/:id/variants', vendorProductController.createVariant)

router.get('/', vendorProductController.getVendorProducts)

router.get('/detail/:id', vendorProductController.getProductDetail)

router.patch('/:id/toggle-active', vendorProductController.toggleProductActiveSingle)

router.patch('/toggle-active-bulk', vendorProductController.toggleProductsActiveBulk)

router.delete('/delete-bulk', vendorProductController.deleteProductsBulk)

router.patch('/request-reapproval-bulk', vendorProductController.requestProductsReapprovalBulk)

export const vendorProductRouter = router