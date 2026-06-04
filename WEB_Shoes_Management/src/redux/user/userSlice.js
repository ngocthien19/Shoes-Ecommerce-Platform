import { createSlice } from '@reduxjs/toolkit'

const initialUser = JSON.parse(localStorage.getItem('userInfo')) || null
const initialToken = localStorage.getItem('accessToken') || null

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: initialUser,
    accessToken: initialToken,
    isAuthenticated: !!initialToken
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.userInfo = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true

      localStorage.setItem('userInfo', JSON.stringify(action.payload.user))
      localStorage.setItem('accessToken', action.payload.accessToken)
    },
    logoutSuccess: (state) => {
      state.userInfo = null
      state.accessToken = null
      state.isAuthenticated = false

      localStorage.removeItem('userInfo')
      localStorage.removeItem('accessToken')
    }
  }
})

export const { loginSuccess, logoutSuccess } = userSlice.actions
export default userSlice.reducer