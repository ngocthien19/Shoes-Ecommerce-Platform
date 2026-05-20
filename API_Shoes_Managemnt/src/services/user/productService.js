import { productModel } from '~/models/product/productModel'

// 1. Gom cụm dữ liệu trang chủ
const getHomepageProducts = async () => {
  const [flashSale, topSelling, latest] = await Promise.all([
    productModel.getFlashSaleProducts(8),
    productModel.getTopSellingProducts(8),
    productModel.getLatestProducts(8)
  ])
  return { flashSale, topSelling, latest }
}

// 2. Xử lý logic bốc tách trọn gói trang chi tiết sản phẩm
const getProductDetail = async (slug) => {
  // BƯỚC 1: Tìm thông tin sản phẩm theo slug
  const product = await productModel.getProductBySlug(slug)
  if (!product) {
    throw new Error('Sản phẩm không tồn tại hoặc đã bị ẩn.')
  }

  // BƯỚC 2: Kích hoạt tăng lượt xem âm thầm, đồng thời lấy biến thể và sản phẩm tương tự song song
  await productModel.increaseViewCount(product.id)

  const [variants, relatedProducts] = await Promise.all([
    productModel.getProductVariants(product.id),
    productModel.getRelatedProducts(product.category_id, product.id, 4) // Lấy 4 sản phẩm tương tự
  ])

  // BƯỚC 3: Gộp chung lại thành một bọc dữ liệu hoàn chỉnh gửi về cho Frontend
  return {
    ...product,
    variants: variants, // Mảng chứa size, màu để FE làm nút bấm chọn
    relatedProducts: relatedProducts // Mảng sản phẩm tương tự hiển thị phía dưới Swiper
  }
}

export const productService = {
  getHomepageProducts,
  getProductDetail
}