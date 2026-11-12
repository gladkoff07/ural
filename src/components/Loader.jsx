function Loader({ title, subtitle, compact }) {
  return (
    <div
      className={`state-block text-center ${compact ? "py-3" : "py-5"}`}
      role='status'
    >
      <div
        className='spinner-border text-warning mb-3'
        aria-hidden='true'
      />
      {title && <div className='fw-semibold'>{title}</div>}
      {subtitle && <div className='text-muted small mt-1'>{subtitle}</div>}
      <span className='visually-hidden'>Загрузка…</span>
    </div>
  )
}

export default Loader
