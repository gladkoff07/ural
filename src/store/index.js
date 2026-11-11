import { configureStore } from '@reduxjs/toolkit'
import partsReducer from './partsSlice.js'

export const store = configureStore({
  reducer: {
    parts: partsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
})
