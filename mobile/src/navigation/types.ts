export type HomeStackParamList = {
  OgloszeniaList: undefined
  OgloszenieDetail: { id: string }
}

export type OrgStackParamList = {
  OrgOgloszeniaList: undefined
  OrgOgloszenieApplicants: { id: string }
  OrgNewOgloszenie: undefined
}

export type MainTabParamList = {
  OgloszeniaTab: undefined
  Wiadomosci: undefined
  Profil: undefined
}

export type AdminTabParamList = {
  AdminDashboard: undefined
  AdminWeryfikacjaOrg: undefined
  AdminSkargi: undefined
}

export type AdminOrgVerificationStackParamList = {
  AdminOrgList: undefined
  AdminOrgDetail: { id: string }
}

export type AdminComplaintDetailParams =
  | { mode: 'firebase'; complaintId: string }
  | { mode: 'mock'; mockId: string }

export type AdminMainStackParamList = {
  AdminTabsHome: undefined
  AdminComplaintDetail: AdminComplaintDetailParams
}

export type RootStackParamList = {
  Welcome: undefined
  AdminLogin: undefined
  AdminMain: undefined
  Login: undefined
  ForgotPassword: undefined
  Register: undefined
  Main: undefined
  EditProfile: undefined
  ReportComplaint: { ogloszenieKod?: string; refTargetId?: string }
}
