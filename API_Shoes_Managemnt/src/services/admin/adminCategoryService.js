import { adminCategoryModel } from '~/models/admin/category/adminCategoryModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import slugify from 'slugify'

// Hàm phụ trợ: Biến đổi Tiếng Việt có dấu thành Slug không dấu, gạch nối
const generateCustomSlug = (text) => {
  return slugify(text, {
    replacement: '-', // Thay dấu cách bằng -
    remove: /[*+~.()'"!:@]/g, // Loại bỏ ký tự đặc biệt
    lower: true, // Chuyển về chữ thường
    strict: true, // Lọc bỏ ký tự đặc biệt của các ngôn ngữ khác
    locale: 'vi' // Ép chuẩn ngôn ngữ Tiếng Việt để xử lý đ, ô, ê, á, à...
  })
}

// 💡 Thuật toán đệ quy: Biến mảng phẳng thành cấu trúc cây danh mục đa cấp lồng nhau
const buildCategoryTree = (flatCategories, parentId = null) => {
  const branch = []

  flatCategories.forEach(category => {
    // Nếu parent_id của phần tử khớp với parentId đang tìm kiếm
    if (category.parent_id === parentId) {
      // Đệ quy tìm tiếp các danh mục con của danh mục hiện tại
      const children = buildCategoryTree(flatCategories, category.id)

      const node = {
        id: category.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        image: category.image ? (typeof category.image === 'string' ? JSON.parse(category.image) : category.image) : null,
        isActive: category.is_active,
        parentName: category.parent_name || null
      }

      if (children.length > 0) {
        node.children = children
      }

      branch.push(node)
    }
  })

  return branch
}

// 1. API: Lấy toàn bộ cây danh mục lồng nhau (Dành cho Menu và bộ lọc)
const getCategoriesList = async (filters) => {
  // Chế độ 1: Nếu Frontend truyền param mode = 'tree' (Ví dụ: phục vụ render Menu thả chọn danh mục cha)
  if (filters.mode === 'tree') {
    const flatCategories = await adminCategoryModel.getAllCategoriesFlat()
    return { mode: 'tree', tree: buildCategoryTree(flatCategories, null) }
  }

  // Chế độ 2: Mặc định render trang quản lý có Widgets + Phân trang + Đếm sản phẩm
  const page = Number(filters.page) || 1
  const limit = Number(filters.limit) || 10
  const offset = (page - 1) * limit

  const filterParams = {
    search: filters.search || null,
    limit: String(limit),
    offset: String(offset)
  }

  // Chạy song song 3 lệnh bốc data tối ưu hiệu năng
  const [categories, totalItems, overviewStats] = await Promise.all([
    adminCategoryModel.getCategoriesForAdmin(filterParams),
    adminCategoryModel.countCategoriesForAdmin(filterParams),
    adminCategoryModel.getCategoriesOverviewStats()
  ])

  // Chuẩn hóa định dạng ảnh JSON trả về cho danh sách phẳng
  const formattedCategories = categories.map(cat => ({
    ...cat,
    image: cat.image ? (typeof cat.image === 'string' ? JSON.parse(cat.image) : cat.image) : null,
    totalProducts: Number(cat.total_products) || 0
  }))

  return {
    mode: 'flat',
    overview: overviewStats,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      limit
    },
    categories: formattedCategories
  }
}

