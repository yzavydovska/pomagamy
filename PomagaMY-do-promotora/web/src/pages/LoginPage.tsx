import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

export function LoginPage() {
  function onSubmit(e: FormEvent) {
    e.preventDefault()
  }

  return (
    <div className="page page--auth">
      <div className="auth-card">
        <h1 className="auth-card__title">Logowanie</h1>
        <p className="auth-card__subtitle">Wersja demonstracyjna — formularz bez backendu.</p>
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label">E-mail</span>
            <input type="email" name="email" autoComplete="email" autoFocus required />
          </label>
          <label className="field">
            <span className="field__label">Hasło</span>
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button type="submit" className="btn btn--primary btn--lg btn--block">
            Zaloguj
          </button>
        </form>
        <p className="auth-card__footer">
          Nie masz konta? <Link to="/">Wróć na stronę główną</Link>
        </p>
      </div>
    </div>
  )
}
