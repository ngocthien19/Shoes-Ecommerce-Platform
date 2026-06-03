import { storeModel } from '~/models/user/store/storeModel'

const getStoreDetail = async (storeId) => {
  const store = await storeModel.getStoreDetailById(storeId)

  if (!store) {
    throw new Error('Cửa hàng không tồn tại hoặc đã bị khóa.')
  }

  return store
}

export const storeService = {
  getStoreDetail
}