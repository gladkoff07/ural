function ErrorAlert({ error, onRetry, onCheckKey }) {
  return (
    <div
      className='alert alert-danger mb-0'
      role='alert'
    >
      <div className='d-flex gap-3'>
        <i className='bi bi-exclamation-triangle-fill fs-5' />
        <div className='flex-grow-1'>
          <div className='fw-semibold mb-1'>Не удалось загрузить данные</div>
          <div className='small'>{error}</div>

          {(onRetry || onCheckKey) && (
            <div className='d-flex flex-wrap gap-2 mt-3'>
              {onRetry && (
                <button
                  type='button'
                  className='btn btn-outline-danger btn-sm'
                  onClick={onRetry}
                >
                  <i className='bi bi-arrow-clockwise me-1' /> Повторить
                </button>
              )}
              {onCheckKey && (
                <button
                  type='button'
                  className='btn btn-outline-secondary btn-sm'
                  onClick={onCheckKey}
                >
                  <i className='bi bi-key me-1' /> Проверить ключ API
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorAlert
