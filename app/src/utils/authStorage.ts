export type AuthUser = Record<string, unknown>

export function saveAuth(token: string, user: AuthUser, rememberMe: boolean) {
  const persistentStorage = rememberMe ? localStorage : sessionStorage
  const temporaryStorage = rememberMe ? sessionStorage : localStorage

  temporaryStorage.removeItem('token')
  temporaryStorage.removeItem('user')
  persistentStorage.setItem('token', token)
  persistentStorage.setItem('user', JSON.stringify(user))
}

export function getAuthToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export function getAuthUser() {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}
