import { useRef, useState } from "react"

const EXAMPLES = ["0189", "01089", "OC90", "W712/73"]

function SearchForm({ onSearch }) {
  const [number, setNumber] = useState("")
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = number.trim()
    if (!value) {
      setError(true)
      inputRef.current?.focus()
      return
    }
    setError(false)
    onSearch(value)

    // Поле очищается и возвращает фокус сразу после отправки запроса
    setNumber("")
    inputRef.current?.focus()
  }

  const handleExample = (example) => {
    setNumber(example)
    setError(false)
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
          onChange={(event) => {
            setNumber(event.target.value)
            if (error) setError(false)
          }}
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

      {error && (
        <p
          className='text-danger small mb-0 mt-2'
          role='alert'
        >
          <i className='bi bi-exclamation-circle me-1' />
          Введите артикул детали — без него поиск невозможен.
        </p>
      )}

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
