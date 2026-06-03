import express from 'express'
import { storeController } from '~/controllers/user/storeController'

const router = express.Router()

router.get('/detail/:id', storeController.getStoreDetail)

export const storeRouter = router