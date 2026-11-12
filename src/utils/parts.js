// Нормализация «сырых» данных API Favorit Parts.
// Пустой ответ: [] или массив объектов без полезных полей — это "ничего не найдено"
export function isEmptyGoods(goods) {
  if (!Array.isArray(goods) || goods.length === 0) return true
  return goods.every(
    (item) => !item || (!item.brand && !item.number && !item.name),
  )
}

function normalizeWarehouse(warehouse) {
  return {
    code: warehouse.code ?? "",
    price:
      typeof warehouse.price === "number" ? warehouse.price : null,
    stock: typeof warehouse.stock === "number" ? warehouse.stock : 0,
    shipmentDate: warehouse.shipmentDate ?? null,
    notRefund: Boolean(warehouse.notRefund),
  }
}

// Минимальная цена: warehouses[].price приоритетнее устаревшего item.price
export function getItemMinPrice(item) {
  const prices = []
  if (Array.isArray(item.warehouses)) {
    item.warehouses.forEach((warehouse) => {
      if (typeof warehouse.price === "number" && warehouse.price > 0) {
        prices.push(warehouse.price)
      }
    })
  }
  if (
    !prices.length &&
    typeof item.price === "number" &&
    item.price > 0
  ) {
    prices.push(item.price)
  }
  return prices.length ? Math.min(...prices) : null
}

// Суммарный остаток по складам
export function getItemTotalStock(item) {
  if (!Array.isArray(item.warehouses)) return 0
  return item.warehouses.reduce(
    (sum, warehouse) =>
      sum + (typeof warehouse.stock === "number" ? warehouse.stock : 0),
    0,
  )
}

//  позиция для UI
export function normalizeItem(item) {
  const warehouses = Array.isArray(item.warehouses)
    ? item.warehouses.map(normalizeWarehouse)
    : []
  return {
    brand: item.brand ?? "",
    number: item.number ?? "",
    name: (item.name ?? "").trim(),
    warehouses,
    minPrice: getItemMinPrice(item),
    totalStock: getItemTotalStock(item),
    notRefund: Boolean(item.notRefund),
  }
}

export function aggregateBrands(goods) {
  const byBrand = new Map()
  for (const raw of goods) {
    if (!raw) continue
    const item = normalizeItem(raw)
    if (!item.brand && !item.number) continue

    const existing = byBrand.get(item.brand)
    if (!existing) {
      byBrand.set(item.brand, item)
    } else {
      existing.totalStock += item.totalStock
      if (
        item.minPrice !== null &&
        (existing.minPrice === null || item.minPrice < existing.minPrice)
      ) {
        existing.minPrice = item.minPrice
      }
    }
  }
  return [...byBrand.values()]
}


export function normalizeResults(goods) {
  const originals = []
  const analogues = []
  const seen = new Set()

  for (const raw of goods) {
    if (!raw) continue
    originals.push(normalizeItem(raw))

    if (Array.isArray(raw.analogues)) {
      for (const analogRaw of raw.analogues) {
        if (!analogRaw) continue
        const analog = normalizeItem(analogRaw)
        const key = `${analog.brand}|${analog.number}|${analog.name}`
        if (seen.has(key)) continue
        seen.add(key)
        analogues.push(analog)
      }
    }
  }

  return { originals, analogues }
}
