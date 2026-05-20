import { categoryModel } from '~/models/category/categoryModel'

const getAllCategories = async () => {
  return await categoryModel.getAllCategories()
}

export const categoryService = {
  getAllCategories
}