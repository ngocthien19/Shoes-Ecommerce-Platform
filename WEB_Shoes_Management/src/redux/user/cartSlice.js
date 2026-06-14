import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartCount: 0
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Nạp tổng số lượng giỏ hàng từ API về
    setCartCount: (state, action) => {
      state.cartCount = action.payload
    },
    // Cộng dồn nhanh khi click thêm sản phẩm ngoài danh sách
    incrementCartCount: (state, action) => {
      state.cartCount += action.payload
    },
    // Trừ đi hoặc làm sạch khi đăng xuất
    clearCart: (state) => {
      state.cartCount = 0
    }
  }
})

export const { setCartCount, incrementCartCount, clearCart } = cartSlice.actions
export default cartSlice.reducer