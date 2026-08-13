import type { Ogloszenie } from './ogloszenie'

export type UserRole = 'volunteer' | 'organization'

export type StoredUser = {
  email: string
  password: string
  role: UserRole
  displayName: string
  phone: string
  
  publicId?: string
  organizationName?: string
  about?: string
  city?: string
  
  avatarUri?: string
  
  interests?: string[]
  
  orgVerificationStatus?: 'pending' | 'approved' | 'rejected'
  
  orgVerificationRejectionReason?: string
  
  orgNip?: string
  orgKrs?: string
  
  orgStatutLabel?: string
  
  orgStatutUrl?: string
  
  accountPublicId?: string
  
  accountSuspended?: boolean
}

export type ApplicationStatus = 'oczekujące' | 'zaakceptowane' | 'zakończone'

export type Application = {
  id: string
  
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
  
  refTargetId: string
  createdAt: string
  reporterEmail: string
  
  reporterUid?: string
  
  moderationStatus?: ComplaintModerationStatus
  
  moderatedAt?: string | null
}

export type MvpPersistedState = {
  applications: Application[]
  notifications: InAppNotification[]
  customOgloszenia: Ogloszenie[]
  complaints: Complaint[]
}
