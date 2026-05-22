import { Link, useParams } from 'react-router-dom'
import { getEventById } from '../data/events'

export function EventDetailPage() {
  const { id } = useParams()
  const event = id ? getEventById(id) : undefined

  if (!event) {
    return (
      <div className="page">
        <p>Nie znaleziono wydarzenia.</p>
        <Link to="/wydarzenia" className="link-arrow">
          Wróć do listy
        </Link>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <Link to="/wydarzenia" className="back-link">
        ← Wszystkie wydarzenia
      </Link>
      <header className="detail">
        <span className="badge">{event.category}</span>
        <h1 className="detail__title">{event.title}</h1>
        <p className="detail__org">{event.org}</p>
        <ul className="detail__facts">
          <li>
            <strong>Data</strong> {event.dateLabel}
          </li>
          <li>
            <strong>Miejsce</strong> {event.city}
          </li>
          <li>
            <strong>Czas</strong> ok. {event.durationHours} h
          </li>
          <li>
            <strong>Miejsca</strong>{' '}
            {event.spotsLeft > 0 ? `${event.spotsLeft} wolnych` : 'lista zamknięta'}
          </li>
        </ul>
      </header>
      <section className="prose">
        <h2>Opis</h2>
        <p>{event.description}</p>
      </section>
      <div className="detail__actions">
        <button type="button" className="btn btn--primary btn--lg" disabled>
          Zapisz się (wkrótce)
        </button>
        <p className="hint">Integracja z backendem — kolejny krok projektu.</p>
      </div>
    </div>
  )
}
