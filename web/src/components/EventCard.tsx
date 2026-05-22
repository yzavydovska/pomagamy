import { Link } from 'react-router-dom'
import type { VolunteerEvent } from '../types'

type Props = { event: VolunteerEvent }

export function EventCard({ event }: Props) {
  return (
    <article className="card">
      <div className="card__top">
        <span className="badge">{event.category}</span>
        <span className="card__meta">{event.city}</span>
      </div>
      <h2 className="card__title">
        <Link to={`/wydarzenia/${event.id}`}>{event.title}</Link>
      </h2>
      <p className="card__org">{event.org}</p>
      <p className="card__date">{event.dateLabel}</p>
      <div className="card__footer">
        <span className="card__spots">
          {event.spotsLeft > 0
            ? `${event.spotsLeft} wolnych miejsc`
            : 'Brak miejsc'}
        </span>
        <Link to={`/wydarzenia/${event.id}`} className="btn btn--ghost btn--sm">
          Szczegóły
        </Link>
      </div>
    </article>
  )
}
