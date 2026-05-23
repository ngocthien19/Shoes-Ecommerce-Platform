import { managerProductModel } from '~/models/manager/product/managerProductModel'
import { PRODUCT_MODERATION_STATUS } from '~/utils/constants'
import { EmailProvider } from '~/providers/EmailProvider'

// 1. Lấy danh sách sản phẩm toàn sàn (Có phân trang + Đa bộ lọc)
const getProductsList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    categoryId: filters.categoryId || null,
    storeId: filters.storeId || null,
    status: filters.status || null,
    sortBy: filters.sortBy || 'created_at',
    sortOrder: filters.sortOrder || 'DESC',
    limit,
    offset
  }

  const [products, totalItems, overviewStats] = await Promise.all([
    managerProductModel.getProductsForManager(filterParams),
    managerProductModel.countProductsForManager(filterParams),
    managerProductModel.getProductsOverviewStats()
  ])

  return {
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    products
  }
}

// 2. Ép Ẩn / Khóa hoặc Mở khóa sản phẩm vi phạm quy định sàn
const toggleProductActive = async (productId, currentStatus, reason) => {
  const nextStatus = currentStatus === PRODUCT_MODERATION_STATUS.APPROVED
    ? PRODUCT_MODERATION_STATUS.BANNED
    : PRODUCT_MODERATION_STATUS.APPROVED

  const affectedRows = await managerProductModel.updateProductModerationStatus(productId, nextStatus)
  if (affectedRows === 0) throw new Error('Không tìm thấy sản phẩm hoặc cập nhật thất bại.')

  if (nextStatus === PRODUCT_MODERATION_STATUS.BANNED) {
    const info = await managerProductModel.getProductAndOwnerInfo(productId)

    if (info) {
      const finalReason = reason?.trim() ? reason : 'Hình ảnh sản phẩm không đúng chuẩn mực, hoặc nội dung mô tả chứa từ khóa vi phạm tiêu chuẩn cộng đồng.'

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; background-color: #d9534f; padding: 12px 0; border-radius: 4px 4px 0 0;">
            <h3 style="color: #ffffff; margin: 0;">Shoes Store - Cảnh Báo Bản Tin Sản Phẩm Vi Phạm</h3>
          </div>
          <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
            <p>Xin chào chủ gian hàng <strong>${info.store_name}</strong> (${info.fullname}),</p>
            <p>Qua quá trình tuần tra và rà soát chất lượng hàng hóa công khai trên sàn, Ban quản trị phát hiện sản phẩm sau của bạn đã vi phạm nghiêm trọng quy chế hiển thị:</p>
            
            <p style="padding-left: 10px; border-left: 3px solid #d9534f;">
              <strong>Tên sản phẩm:</strong> <span style="color: #d9534f;">${info.product_name}</span><br/>
              <strong>Mã sản phẩm (ID):</strong> ${productId}
            </p>

            <div style="background-color: #fcf8e3; border-left: 4px solid #f0ad4e; padding: 15px; margin: 20px 0; border-radius: 4px; color: #8a6d3b;">
              <h4 style="margin: 0 0 8px 0;">Lý do xử phạt gỡ bỏ từ Điều hành viên:</h4>
              <p style="margin: 0; font-style: italic;">"${finalReason}"</p>
            </div>

            <p><strong>⚠️ Chế tài áp dụng:</strong> Sản phẩm đã bị chuyển sang trạng thái <code>BANNED</code> và ẩn hoàn toàn khỏi thanh tìm kiếm toàn sàn. Quyền tự kích hoạt lại của bạn đã bị khóa.</p>
            <p>Để mở lại sản phẩm, bạn vui lòng truy cập vào trang quản trị chỉnh sửa lại hình ảnh/nội dung theo đúng chính sách của Shoes Store và gửi yêu cầu phê duyệt lại.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #777777;">
            <p>© 2026 Shoes Store. All Rights Reserved.</p>
          </div>
        </div>
      `

      EmailProvider.sendEmail(
        info.email,
        `[Shoes Store] Thông báo khóa sản phẩm vi phạm chính sách: ${info.product_name}`,
        htmlContent
      ).catch(err => console.error('Lỗi gửi mail ban sản phẩm:', err.message))
    }
  }

  return {
    message: nextStatus === PRODUCT_MODERATION_STATUS.BANNED
      ? 'Đã khóa quyền hiển thị và hạ sản phẩm vi phạm thành công.'
      : 'Đã tháo gỡ lệnh cấm, sản phẩm được phép hiển thị bình thường.'
  }
}

// 3. Xem chi tiết sản phẩm theo Slug
const getProductDetail = async (productSlug) => {
  if (!productSlug) throw new Error('Đường dẫn sản phẩm (Slug) không hợp lệ.')

  const product = await managerProductModel.getProductDetailForManager(productSlug)
  if (!product) throw new Error('Sản phẩm không tồn tại trên hệ thống.')
  return product
}

// 4. Xử lý Checkbox cập nhật trạng thái hàng loạt (Đồng bộ Email)
const toggleProductsActiveBulk = async (productIds, targetStatus, reason) => {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new Error('Danh sách mã sản phẩm (IDs) không hợp lệ hoặc trống.')
  }

  // 1. Cập nhật mảng ID dưới DB bằng toán tử IN
  const affectedRows = await managerProductModel.updateProductsStatusBulk(productIds, targetStatus)
  if (affectedRows === 0) throw new Error('Không có sản phẩm nào được cập nhật.')

  // 2. Nếu trạng thái mục tiêu là BANNED -> Tiến hành gom nhóm gửi email
  if (targetStatus === PRODUCT_MODERATION_STATUS.BANNED) {
    const listInfo = await managerProductModel.getProductsAndOwnersInfoBulk(productIds)

    // Dùng Object để nhóm các sản phẩm có cùng email Vendor
    const groupedEmails = {}

    listInfo.forEach(info => {
      if (!groupedEmails[info.email]) {
        groupedEmails[info.email] = {
          fullname: info.fullname,
          store_name: info.store_name,
          products: []
        }
      }
      // Đẩy sản phẩm vi phạm vào mảng của shop đó
      groupedEmails[info.email].products.push({
        id: info.product_id,
        name: info.product_name
      })
    })

    //  Giờ mỗi email (mỗi shop) chỉ chạy qua đúng 1 lần duy nhất
    Object.keys(groupedEmails).forEach(email => {
      const shopData = groupedEmails[email]
      const finalReason = reason?.trim() ? reason : 'Hình ảnh sản phẩm không đúng chuẩn mực, hoặc nội dung mô tả chứa từ khóa vi phạm tiêu chuẩn cộng đồng trong đợt rà soát hàng loạt.'

      // Tự động dựng các dòng <li> danh sách sản phẩm bị khóa của shop đó
      const productListHtml = shopData.products
        .map(p => `<li><strong>ID:</strong> ${p.id} - <span style="color: #d9534f;">${p.name}</span></li>`)
        .join('')

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; background-color: #d9534f; padding: 12px 0; border-radius: 4px 4px 0 0;">
            <h3 style="color: #ffffff; margin: 0;">Shoes Store - Cảnh Báo Bản Tin Sản Phầm Vi Phạm Hàng Loạt</h3>
          </div>
          <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
            <p>Xin chào chủ gian hàng <strong>${shopData.store_name}</strong> (${shopData.fullname}),</p>
            <p>Qua quá trình tuần tra và quét chất lượng hàng hóa tự động trên hệ thống, Ban quản trị phát hiện **danh sách ${shopData.products.length} sản phẩm** sau của bạn đã vi phạm quy chế hiển thị:</p>
            
            <ul style="background-color: #f9f9f9; padding: 15px 15px 15px 30px; border-radius: 4px; border: 1px solid #eee; margin: 15px 0;">
              ${productListHtml}
            </ul>

            <div style="background-color: #fcf8e3; border-left: 4px solid #f0ad4e; padding: 15px; margin: 20px 0; border-radius: 4px; color: #8a6d3b;">
              <h4 style="margin: 0 0 8px 0;">Lý do xử phạt gỡ bỏ từ Điều hành viên:</h4>
              <p style="margin: 0; font-style: italic;">"${finalReason}"</p>
            </div>

            <p><strong>⚠️ Chế tài áp dụng:</strong> Các sản phẩm trên đã bị chuyển sang trạng thái <code>BANNED</code> và ẩn hoàn toàn khỏi thanh tìm kiếm toàn sàn. Quyền tự kích hoạt lại của bạn đã bị khóa.</p>
            <p>Để mở lại sản phẩm, bạn vui lòng truy cập vào trang quản trị chỉnh sửa lại hình ảnh/nội dung theo đúng chính sách của Shoes Store và gửi yêu cầu phê duyệt lại.</p>
          </div>
          <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #777777;">
            <p>© 2026 Shoes Store. All Rights Reserved.</p>
          </div>
        </div>
      `

      // Bắn email duy nhất cho chủ shop này
      EmailProvider.sendEmail(
        email,
        '[Shoes Store] Thông báo khóa danh sách sản phẩm vi phạm chính sách của gian hàng',
        htmlContent
      ).catch(err => console.error('Lỗi gửi mail bulk ban gom nhóm:', err.message))
    })
  }

  return {
    message: targetStatus === PRODUCT_MODERATION_STATUS.BANNED
      ? `Đã khóa quyền hiển thị hàng loạt ${affectedRows} sản phẩm thành công.`
      : `Đã phê duyệt hiển thị hàng loạt ${affectedRows} sản phẩm thành công.`
  }
}

export const managerProductService = {
  getProductsList,
  toggleProductActive,
  getProductDetail,
  toggleProductsActiveBulk
}