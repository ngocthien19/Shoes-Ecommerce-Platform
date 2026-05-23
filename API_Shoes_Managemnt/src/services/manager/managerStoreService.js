import { managerStoreModel } from '~/models/manager/store/managerStoreModel'
import { EmailProvider } from '~/providers/EmailProvider'

// A. Lấy danh sách gian hàng (Hỗ trợ phân trang, tìm kiếm búa xua, lọc khoảng ngày)
const getStoresList = async (filters) => {
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    isActive: filters.isActive !== undefined ? filters.isActive : null,
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    limit,
    offset
  }

  const [stores, totalItems] = await Promise.all([
    managerStoreModel.getStoresForManager(filterParams),
    managerStoreModel.countStoresForManager(filterParams)
  ])

  return {
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    stores
  }
}

// B. Phê duyệt hàng loạt các cửa hàng được tick chọn checkbox
const approveStoresBulk = async (storeIds) => {
  if (!Array.isArray(storeIds) || storeIds.length === 0) {
    throw new Error('Danh sách ID cửa hàng duyệt chọn không hợp lệ.')
  }

  // 1. Kích hoạt trạng thái hoạt động của các gian hàng loạt (is_active = true)
  const affectedStores = await managerStoreModel.updateStoresStatusBulk(storeIds, true)
  if (affectedStores === 0) throw new Error('Không có cửa hàng nào được cập nhật.')

  // 2. Tự động tìm danh sách chủ sở hữu (owner_id) của các shop vừa duyệt này
  const ownerIds = await managerStoreModel.getOwnerIdsByStoreIds(storeIds)

  if (ownerIds.length > 0) {
    // 3. Lấy ID của quyền 'VENDOR' trong bảng roles
    const vendorRoleId = await managerStoreModel.getRoleIdByName('VENDOR')
    if (vendorRoleId) {
      // 4. Thăng chức hàng loạt các tài khoản này từ USER lên thành VENDOR chính thức
      await managerStoreModel.updateUserRolesBulk(ownerIds, vendorRoleId)
    }
  }

  return { message: `Phê duyệt thành công ${affectedStores} gian hàng đối tác kinh doanh mới.` }
}

