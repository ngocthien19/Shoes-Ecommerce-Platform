import express from 'express'
import { vendorProductController } from '~/controllers/vendor/vendorProductController'
import { vendorProductValidation } from '~/validations/vendor/vendorProductValidation'
import { authGuard } from '~/middlewares/authGuard'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const router = express.Router()

router.use(authGuard.isAuthorized)

// 1. Đăng ký sản phẩm mới kèm bốc tách ảnh qua Cloudinary
router.post('/add', CloudinaryProvider.uploadProductFields, vendorProductValidation.validateCreateProductBody, vendorProductController.createProduct)

// 2. Chỉnh sửa sản phẩm
router.put('/update/:id', CloudinaryProvider.uploadProductFields, vendorProductValidation.validateUpdateProduct, vendorProductController.updateProduct)

// 3. Xóa cứng đơn lẻ 1 đôi giày khỏi hệ thống
router.delete('/delete/:id', vendorProductValidation.validateProductIdParam, vendorProductController.deleteProduct)

// 4. Thêm biến thể kho (size, màu, số lượng)
router.post('/add/:id/variants', vendorProductValidation.validateCreateVariantBody, vendorProductController.createVariant)

// 5. Tải danh sách sản phẩm có bộ lọc và phân trang
router.get('/', vendorProductValidation.validateGetProductsFilters, vendorProductController.getVendorProducts)

// 6. Xem chi tiết 1 sản phẩm phục vụ edit
router.get('/detail/:id', vendorProductValidation.validateProductIdParam, vendorProductController.getProductDetail)

// 7. Bật/Tắt ẩn hiện 1 sản phẩm đơn lẻ
router.patch('/:id/toggle-active', vendorProductValidation.validateToggleActiveSingleBody, vendorProductController.toggleProductActiveSingle)

// 8. Tạm ẩn/Hiện hàng loạt sản phẩm từ Checkbox
router.patch('/toggle-active-bulk', vendorProductValidation.validateToggleActiveBulkBody, vendorProductController.toggleProductsActiveBulk)

// 9. Xóa cứng hàng loạt sản phẩm từ Checkbox
router.delete('/delete-bulk', vendorProductValidation.validateProductIdsBulkBody, vendorProductController.deleteProductsBulk)

// 10. Gửi yêu cầu gỡ phạt duyệt lại cho loạt giày bị Banned
router.patch('/request-reapproval-bulk', vendorProductValidation.validateProductIdsBulkBody, vendorProductController.requestProductsReapprovalBulk)

export const vendorProductRouter = router