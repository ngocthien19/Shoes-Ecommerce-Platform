import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'

// 1. Cấu hình các thiết lập cho Redux Persist
const persistConfig = {
  key: 'root', // Khóa định danh root lưu dưới localStorage
  storage: {
    getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
    setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
    removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key))
  },
  whitelist: ['user'] // CHỈ định danh những slice nào muốn lưu lại khi F5
}

// 2. Gom tất cả các reducers lại
const rootReducer = combineReducers({
  user: userReducer
})

// 3. Tạo một reducer đã được bọc tính năng Persist
const persistedReducer = persistReducer(persistConfig, rootReducer)

// 4. Khởi tạo Store cấu hình kèm Middleware để tránh lỗi check non-serializable của Redux Toolkit
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

// 5. Khởi tạo đối tượng persistor để đồng bộ dữ liệu
export const persistor = persistStore(store)