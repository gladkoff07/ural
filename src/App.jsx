import { useDispatch, useSelector } from "react-redux"
import SearchForm from "./components/SearchForm.jsx"
import { fetchBrands } from "./store/partsSlice.js"

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

  const handleSearch = (number) => {
    dispatch(fetchBrands({ number, apiKey }))
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
              <p className='text-center text-muted py-4 mb-0'>Загрузка…</p>
            )}

            {brandsStatus === "failed" && (
              <div
                className='alert alert-danger'
                role='alert'
              >
                {brandsError}
              </div>
            )}

            {brandsStatus === "succeeded" && (
              <div className='result-panel p-4'>
                <h2 className='h5 fw-semibold mb-3'>
                  Производители по артикулу{" "}
                  <span className='text-warning'>«{lastQuery}»</span>
                </h2>
                <div className='table-responsive'>
                  <table className='table align-middle'>
                    <thead>
                      <tr>
                        <th scope='col'>Производитель</th>
                        <th scope='col'>Номер</th>
                        <th scope='col'>Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map((item, index) => (
                        <tr key={`${item.brand}-${item.number}-${index}`}>
                          <td>{item.brand}</td>
                          <td>{item.number}</td>
                          <td>{formatPrice(getMinPrice(item))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
