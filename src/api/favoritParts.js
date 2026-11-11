
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://api.favorit-parts.ru/hs/hsprice/'

const REQUEST_TIMEOUT = 25000
export const DEMO_API_KEY = '00000000-0000-0000-0000-000000000001'

// Ошибка сервиса с понятным текстом для UI
export class ApiError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ApiError'
  }
}

// Словарь ошибок API 
export const API_ERROR_MESSAGES = {
  'Empty key!': 'Не задан ключ API. Укажите ключ по кнопке «Ключ API».',
  'Invalid key client!': 'Неверный ключ API. Проверьте ключ по кнопке «Ключ API».',
  'Request quota exceeded!': 'Превышен лимит запросов к API. Попробуйте позже.',
  'Invalid format!': 'Некорректный формат артикула.',
  'Brand not found!': 'Такой бренд не найден.',
  'Invalid brand!': 'Некорректно указан бренд.',
}

export function buildUrl(params) {
  // URLSearchParams корректно кодирует спецсимволы артикулов (#, &, / и т.д.)
  const searchParams = new URLSearchParams(params)
  return `${API_BASE_URL}?${searchParams}`
}

async function request(params, signal) {
  const controller = new AbortController()
  const timer = setTimeout(() => {
    controller.abort(new DOMException('Request timed out', 'TimeoutError'))
  }, REQUEST_TIMEOUT)

  // Пробрасываем внешнюю отмену
  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason)
    } else {
      signal.addEventListener(
        'abort',
        () => controller.abort(signal.reason),
        { once: true },
      )
    }
  }

  let response
  try {
    response = await fetch(buildUrl(params), { signal: controller.signal })
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new ApiError(
        'Сервис Favorit Parts не ответил за 25 секунд. Проверьте соединение и попробуйте ещё раз.',
      )
    }
    if (error.name === 'AbortError') {
      throw error // отмену пробрасываем как есть
    }
    throw new ApiError('Не удалось подключиться к сервису Favorit Parts.')
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new ApiError(`Сервис недоступен (HTTP ${response.status})`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ApiError('Неизвестный формат ответа сервиса.')
  }

  if (payload && typeof payload.error === 'string') {
    throw new ApiError(API_ERROR_MESSAGES[payload.error] || payload.error)
  }

  if (!payload || !Array.isArray(payload.goods)) {
    throw new ApiError('Неизвестный формат ответа сервиса.')
  }

  return payload.goods
}

export function searchByNumber({ apiKey, number, signal }) {
  return request({ key: apiKey, number, info: 'on' }, signal)
}

export function searchAnalogues({ apiKey, number, brand, signal }) {
  return request(
    { key: apiKey, number, brand, analogues: 'on', info: 'on' },
    signal,
  )
}
