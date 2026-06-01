import { favoriteModel } from '~/models/user/product/favoriteModel'

// Xử lý logic bật tắt Trái tim độc lập
const toggleFavorite = async (userId, productId) => {
  const isFavorite = await favoriteModel.checkFavoriteExist(userId, productId)

  if (isFavorite) {
    await favoriteModel.removeFavorite(userId, productId)
    return { isFavorite: false, message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.' }
  } else {
    await favoriteModel.addFavorite(userId, productId)
    return { isFavorite: true, message: 'Đã thêm sản phẩm vào danh sách yêu thích thành công.' }
  }
}

// Lấy danh sách Wishlist
const getFavoriteProducts = async (userId) => {
  return await favoriteModel.getFavoriteProductsByUserId(userId)
}

export const favoriteService = {
  toggleFavorite,
  getFavoriteProducts
}