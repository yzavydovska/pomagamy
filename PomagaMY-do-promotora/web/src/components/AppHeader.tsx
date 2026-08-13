import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) =>
  'nav-link' + (isActive ? ' nav-link--active' : '')

export function AppHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo__mark" aria-hidden />
          <span className="logo__text">Wolontariat</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
          <span className="nav-toggle__bar" />
        </button>

        <nav id="main-nav" className={'nav' + (open ? ' nav--open' : '')}>
          <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>
            Start
          </NavLink>
          <NavLink to="/wydarzenia" className={navClass} onClick={() => setOpen(false)}>
            Wydarzenia
          </NavLink>
          <NavLink to="/profil" className={navClass} onClick={() => setOpen(false)}>
            Profil
          </NavLink>
          <Link
            to="/logowanie"
            className="btn btn--primary btn--sm header__cta"
            onClick={() => setOpen(false)}
          >
            Zaloguj się
          </Link>
        </nav>
      </div>
    </header>
  )
}
