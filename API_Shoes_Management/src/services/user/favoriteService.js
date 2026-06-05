import { favoriteModel } from '~/models/user/product/favoriteModel'
import { productModel } from '~/models/user/product/productModel'

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
  // 1. Lấy danh sách sản phẩm đã thích thô từ bảng favorites nối sang products
  const favoriteProductsRaw = await favoriteModel.getFavoriteProductsByUserId(userId)

  if (!favoriteProductsRaw || favoriteProductsRaw.length === 0) return []

  // 2. Dùng Promise.all duyệt qua từng sản phẩm để gọi hàm getProductVariants nạp size/color/stock
  const formattedFavoriteProducts = await Promise.all(
    favoriteProductsRaw.map(async (item) => {
      // Vì câu lệnh SELECT ở model đặt alias p.id AS product_id nên ta truyền item.product_id nha
      const variants = await productModel.getProductVariants(item.product_id)

      return {
        ...item,
        // Đổi tên product_id về lại thành id để khớp 100% cấu trúc object product truyền vào component ProductCard
        id: item.product_id,
        variants: variants || []
      }
    })
  )

  return formattedFavoriteProducts
}

export const favoriteService = {
  toggleFavorite,
  getFavoriteProducts
}