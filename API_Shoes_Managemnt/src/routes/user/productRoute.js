import express from 'express'
import { productController } from '~/controllers/user/productController'

const router = express.Router()

router.get('/homepage-products', productController.getHomepageProducts)

router.get('/detail/:slug', productController.getProductDetail)

export const productRouter = router