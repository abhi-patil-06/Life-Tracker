export const pad = (n) => String(n).padStart(2, "0")

export const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const relKey = (offset) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const dateToKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export const keyToDate = (key) => {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const formatDateLong = (date) => {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
}

export const formatMonthYear = (date) => {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

// Parse "HH:MM" (24h) → { hours, minutes }
export const parseTime = (t) => {
  if (!t) return null
  const [h, m] = t.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return { hours: h, minutes: m }
}

// Format 24h "HH:MM" → "8:30 AM"
export const formatTime12 = (t) => {
  const p = parseTime(t)
  if (!p) return t
  const { hours, minutes } = p
  const ampm = hours >= 12 ? "PM" : "AM"
  const h    = hours % 12 || 12
  return `${h}:${pad(minutes)} ${ampm}`
}
