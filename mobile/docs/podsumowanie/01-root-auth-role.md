# 01 — Nawigacja główna, auth i rola administratora (`RootNavigator`)

- Start aplikacji: po starcie ustawiane jest pola `initialRoute`: **panel admina** (`AdminMain`) tylko gdy Firebase ma zalogowanego użytkownika z `users/{uid}.role == "admin"`; w przeciwnym razie przy aktywnej sesji **`Main`**; bez sesji **`Welcome`**.
- W trybie **bez Firebase**: wejście do panelu admina opiera się na lokalnym `adminSession` (mock / szkoleniowy przepływ); nie miesza się z `FirebaseAuth`.
- Widoczne trasy korzenia: **`Welcome`**, **`AdminLogin`**, **`AdminMain`**, **`Login`**, **`ForgotPassword`**, **`Register`**, **`Main`**, **`EditProfile`**, **`ReportComplaint`**.
- **`AuthBlockingOverlay`** — pełnoekranowa blokada z komunikatem podczas operacji uwierzytelniania (bez „zgubienia” interfejsu).
- **`fetchUserRole` + `onAuthStateChanged`** — określenie, czy zalogowany użytkownik ma wejść prosto do kokpitu moderatora przy starcie aplikacji.
