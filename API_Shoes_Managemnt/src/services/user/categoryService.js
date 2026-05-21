import { categoryModel } from '~/models/user/category/categoryModel'

const getAllCategories = async () => {
  return await categoryModel.getAllCategories()
}

export const categoryService = {
  getAllCategories
}