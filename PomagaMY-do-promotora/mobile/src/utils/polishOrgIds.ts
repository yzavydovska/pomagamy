
export function normalizeNipInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

export function isValidPolishNip(digits: string): boolean {
  if (digits.length !== 10) return false
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * weights[i]!
  }
  const check = sum % 11
  if (check === 10) return false
  return check === Number(digits[9])
}

export function nipValidationError(raw: string): string | null {
  const digits = normalizeNipInput(raw)
  if (digits.length === 0) {
    return 'Podaj numer NIP organizacji (10 cyfr).'
  }
  if (digits.length !== 10) {
    return `NIP musi mieć dokładnie 10 cyfr (wpisano ${digits.length}).`
  }
  if (!isValidPolishNip(digits)) {
    return 'Numer ma 10 cyfr, ale nie jest poprawnym NIP — sprawdź cyfry lub cyfrę kontrolną (ostatnia).'
  }
  return null
}

export function normalizeKrsInput(raw: string): string {
  return raw.replace(/\s/g, '').trim()
}

export function isPlausibleKrs(krs: string): boolean {
  const d = krs.replace(/\D/g, '')
  return d.length >= 9 && d.length <= 10
}

export function normalizedKrsDigits(raw: string): string {
  return normalizeKrsInput(raw).replace(/\D/g, '')
}

export function krsValidationErrorOptional(raw: string): string | null {
  const cleaned = normalizeKrsInput(raw)
  const digits = cleaned.replace(/\D/g, '')
  if (digits.length === 0) return null
  if (!isPlausibleKrs(cleaned)) {
    return 'Jeśli podajesz numer KRS, wpisz 9–10 cyfr. Organizacja bez KRS może zostawić pole puste.'
  }
  return null
}

export function formatNipForDisplay(raw: string | undefined): string {
  const s = String(raw ?? '').trim()
  if (!s) return '—'
  const d = s.replace(/\D/g, '')
  if (d.length !== 10) return s
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`
}

export function formatKrsForDisplay(raw: string | undefined): string {
  const s = String(raw ?? '').trim()
  const d = s.replace(/\D/g, '')
  if (!d) return '—'
  return d
}
