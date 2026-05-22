import { Link } from 'react-router-dom'

export function AppFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__copy">© {new Date().getFullYear()} Wolontariat — aplikacja demonstracyjna</p>
        <div className="footer__links">
          <a href="#regulamin">Regulamin</a>
          <a href="#prywatnosc">Polityka prywatności</a>
          <Link to="/logowanie">Dla organizacji</Link>
        </div>
      </div>
    </footer>
  )
}
