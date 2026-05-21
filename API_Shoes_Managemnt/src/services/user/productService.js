import { productModel } from '~/models/user/product/productModel'

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

  return {
    ...product,
    variants: variants,
    relatedProducts: relatedProducts
  }
}

const searchAndFilterProducts = async (queryParams) => {
  const { search, categories, stores, minPrice, maxPrice, ratings, page, limit, sortBy } = queryParams

  const currentPage = Math.max(1, Number(page) || 1)
  const perPage = Math.max(1, Number(limit) || 8)
  const offset = (currentPage - 1) * perPage

  const filters = {
    search: search || '',
    categorySlugs: categories ? categories.split(',') : [],
    storeIds: stores ? stores.split(',').map(Number) : [],
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    ratings: ratings ? ratings.split(',').map(Number) : [],
    limit: perPage,
    offset: offset,
    sortBy: sortBy || 'latest'
  }

  const { products, total } = await productModel.searchAndFilterProducts(filters)
  const totalPages = Math.ceil(total / perPage)

  return {
    pagination: {
      totalItems: total,
      totalPages: totalPages,
      currentPage: currentPage,
      limit: perPage
    },
    products: products
  }
}

export const productService = {
  getHomepageProducts,
  getProductDetail,
  searchAndFilterProducts
}