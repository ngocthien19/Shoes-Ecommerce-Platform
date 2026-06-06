import { productModel } from '~/models/user/product/productModel'

// 1. Gom cụm dữ liệu trang chủ
const getHomepageProducts = async () => {
  // BƯỚC 1: Lấy danh sách sản phẩm thô từ các hàm gốc ở Model
  const [flashSaleRaw, topSellingRaw, latestRaw] = await Promise.all([
    productModel.getFlashSaleProducts(8),
    productModel.getTopSellingProducts(8),
    productModel.getLatestProducts(8)
  ])

  const attachVariantsToProducts = async (productsList) => {
    if (!productsList || productsList.length === 0) return []

    return await Promise.all(
      productsList.map(async (product) => {
        const variants = await productModel.getProductVariants(product.id)
        return {
          ...product,
          variants: variants || []
        }
      })
    )
  }

  const [flashSale, topSelling, latest] = await Promise.all([
    attachVariantsToProducts(flashSaleRaw),
    attachVariantsToProducts(topSellingRaw),
    attachVariantsToProducts(latestRaw)
  ])

  return { flashSale, topSelling, latest }
}

// 2. Xử lý logic bốc tách trọn gói trang chi tiết sản phẩm
const getProductDetail = async (slug) => {
  const product = await productModel.getProductBySlug(slug)
  if (!product) {
    throw new Error('Sản phẩm không tồn tại hoặc đã bị ẩn.')
  }

  await productModel.increaseViewCount(product.id)

  const [variants, relatedProductsRaw] = await Promise.all([
    productModel.getProductVariants(product.id),
    productModel.getRelatedProducts(product.category_id, product.id, 4)
  ])

  const formattedRelatedProducts = await Promise.all(
    (relatedProductsRaw || []).map(async (item) => {
      const itemVariants = await productModel.getProductVariants(item.id)
      return {
        ...item,
        variants: itemVariants || []
      }
    })
  )

  return {
    ...product,
    variants: variants || [],
    relatedProducts: formattedRelatedProducts
  }
}

const searchAndFilterProducts = async (queryParams) => {
  const { search, categories, stores, ratings, page, limit, sortBy, sizes, colors, isDiscounted } = queryParams

  const currentPage = Math.max(1, Number(page) || 1)
  const perPage = Math.max(1, Number(limit) || 8)
  const offset = (currentPage - 1) * perPage

  const filters = {
    search: search || '',
    categorySlugs: categories ? categories.split(',') : [],
    storeIds: stores ? stores.split(',').map(Number) : [],
    ratings: ratings ? ratings.split(',').map(Number) : [],
    limit: perPage,
    offset: offset,
    sizes: sizes ? sizes.split(',') : [],
    colors: colors ? colors.split(',') : [],
    prices: queryParams.prices ? queryParams.prices.split(',') : [],
    isDiscounted: isDiscounted === 'true',
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

const getEmptyCartRecommendations = async (limit = 8) => {
  return await productModel.getEmptyCartRecommendations(limit)
}

const getPostCheckoutRecommendations = async (queryParams) => {
  const limit = Number(queryParams.limit) || 8

  // Parse chuỗi "1,2,3" gửi từ Frontend thành mảng số nguyên [1, 2, 3]
  const categoryIds = queryParams.categoryIds ? queryParams.categoryIds.split(',').map(Number) : []
  const excludedIds = queryParams.excludedIds ? queryParams.excludedIds.split(',').map(Number) : []

  // FALLBACK: Nếu không nhận được categoryId nào (giỏ hàng rỗng hoặc lỗi truyền data),
  // tự động gọi hàm gợi ý Giỏ hàng trống để cứu cánh giao diện.
  if (categoryIds.length === 0) {
    return await productModel.getEmptyCartRecommendations(limit)
  }

  return await productModel.getPostCheckoutRecommendations(categoryIds, excludedIds, limit)
}

export const productService = {
  getHomepageProducts,
  getProductDetail,
  searchAndFilterProducts,
  getEmptyCartRecommendations,
  getPostCheckoutRecommendations
}