import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    userInfo: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    favoriteIds: [],
    loading: true
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.userInfo = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
      state.loading = false
    },
    logoutSuccess: (state) => {
      state.userInfo = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.favoriteIds = []
      state.loading = false
    },
    setFavorites: (state, action) => {
      state.favoriteIds = action.payload
    },
    addToFavorites: (state, action) => {
      if (!state.favoriteIds.includes(action.payload)) {
        state.favoriteIds.push(action.payload)
      }
    },
    removeFromFavorites: (state, action) => {
      state.favoriteIds = state.favoriteIds.filter(id => id !== action.payload)
    },
    updateUserFields: (state, action) => {
      state.userInfo = {
        ...state.userInfo,
        ...action.payload
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    rehydrateUser: (state, action) => {
      if (action.payload) {
        state.userInfo = action.payload.userInfo || null
        state.isAuthenticated = action.payload.isAuthenticated || false
        state.favoriteIds = action.payload.favoriteIds || []
        state.loading = false
      }
    }
  }
})

export const {
  loginSuccess,
  logoutSuccess,
  setFavorites,
  addToFavorites,
  removeFromFavorites,
  updateUserFields,
  setLoading,
  rehydrateUser
} = userSlice.actions

export default userSlice.reducer