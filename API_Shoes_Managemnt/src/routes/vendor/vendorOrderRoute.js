import express from 'express'
import { vendorOrderController } from '~/controllers/vendor/vendorOrderController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

router.use(authGuard.isAuthorized)

router.get('/', vendorOrderController.getVendorOrders)

router.put('/:id/update-status', vendorOrderController.updateOrderStatus)

router.put('/:id/handle-cancel', vendorOrderController.handleCancelRequest)

router.patch('/update-status-bulk', vendorOrderController.updateOrderStatusBulk)

export const vendorOrderRouter = router