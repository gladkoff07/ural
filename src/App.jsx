import { useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import SearchForm from "./components/SearchForm.jsx"
import Loader from "./components/Loader.jsx"
import ErrorAlert from "./components/ErrorAlert.jsx"
import EmptyState from "./components/EmptyState.jsx"
import {
  clearBrandSelection,
  fetchAnalogues,
  fetchBrands,
  selectBrand,
} from "./store/partsSlice.js"

// warehouses[].price приоритетнее устаревшего price
function getMinPrice(item) {
  const prices = []
  if (typeof item.price === "number" && item.price > 0) {
    prices.push(item.price)
  }
  if (Array.isArray(item.warehouses)) {
    item.warehouses.forEach((warehouse) => {
      if (typeof warehouse.price === "number" && warehouse.price > 0) {
        prices.push(warehouse.price)
      }
    })
  }
  return prices.length ? Math.min(...prices) : null
}

// Суммарный остаток по складам
function getTotalStock(item) {
  if (!Array.isArray(item.warehouses)) return 0
  return item.warehouses.reduce(
    (sum, warehouse) =>
      sum + (typeof warehouse.stock === "number" ? warehouse.stock : 0),
    0,
  )
}

function formatPrice(value) {
  return value === null ? "—" : `${value.toLocaleString("ru-RU")} ₽`
}

function App() {
  const dispatch = useDispatch()
  const apiKey = useSelector((state) => state.parts.apiKey)
  const brands = useSelector((state) => state.parts.brands)
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const brandsError = useSelector((state) => state.parts.brandsError)
  const lastQuery = useSelector((state) => state.parts.lastQuery)
  const selectedBrand = useSelector((state) => state.parts.selectedBrand)
  const original = useSelector((state) => state.parts.original)
  const analogues = useSelector((state) => state.parts.analogues)
  const resultsStatus = useSelector((state) => state.parts.resultsStatus)
  const resultsError = useSelector((state) => state.parts.resultsError)

  const handleFocusSearch = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const input = document.querySelector(".search-placeholder .form-control")
    if (input) input.focus()
  }

  const handleSearch = (number) => {
    dispatch(fetchBrands({ number, apiKey }))
  }

  const handleBrandClick = (item) => {
    const isSelected =
      selectedBrand &&
      selectedBrand.brand === item.brand &&
      selectedBrand.number === item.number
    // повторный клик свернуть аккордеон
    if (isSelected) {
      handleBack()
      return
    }
    dispatch(selectBrand(item))
    dispatch(fetchAnalogues({ number: item.number, brand: item.brand, apiKey }))
  }

  // стор очищается после завершения transition
  const closeTimerRef = useRef(null)
  const [closingRowKey, setClosingRowKey] = useState(null)

  const handleBack = () => {
    if (!selectedBrand) return
    const index = brands.findIndex(
      (b) =>
        b.brand === selectedBrand.brand && b.number === selectedBrand.number,
    )
    if (index !== -1) {
      setClosingRowKey(
        `${selectedBrand.brand}-${selectedBrand.number}-${index}`,
      )
    }
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      dispatch(clearBrandSelection())
      setClosingRowKey(null)
    }, 350)
  }

  return (
    <>
      <header className='app-header'>
        <div className='container header-inner'>
          <div className='brand d-flex align-items-center'>
            <span className='brand-icon'>
              <i className='bi bi-gear-fill' />
            </span>
            <div className='ms-2'>
              <div className='brand-name'>Favorit Parts</div>
              <div className='brand-tagline'>подбор автозапчастей</div>
            </div>
          </div>
        </div>
      </header>

      <main className='flex-grow-1'>
        <section className='hero py-5'>
          <div className='container'>
            <div className='hero-panel p-4 p-md-5'>
              <span className='badge hero-badge mb-3'>
                <i className='bi bi-stars me-1' /> Поиск по каталогу Favorit
                Parts
              </span>
              <h1 className='display-5 fw-bold mb-3'>
                Подбор автозапчастей
                <span className='d-block text-warning'>по артикулу</span>
              </h1>
              <p className='text-secondary mb-4'>
                Введите номер детали — сервис покажет производителей, а затем
                аналоги и предложения поставщиков с ценами и остатками на
                складах.
              </p>

              {/* Форма поиска */}
              <SearchForm onSearch={handleSearch} />

              <div className='stepper d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mt-4 pt-2'>
                <div className='d-flex align-items-center gap-3'>
                  <span className='stepper-num active'>1</span>
                  <div>
                    <div className='fw-semibold'>Поиск производителя</div>
                    <div className='text-muted small'>Артикул → бренды</div>
                  </div>
                </div>
                <span className='stepper-line d-none d-md-block' />
                <div className='d-flex align-items-center gap-3'>
                  <span className='stepper-num'>2</span>
                  <div>
                    <div className='fw-semibold'>Аналоги и предложения</div>
                    <div className='text-muted small'>Цены и остатки</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Результаты поиска*/}
        <section className='results pb-5'>
          <div className='container'>
            {brandsStatus === "loading" && (
              <Loader
                title='Ищем производителей'
                subtitle={
                  lastQuery
                    ? `По артикулу «${lastQuery}»…`
                    : "Это займёт несколько секунд…"
                }
              />
            )}

            {brandsStatus === "failed" && (
              <ErrorAlert
                error={brandsError}
                onRetry={() =>
                  dispatch(fetchBrands({ number: lastQuery, apiKey }))
                }
              />
            )}

            {brandsStatus === "succeeded" && !brands.length && (
              <div className='result-panel p-4 mb-4'>
                <EmptyState
                  title='Ничего не найдено'
                  description={`По артикулу «${lastQuery}» производители не найдены. Проверьте номер и попробуйте ещё раз.`}
                  actionLabel='Новый поиск'
                  onAction={handleFocusSearch}
                />
              </div>
            )}

            {brandsStatus === "succeeded" && (
              <div className='result-panel p-4 mb-4'>
                <h2 className='h5 fw-semibold mb-3'>
                  Производители по артикулу{" "}
                  <span className='text-warning'>«{lastQuery}»</span>
                </h2>

                <div
                  className='brand-head d-none d-sm-grid'
                  aria-hidden='true'
                >
                  <span>Производитель</span>
                  <span>Номер</span>
                  <span>Цена</span>
                  <span />
                </div>

                <div className='brands-list'>
                  {brands.map((item, index) => {
                    const rowKey = `${item.brand}-${item.number}-${index}`
                    const isSelected =
                      selectedBrand &&
                      selectedBrand.brand === item.brand &&
                      selectedBrand.number === item.number
                    // контент остаётся в DOM во время анимации закрытия
                    const showContent =
                      isSelected || (selectedBrand && closingRowKey === rowKey)
                    return (
                      <div
                        className='brand-item'
                        key={rowKey}
                      >
                        <button
                          type='button'
                          className={`brand-row ${isSelected ? "active" : ""}`}
                          onClick={() =>
                            isSelected ? handleBack() : handleBrandClick(item)
                          }
                          aria-expanded={isSelected}
                        >
                          <span className='fw-semibold'>{item.brand}</span>
                          <span>{item.number}</span>
                          <span>{formatPrice(getMinPrice(item))}</span>
                          <i
                            className={`bi ${
                              isSelected ? "bi-chevron-up" : "bi-chevron-down"
                            } chevron`}
                          />
                        </button>
                        <div
                          className={`analogues-collapse ${
                            isSelected ? "open" : ""
                          }`}
                        >
                          <div className='analogues-inner'>
                            {showContent && selectedBrand && (
                              <div className='p-3'>
                                <div className='d-flex justify-content-between align-items-center mb-2'>
                                  <span className='fw-bold'>
                                    Аналоги и предложения:{" "}
                                    <span className='text-warning'>
                                      {selectedBrand.brand}
                                    </span>{" "}
                                    <span className='text-muted'>
                                      ({selectedBrand.number})
                                    </span>
                                  </span>
                                  <button
                                    type='button'
                                    className='btn-close'
                                    aria-label='Закрыть'
                                    onClick={handleBack}
                                  />
                                </div>

                                {resultsStatus === "loading" && (
                                  <Loader
                                    compact
                                    title='Загружаем аналоги'
                                    subtitle={`${selectedBrand.brand} (${selectedBrand.number})`}
                                  />
                                )}

                                {resultsStatus === "failed" && (
                                  <ErrorAlert
                                    error={resultsError}
                                    onRetry={() =>
                                      dispatch(
                                        fetchAnalogues({
                                          number: selectedBrand.number,
                                          brand: selectedBrand.brand,
                                          apiKey,
                                        }),
                                      )
                                    }
                                  />
                                )}

                                {resultsStatus === "succeeded" &&
                                  (original.length || analogues.length ? (
                                    <div className='table-responsive'>
                                      <table className='table align-middle mb-0'>
                                        <thead>
                                          <tr>
                                            <th scope='col'>Название</th>
                                            <th scope='col'>Производитель</th>
                                            <th scope='col'>Цена</th>
                                            <th scope='col'>Остаток</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {original
                                            .concat(analogues)
                                            .map((analogItem, analogIndex) => (
                                              <tr
                                                key={`${analogItem.brand}-${analogItem.number}-${analogItem.name}-${analogIndex}`}
                                              >
                                                <td>{analogItem.name}</td>
                                                <td>{analogItem.brand}</td>
                                                <td>
                                                  {formatPrice(
                                                    getMinPrice(analogItem),
                                                  )}
                                                </td>
                                                <td>
                                                  {getTotalStock(analogItem)}
                                                </td>
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <EmptyState
                                      compact
                                      title='Аналогов не найдено'
                                      description='Для этой позиции в базе нет предложений.'
                                    />
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className='steps pb-4 pb-md-5'>
          <div className='container'>
            <div className='steps-inner'>
              <div className='row g-3 g-md-4'>
                <div className='col-12 col-md-4'>
                  <div className='card step-card h-100'>
                    <div className='card-body p-4'>
                      <div className='step-row d-flex align-items-start gap-3'>
                        <span className='step-icon'>
                          <i className='bi bi-upc-scan' />
                        </span>
                        <div>
                          <div className='step-label'>ШАГ 1</div>
                          <div className='step-title'>Введите артикул</div>
                          <p className='step-desc mb-0'>
                            Номер детали, например 0189, 01089 или W712/73.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-md-4'>
                  <div className='card step-card h-100'>
                    <div className='card-body p-4'>
                      <div className='step-row d-flex align-items-start gap-3'>
                        <span className='step-icon'>
                          <i className='bi bi-building' />
                        </span>
                        <div>
                          <div className='step-label'>ШАГ 2</div>
                          <div className='step-title'>
                            Выберите производителя
                          </div>
                          <p className='step-desc mb-0'>
                            Сервис покажет все бренды, выпускающие эту деталь.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-12 col-md-4'>
                  <div className='card step-card h-100'>
                    <div className='card-body p-4'>
                      <div className='step-row d-flex align-items-start gap-3'>
                        <span className='step-icon'>
                          <i className='bi bi-table' />
                        </span>
                        <div>
                          <div className='step-label'>ШАГ 3</div>
                          <div className='step-title'>Сравните предложения</div>
                          <p className='step-desc mb-0'>
                            Аналоги, цены, остатки на складах и даты отгрузки.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='app-footer py-3 mt-auto'>
        <div className='container small text-muted text-center'>
          &copy; Favorit Parts
        </div>
      </footer>
    </>
  )
}

export default App
