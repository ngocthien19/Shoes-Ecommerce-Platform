import express from 'express'
import { storeController } from '~/controllers/user/storeController'

const router = express.Router()

router.get('/detail/:id', storeController.getStoreDetail)
router.get('/products/:id', storeController.getStoreProducts)

export const storeRouter = router