import { EventCard } from '../components/EventCard'
import { events } from '../data/events'

export function EventsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Wydarzenia</h1>
        <p className="page__subtitle">
          Wybierz akcję dopasowaną do Twoich możliwości — czas, miejsce i temat.
        </p>
      </header>
      <div className="grid grid--2">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </div>
  )
}
