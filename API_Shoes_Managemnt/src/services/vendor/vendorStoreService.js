import { vendorStoreModel } from '~/models/vendor/store/vendorStoreModel'
import { systemSettingModel } from '~/models/admin/system/systemSettingModel'
import { userModel } from '~/models/user/userModel'
import { notificationService } from '~/services/notification/notificationService'

const registerStore = async (userId, { name, bio, logo, banner, address }) => {
  const hasStore = await vendorStoreModel.checkStoreExistByOwnerId(userId)
  if (hasStore) {
    throw new Error('Tài khoản của bạn đã đăng ký một cửa hàng trước đó rồi, không thể tạo thêm.')
  }

  const systemSettings = await systemSettingModel.getSettings()
  const defaultCommissionRate = systemSettings ? systemSettings.global_commission_rate : 10.00

  const result = await vendorStoreModel.createStore({
    ownerId: userId,
    name,
    bio,
    logo,
    banner,
    address,
    commissionRate: defaultCommissionRate
  })

  // 🌟 TIẾN TRÌNH BẮN SOCKET CHO MANAGER
  const newStoreId = result.insertId

  // 1. Trích xuất link ảnh từ trường 'logo'
  let logoUrl = ''
  try {
    const parsedLogo = logo ? JSON.parse(logo) : null
    if (parsedLogo && parsedLogo.secure_url) logoUrl = parsedLogo.secure_url
  } catch (error) { console.log('Không parse được logo lúc đăng ký') }

  // 2. Lấy thông tin người đăng ký
  const requesterInfo = await userModel.getUserById(userId)
  const requesterName = requesterInfo ? requesterInfo.fullname : 'Người dùng'
  const requesterEmail = requesterInfo ? requesterInfo.email : ''

  // 3. Quét danh sách Manager và phát sóng thông báo
  const managerIds = await userModel.getAllManagerIds()
  for (const managerId of managerIds) {
    await notificationService.createAndPushNotification({
      userId: managerId,
      title: 'Yêu cầu mở gian hàng mới',
      content: JSON.stringify({
        message: `Gian hàng "${name}" vừa gửi hồ sơ đăng ký.`,
        image: logoUrl,
        ownerName: requesterName,
        ownerEmail: requesterEmail
      }),
      type: 'STORE_PENDING',
      referenceId: newStoreId
    }).catch(err => console.error('Lỗi báo cho Manager:', err.message))
  }

  return {
    message: 'Gửi đơn đăng ký mở cửa hàng thành công! Vui lòng chờ Ban quản trị phê duyệt gian hàng.'
  }
}

// Logic lấy profile shop
const getStoreProfile = async (userId) => {
  const store = await vendorStoreModel.getStoreByOwnerId(userId)
  if (!store) {
    throw new Error('Tài khoản của pro chưa đăng ký cửa hàng nào trên hệ thống.')
  }
  return store
}

const updateStoreProfile = async (userId, updateData) => {
  // Check xem shop có tồn tại không (Giữ nguyên)
  const currentStore = await vendorStoreModel.getStoreByOwnerId(userId)
  if (!currentStore) {
    throw new Error('Không tìm thấy cửa hàng để cập nhật thông tin.')
  }

  // BẪY CHẶN THÔNG MINH: Nếu trường nào không truyền (undefined) thì bốc lại giá trị cũ trong DB đắp vào
  const finalName = updateData.name !== undefined ? updateData.name : currentStore.name
  const finalBio = updateData.bio !== undefined ? updateData.bio : currentStore.bio
  const finalAddress = updateData.address !== undefined ? updateData.address : currentStore.address

  // Xử lý ảnh (Giữ nguyên logic cũ nhưng bọc an toàn hơn)
  const finalLogo = updateData.logo ? JSON.stringify(updateData.logo) : currentStore.logo
  const finalBanner = updateData.banner ? JSON.stringify(updateData.banner) : currentStore.banner

  // Tiến hành cập nhật vào MySQL với các biến an toàn tuyệt đối (Không bao giờ dính undefined)
  await vendorStoreModel.updateStoreProfile(userId, {
    name: finalName,
    bio: finalBio,
    logo: finalLogo,
    banner: finalBanner,
    address: finalAddress
  })

  return await vendorStoreModel.getStoreByOwnerId(userId)
}

export const vendorStoreService = {
  registerStore,
  getStoreProfile,
  updateStoreProfile
}