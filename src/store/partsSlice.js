import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit'
import {
  DEMO_API_KEY,
  ApiError,
  searchAnalogues,
  searchByNumber,
} from '../api/favoritParts.js'
import {
  aggregateBrands,
  isEmptyGoods,
  normalizeResults,
} from '../utils/parts.js'

const API_KEY_STORAGE = 'favorit-parts-api-key'

// Ключ при старте: localStorage/ env VITE_API_KEY/ демо-ключ
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
      return {
        number,
        brands: isEmptyGoods(goods) ? [] : aggregateBrands(goods),
      }
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

export const fetchAnalogues = createAsyncThunk(
  'parts/fetchAnalogues',
  async ({ number, brand, apiKey, signal }, { rejectWithValue }) => {
    try {
      const goods = await searchAnalogues({ apiKey, number, brand, signal })
      return isEmptyGoods(goods)
        ? { originals: [], analogues: [] }
        : normalizeResults(goods)
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error // отмену не считаем сбоем
      }
      return rejectWithValue(
        error instanceof ApiError
          ? error.message
          : 'Не удалось получить аналоги и предложения.',
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
    selectBrand(state, action) {
      state.selectedBrand = action.payload

      state.original = []
      state.analogues = []
      state.resultsStatus = 'idle'
      state.resultsError = null
    },
    clearBrandSelection(state) {
      state.selectedBrand = null
      state.original = []
      state.analogues = []
      state.resultsStatus = 'idle'
      state.resultsError = null
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
        state.brands = action.payload.brands
        state.lastQuery = action.payload.number

        state.selectedBrand = null
        state.original = []
        state.analogues = []
        state.resultsStatus = 'idle'
        state.resultsError = null
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (action.meta.aborted || action.error?.name === 'AbortError') return // отмена — не сбой
        state.brandsStatus = 'failed'
        state.brandsError =
          action.payload ?? action.error?.message ?? 'Неизвестная ошибка'
      })
      .addCase(fetchAnalogues.pending, (state) => {
        state.resultsStatus = 'loading'
        state.resultsError = null
      })
      .addCase(fetchAnalogues.fulfilled, (state, action) => {
        state.resultsStatus = 'succeeded'
        state.original = action.payload.originals
        state.analogues = action.payload.analogues
      })
      .addCase(fetchAnalogues.rejected, (state, action) => {
        if (action.meta.aborted || action.error?.name === 'AbortError') return // отмена — не сбой
        state.resultsStatus = 'failed'
        state.resultsError =
          action.payload ?? action.error?.message ?? 'Неизвестная ошибка'
      })
  },
})

export const { setQuery, selectBrand, clearBrandSelection, resetSearch } =
  partsSlice.actions

export default partsSlice.reducer
