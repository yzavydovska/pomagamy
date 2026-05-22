/** Minimalne wymagania bezpieczeństwa hasła przy rejestracji. */
export function validatePasswordStrength(password: string): { ok: true } | { ok: false; message: string } {
  if (password.length < 8) {
    return { ok: false, message: 'Hasło musi mieć co najmniej 8 znaków.' }
  }
  if (!/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(password)) {
    return { ok: false, message: 'Hasło musi zawierać co najmniej jedną literę.' }
  }
  if (!/\d/.test(password)) {
    return { ok: false, message: 'Hasło musi zawierać co najmniej jedną cyfrę.' }
  }
  if (!/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s]/.test(password)) {
    return { ok: false, message: 'Hasło musi zawierać co najmniej jeden znak specjalny.' }
  }
  return { ok: true }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
