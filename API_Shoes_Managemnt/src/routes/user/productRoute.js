import express from 'express'
import { productController } from '~/controllers/user/productController'
import { reviewController } from '~/controllers/user/reviewController'
import { favoriteController } from '~/controllers/user/favoriteController'
import { authGuard } from '~/middlewares/authGuard'

const router = express.Router()

// product
router.get('/homepage-products', productController.getHomepageProducts)

router.get('/search-filter', productController.searchAndFilterProducts)

router.get('/detail/:slug', productController.getProductDetail)

// favorite
router.post('/toggle', authGuard.isAuthorized, favoriteController.toggleFavorite)

router.get('/', authGuard.isAuthorized, favoriteController.getFavoriteProducts)

// review
router.get('/:slug/reviews', reviewController.getProductReviews)

export const productRouter = router