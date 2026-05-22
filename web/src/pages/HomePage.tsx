import { Link } from 'react-router-dom'
import { events } from '../data/events'
import { EventCard } from '../components/EventCard'

export function HomePage() {
  const featured = events.slice(0, 3)

  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Dobry wolontariat zaczyna się od jednego kroku</p>
          <h1 className="hero__title">Znajdź akcję w swojej okolicy i pomóż tam, gdzie jest potrzeba</h1>
          <p className="hero__lead">
            Przeglądaj wydarzenia, zapisuj się na zmiany i śledź swój wkład — w jednym miejscu.
          </p>
          <div className="hero__actions">
            <Link to="/wydarzenia" className="btn btn--primary btn--lg">
              Przeglądaj wydarzenia
            </Link>
            <Link to="/logowanie" className="btn btn--secondary btn--lg">
              Załóż konto
            </Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden>
          <div className="hero__blob" />
        </div>
      </section>

      <section className="section section--stats">
        <div className="stats">
          <div className="stat">
            <span className="stat__value">120+</span>
            <span className="stat__label">aktywnych wolontariuszy</span>
          </div>
          <div className="stat">
            <span className="stat__value">45</span>
            <span className="stat__label">organizacji partnerskich</span>
          </div>
          <div className="stat">
            <span className="stat__value">2.4k</span>
            <span className="stat__label">przepracowanych godzin w roku</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Wyróżnione wydarzenia</h2>
          <Link to="/wydarzenia" className="link-arrow">
            Zobacz wszystkie
          </Link>
        </div>
        <div className="grid grid--3">
          {featured.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </>
  )
}