// 2. API: Admin tạo mới Danh mục đa cấp
const createCategory = async (categoryData) => {
  // Tạo slug tự động từ tên danh mục gửi lên
  let generatedSlug = generateCustomSlug(categoryData.name)

  // Bọc lót: Nếu slug bị trùng, tự động đính thêm đuôi timestamp để tránh sập UNIQUE
  const isSlugExist = await adminCategoryModel.checkSlugExist(generatedSlug)
  if (isSlugExist) {
    generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`
  }

  // Đóng gói Object ảnh lưu Cloudinary dạng JSON String
  const imageJson = categoryData.imageFile
    ? JSON.stringify({ public_id: categoryData.imageFile.filename, secure_url: categoryData.imageFile.path })
    : null

  const newId = await adminCategoryModel.createCategory({
    parentId: categoryData.parentId ? Number(categoryData.parentId) : null,
    name: categoryData.name,
    description: categoryData.description,
    slug: generatedSlug,
    image: imageJson
  })

  return {
    message: 'Khởi tạo danh mục sản phẩm mới thành công!',
    categoryId: newId
  }
}

// 3. API: Admin cập nhật danh mục đa cấp
const updateCategory = async (id, categoryData) => {
  const currentCategory = await adminCategoryModel.getCategoryDetailById(id)
  if (!currentCategory) throw new Error('Danh mục yêu cầu cập nhật không tồn tại trên sàn.')

  // Không cho phép tự chọn chính mình làm danh mục cha (Gây vòng lặp đệ quy vô tận)
  if (categoryData.parentId && Number(categoryData.parentId) === Number(id)) {
    throw new Error('Thao tác sai lầm! Không thể chọn chính danh mục này làm danh mục cha của nó.')
  }

  // Xử lý đổi tên -> Đổi slug tương ứng
  let generatedSlug = currentCategory.slug
  if (categoryData.name && categoryData.name !== currentCategory.name) {
    generatedSlug = generateCustomSlug(categoryData.name)
    const isSlugExist = await adminCategoryModel.checkSlugExist(generatedSlug, id)
    if (isSlugExist) {
      generatedSlug = `${generatedSlug}-${Date.now().toString().slice(-4)}`
    }
  }

  // Xử lý ảnh cũ - ảnh mới trên Cloudinary
  let imageJson = currentCategory.image
  if (categoryData.imageFile) {
    // Nếu trước đó đã có ảnh cũ, thực hiện triệt tiêu ảnh cũ trên Cloudinary cho sạch bộ nhớ
    if (currentCategory.image) {
      const oldImage = typeof currentCategory.image === 'string' ? JSON.parse(currentCategory.image) : currentCategory.image
      if (oldImage?.public_id) {
        await CloudinaryProvider.cloudinary.uploader.destroy(oldImage.public_id)
      }
    }
    // Nạp ảnh mới vào
    imageJson = JSON.stringify({ public_id: categoryData.imageFile.filename, secure_url: categoryData.imageFile.path })
  }

  await adminCategoryModel.updateCategory(id, {
    parentId: categoryData.parentId ? Number(categoryData.parentId) : null,
    name: categoryData.name,
    description: categoryData.description,
    slug: generatedSlug,
    image: imageJson
  })

  return { message: 'Cập nhật thông tin danh mục thành công!' }
}

// 4. API: Xóa đơn lẻ danh mục (Đẩy con lên làm cha độc lập + Dọn rác Cloudinary)
const deleteCategory = async (id) => {
  const category = await adminCategoryModel.getCategoryDetailById(id)
  if (!category) throw new Error('Danh mục mục tiêu không tồn tại trên hệ thống.')

  // Bước 1: Giải phóng các danh mục con, đẩy chúng lên làm danh mục gốc 독립 (parent_id = NULL)
  await adminCategoryModel.detachChildCategories(id)

  // Bước 2: Dọn sạch file ảnh đại diện của danh mục này trên Cloudinary
  if (category.image) {
    const imageObj = typeof category.image === 'string' ? JSON.parse(category.image) : category.image
    if (imageObj?.public_id) {
      await CloudinaryProvider.cloudinary.uploader.destroy(imageObj.public_id)
    }
  }

  // Bước 3: Xóa cứng bản ghi khỏi MySQL. (Sản phẩm dính danh mục này tự động chuyển category_id về NULL nhờ SET NULL)
  await adminCategoryModel.deleteCategoryHard(id)

  return {
    message: 'Đã xóa bỏ hoàn toàn danh mục! Các danh mục con liên đới đã được đẩy lên làm danh mục độc lập.'
  }
}

const getCategoryDetail = async (id) => {
  const category = await adminCategoryModel.getCategoryDetailById(id)

  if (!category) {
    const error = new Error('Danh mục sản phẩm không tồn tại trên sàn hoặc đã bị xóa trước đó.')
    error.statusCode = 404
    throw error
  }

  // Chuẩn hóa định dạng ảnh JSON thành Object để Frontend dễ xài
  return {
    id: category.id,
    parentId: category.parent_id,
    parentName: category.parent_name || null,
    name: category.name,
    description: category.description,
    slug: category.slug,
    image: category.image ? (typeof category.image === 'string' ? JSON.parse(category.image) : category.image) : null,
    isActive: category.is_active,
    totalProducts: Number(category.total_products) || 0,
    createdAt: category.created_at
  }
}

export const adminCategoryService = {
  getCategoriesList,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory
}