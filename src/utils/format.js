// Единое форматирование цен, чисел и дат по всей вёрстке
const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatPrice(value) {
  return value === null || value === undefined
    ? "—"
    : priceFormatter.format(value)
}

const numberFormatter = new Intl.NumberFormat("ru-RU")

export function formatNumber(value) {
  return numberFormatter.format(value)
}

// Дата отгрузки 
export function formatShipmentDate(isoDate) {
  if (!isoDate) return "—"
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Русские формы существительных
export function pluralize(count, forms) {
  const abs = Math.abs(count) % 100
  const last = abs % 10
  if (abs > 10 && abs < 20) return forms[2]
  if (last > 1 && last < 5) return forms[1]
  if (last === 1) return forms[0]
  return forms[2]
}
