export function ProfilePage() {
  return (
    <div className="page page--narrow">
      <h1 className="page__title">Twój profil</h1>
      <p className="page__subtitle">
        Tutaj pojawią się Twoje zgłoszenia, godziny i ulubione organizacje.
      </p>
      <div className="empty-state">
        <p className="empty-state__title">Zaloguj się, aby zobaczyć profil</p>
        <p className="empty-state__text">
          Po wdrożeniu uwierzytelniania ten ekran zapełni się danymi z konta.
        </p>
      </div>
    </div>
  )
}
