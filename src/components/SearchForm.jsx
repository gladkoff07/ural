import { useRef, useState } from "react"
import { DEMO_API_KEY, searchByNumber } from "../api/favoritParts.js"

const EXAMPLES = ["0189", "01089", "OC90", "W712/73"]
const TEMP_API_KEY = import.meta.env.VITE_API_KEY || DEMO_API_KEY

function SearchForm({ onSearch }) {
  const [number, setNumber] = useState("")
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = number.trim()
    if (!value) return
    onSearch(value)

    // Временный запрос для проверки сети
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    searchByNumber({
      apiKey: TEMP_API_KEY,
      number: value,
      signal: abortRef.current.signal,
    })
      .then((goods) => {
        console.log(`Ответ Favorit Parts по «${value}»:`, goods)
      })
      .catch((error) => {
        if (error.name === "AbortError") return // отмену не считаем сбоем
        console.warn(`Ошибка запроса по «${value}»:`, error.message)
      })

    // Поле очищается и возвращает фокус сразу после отправки запроса
    setNumber("")
    inputRef.current?.focus()
  }

  const handleExample = (example) => {
    setNumber(example)
    inputRef.current?.focus()
  }

  return (
    <>
      <form
        className='search-placeholder input-group input-group-lg'
        onSubmit={handleSubmit}
      >
        <span className='input-group-text bg-white'>
          <i className='bi bi-upc-scan text-muted' />
        </span>
        <input
          ref={inputRef}
          type='text'
          className='form-control'
          placeholder='Например, 0189 или W712/73'
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          aria-label='Артикул детали'
        />
        <button
          type='submit'
          className='btn btn-dark'
        >
          <i className='bi bi-search me-2' />
          Найти
        </button>
      </form>

      <div className='search-examples d-flex align-items-center flex-wrap gap-2 mt-3'>
        <span>Попробуйте:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type='button'
            className='chip'
            onClick={() => handleExample(example)}
          >
            {example}
          </button>
        ))}
      </div>
    </>
  )
}

export default SearchForm
