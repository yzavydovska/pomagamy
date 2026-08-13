
export function formatKodOgloszenia(numericPart: number, width = 3): string {
  const n = Math.max(0, Math.floor(numericPart))
  return `OG-${String(n).padStart(width, '0')}`
}

export function formatKodWolontariusza(numericPart: number, width = 5): string {
  const n = Math.max(0, Math.floor(numericPart))
  return `WV-${String(n).padStart(width, '0')}`
}

export const MOCK_VOLUNTEER_REF = formatKodWolontariusza(342, 3)
