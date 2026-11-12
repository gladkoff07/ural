
function EmptyState({ title, description, actionLabel, onAction, compact }) {
  return (
    <div
      className={`state-block text-center ${compact ? "py-3" : "py-5"}`}
    >
      <div
        className='state-icon mb-3'
        aria-hidden='true'
      >
        <i className='bi bi-search' />
      </div>
      <div className='fw-semibold'>{title}</div>
      {description && (
        <div className='text-muted small mt-1'>{description}</div>
      )}
      {actionLabel && onAction && (
        <button
          type='button'
          className='btn btn-outline-warning btn-sm mt-3'
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
