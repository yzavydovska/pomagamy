import type { Ogloszenie } from './ogloszenie'

export type UserRole = 'volunteer' | 'organization'

export type StoredUser = {
  email: string
  password: string
  role: UserRole
  displayName: string
  phone: string
  /** Unikalny identyfikator konta (np. W-…, O-…); przy Firebase wyliczany z UID, lokalnie zapisany w rejestrze */
  publicId?: string
  organizationName?: string
  about?: string
  city?: string
  /** URL zdjęcia / logo profilu (file:// lokalnie lub https z Firebase Storage) */
  avatarUri?: string
  /** Wolontariusz — tagi zainteresowań (np. z VOLUNTEER_INTEREST_OPTIONS) */
  interests?: string[]
  /** Organizacja: stan weryfikacji przez admina (Firebase + tryb lokalny). */
  orgVerificationStatus?: 'pending' | 'approved' | 'rejected'
  /**
   * Organizacja: powód odrzucenia weryfikacji (`organizations.verificationRejectionReason` w Firebase).
   * Pusty lub brak — po zatwierdzeniu lub ponownym zgłoszeniu do kolejki.
   */
  orgVerificationRejectionReason?: string
  /** Tryb lokalny — dane z rejestracji do podglądu przez admina. */
  orgNip?: string
  orgKrs?: string
  /** Nazwa przesłanego pliku statutu (bez URL w trybie lokalnym). */
  orgStatutLabel?: string
  /** Zapisywane w Firestore przy rejestracji lub aktualizacji profilu — numer konta jak publicId (W-/O-). */
  accountPublicId?: string
  /** Ustawiane przez admina — konto nie może się zalogować (Firestore + blokada przy logowaniu). */
  accountSuspended?: boolean
}

export type ApplicationStatus = 'oczekujące' | 'zaakceptowane' | 'zakończone'

export type Application = {
  id: string
  /** Unikalny numer zgłoszenia (np. Z-123456) — podawany w skardze */
  publicId?: string
  ogloszenieId: string
  ogloszenieTitle: string
  organizerName: string
  volunteerEmail: string
  volunteerName: string
  status: ApplicationStatus
  createdAt: string
  volunteerUid?: string
  organizerUid?: string
}

export type InAppNotification = {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
  applicationId?: string
}

export type ComplaintModerationStatus = 'pending' | 'resolved' | 'rejected'

export type Complaint = {
  id: string
  category: string
  description: string
  /** Identyfikator celu skargi: W- / O- (konto), Z- (zgłoszenie do ogłoszenia), OG- (ogłoszenie), ORG- (rekord organizacji w panelu) */
  refTargetId: string
  createdAt: string
  reporterEmail: string
  /** Firebase — do reguł i zapytań */
  reporterUid?: string
  /** Moderacja przez admina (Firestore). Brak = traktuj jak «pending». */
  moderationStatus?: ComplaintModerationStatus
  /** ISO — kiedy admin zmienił status. */
  moderatedAt?: string | null
}

export type MvpPersistedState = {
  applications: Application[]
  notifications: InAppNotification[]
  customOgloszenia: Ogloszenie[]
  complaints: Complaint[]
}
