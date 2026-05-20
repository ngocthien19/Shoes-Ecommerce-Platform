import express from 'express'
import { productController } from '~/controllers/user/productController'
import { reviewController } from '~/controllers/user/reviewController'

const router = express.Router()

router.get('/homepage-products', productController.getHomepageProducts)
router.get('/:slug/reviews', reviewController.getProductReviews)

router.get('/search-filter', productController.searchAndFilterProducts)

router.get('/detail/:slug', productController.getProductDetail)

export const productRouter = router