// D. Từ chối hàng loạt các cửa hàng đăng ký lỗi/không hợp lệ kèm lý do + GỬI EMAIL REAL-TIME
const rejectStoresBulk = async (storeIds, reason) => {
  if (!Array.isArray(storeIds) || storeIds.length === 0) {
    throw new Error('Danh sách ID cửa hàng từ chối không hợp lệ.')
  }

  const finalReason = reason?.trim() ? reason : 'Hồ sơ thông tin đăng ký gian hàng chưa đầy đủ hoặc không đạt tiêu chuẩn của sàn.'

  // 1. Lấy thông tin email, tên chủ shop, tên shop TRƯỚC KHI XÓA để phục vụ gửi mail
  const targets = await managerStoreModel.getStoresAndOwnersInfo(storeIds)

  // 2. Tự động lấy danh sách chủ shop để đảm bảo giữ nguyên/hạ quyền của họ về USER (role_id = 4)
  const ownerIds = await managerStoreModel.getOwnerIdsByStoreIds(storeIds)
  if (ownerIds.length > 0) {
    const userRoleId = await managerStoreModel.getRoleIdByName('USER')
    if (userRoleId) {
      await managerStoreModel.updateUserRolesBulk(ownerIds, userRoleId)
    }
  }

  // 3. TIẾN HÀNH XÓA SỔ GIAN HÀNG LỖI (Giải phóng hoàn toàn owner_id UNIQUE)
  const deletedStores = await managerStoreModel.deleteStoresBulk(storeIds)
  if (deletedStores === 0) throw new Error('Không có hồ sơ gian hàng nào được xử lý xóa.')

  // 4. TIẾN TRÌNH GỬI EMAIL THÔNG BÁO LÝ DO (Chạy ngầm async)
  if (targets.length > 0) {
    Promise.all(
      targets.map(async (shop) => {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #ee4d2d; padding-bottom: 10px;">
              <h2 style="color: #ee4d2d; margin: 0;">Shoes Store - Kết Quả Duyệt Hồ Sơ</h2>
            </div>
            <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
              <p>Xin chào <strong>${shop.fullname}</strong>,</p>
              <p>Ban quản trị hệ thống <strong>Shoes Store</strong> rất tiếc phải thông báo hồ sơ đăng ký gian hàng <span style="color: #ee4d2d; font-weight: bold;">${shop.store_name}</span> của bạn <strong>KHÔNG ĐƯỢC PHÊ DUYỆT</strong>.</p>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #ee4d2d; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #ee4d2d;">Lý do cụ thể từ Điều hành viên:</h4>
                <p style="margin: 0; font-style: italic;">"${finalReason}"</p>
              </div>

              <p>Hệ thống đã hủy bỏ lượt đăng ký lỗi này. Bạn hoàn toàn có thể nhấn nút <strong>"Đăng ký mở shop"</strong> trên giao diện để tiến hành nộp lại một bộ hồ sơ mới chuẩn xác hơn.</p>
            </div>
            <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #777777;">
              <p>© 2026 Shoes Store. All Rights Reserved.</p>
            </div>
          </div>
        `
        return EmailProvider.sendEmail(
          shop.email,
          `[Shoes Store] Kết quả phê duyệt gian hàng đối tác: ${shop.store_name}`,
          htmlContent
        )
      })
    ).catch(err => {
      console.error('Lỗi gửi mail thông báo từ chối:', err.message)
    })
  }

  return {
    message: `Đã từ chối cấp phép và gỡ bỏ hoàn toàn ${deletedStores} hồ sơ lỗi khỏi hệ thống, cho phép người dùng đăng ký lại từ đầu.`
  }
}

// C. Khóa/Ban hàng loạt các cửa hàng có dấu hiệu gian lận vi phạm + Ẩn sản phẩm + Hạ quyền + Gửi mail
const banStoresBulk = async (storeIds) => {
  if (!Array.isArray(storeIds) || storeIds.length === 0) {
    throw new Error('Danh sách ID cửa hàng cần khóa không hợp lệ.')
  }

  // 1. Lấy thông tin email và tên chủ shop để gửi mail cảnh báo
  const targets = await managerStoreModel.getStoresAndOwnersInfo(storeIds)

  // 2. Chuyển trạng thái hoạt động của các cửa hàng thành false (is_active = false)
  const affectedStores = await managerStoreModel.updateStoresStatusBulk(storeIds, false)
  if (affectedStores === 0) throw new Error('Không có cửa hàng nào bị tác động hoặc đã bị khóa từ trước.')

  // 3. Tự động ẩn toàn bộ các đôi giày đang bán của các shop này xuống (is_active = false)
  const affectedProducts = await managerStoreModel.disableProductsByStoreIds(storeIds)

  // 4. TIẾN TRÌNH GỬI EMAIL CẢNH BÁO KHÓA GIAN HÀNG HÀNG LOẠT
  if (targets.length > 0) {
    Promise.all(
      targets.map(async (shop) => {
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #333333; padding-bottom: 10px; background-color: #d9534f; padding: 10px 0; border-radius: 4px 4px 0 0;">
              <h2 style="color: #ffffff; margin: 0;">Shoes Store - Thông Báo Đình Chỉ Hoạt Động</h2>
            </div>
            <div style="padding: 20px 0; line-height: 1.6; color: #333333;">
              <p>Xin chào <strong>${shop.fullname}</strong>,</p>
              <p>Hệ thống giám sát <strong>Shoes Store</strong> phát hiện gian hàng <span style="color: #d9534f; font-weight: bold;">${shop.store_name}</span> của bạn đã vi phạm nghiêm trọng chính sách kinh doanh của sàn.</p>
              
              <div style="background-color: #fcf8e3; border-left: 4px solid #f0ad4e; padding: 15px; margin: 20px 0; border-radius: 4px; color: #8a6d3b;">
                <h4 style="margin: 0 0 8px 0; color: #f0ad4e;">Biện pháp kỷ luật áp dụng lập tức:</h4>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Đóng băng trạng thái hoạt động của gian hàng <strong>${shop.store_name}</strong>.</li>
                  <li>Ẩn toàn bộ sản phẩm thuộc quyền sở hữu của shop khỏi trang hiển thị công khai.</li>
                  <li>Đóng băng tạm thời quyền đăng sản phẩm mới và các hoạt động cấu hình shop.</li>
                </ul>
              </div>

              <p>Bạn vẫn có thể đăng nhập vào hệ thống để theo dõi số dư hoặc liên hệ với bộ phận điều hành của Shoes Store để tiến hành gửi đơn khiếu nại nếu có minh chứng ngược lại.</p>
            </div>
            <div style="text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #777777;">
              <p>© 2026 Shoes Store. All Rights Reserved.</p>
            </div>
          </div>
        `
        return EmailProvider.sendEmail(
          shop.email,
          `[Shoes Store] CẢNH BÁO: Đình chỉ hoạt động gian hàng ${shop.store_name}`,
          htmlContent
        )
      })
    ).catch(err => {
      console.error('Lỗi gửi mail thông báo ban shop loạt:', err.message)
    })
  }

  return {
    message: `Đã tạm dừng hoạt động đối với ${affectedStores} cửa hàng vi phạm, hệ thống đã tự động ẩn ${affectedProducts} sản phẩm liên quan và gửi mail thông báo.`
  }
}

export const managerStoreService = {
  getStoresList,
  approveStoresBulk,
  banStoresBulk,
  rejectStoresBulk
}