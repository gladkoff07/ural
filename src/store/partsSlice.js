import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import {
  DEMO_API_KEY,
  ApiError,
  searchByNumber,
} from '../api/favoritParts.js'

const API_KEY_STORAGE = 'favorit-parts-api-key'

// Ключ при старте: localStorage → env VITE_API_KEY → демо-ключ
function getInitialApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || undefined
  } catch {
    return undefined
  }
}

const initialState = {
  apiKey: getInitialApiKey() || import.meta.env.VITE_API_KEY || DEMO_API_KEY,

  query: '', // текст в поле формы
  lastQuery: '', // артикул последнего выполненного поиска

  // производители
  brands: [],
  brandsStatus: 'idle', // idle | loading | succeeded | failed
  brandsError: null,

  // аналоги и предложения
  selectedBrand: null,
  original: [],
  analogues: [],
  resultsStatus: 'idle', // idle | loading | succeeded | failed
  resultsError: null,
}

export const fetchBrands = createAsyncThunk(
  'parts/fetchBrands',
  async ({ number, apiKey, signal }, { rejectWithValue }) => {
    try {
      const goods = await searchByNumber({ apiKey, number, signal })
      return { number, goods }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error // отмену не считаем сбоем
      }
      return rejectWithValue(
        error instanceof ApiError
          ? error.message
          : 'Не удалось получить список производителей.',
      )
    }
  },
)

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {
    setQuery(state, action) {
      state.query = action.payload
    },
    resetSearch(state) {
      state.lastQuery = ''
      state.brands = []
      state.brandsStatus = 'idle'
      state.brandsError = null
      state.selectedBrand = null
      state.original = []
      state.analogues = []
      state.resultsStatus = 'idle'
      state.resultsError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.brandsStatus = 'loading'
        state.brandsError = null
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brandsStatus = 'succeeded'
        state.brands = action.payload.goods
        state.lastQuery = action.payload.number
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (action.error?.name === 'AbortError') return // отмена — не сбой
        state.brandsStatus = 'failed'
        state.brandsError =
          action.payload ?? action.error?.message ?? 'Неизвестная ошибка'
      })
  },
})

export const { setQuery, resetSearch } = partsSlice.actions

export default partsSlice.reducer
