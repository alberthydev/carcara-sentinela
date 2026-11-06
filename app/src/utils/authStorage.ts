export type AuthUser = Record<string, unknown> & {
  id?: string
  _id?: string
  nome?: string
  tipo?: string
}

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
  if (!user) return null
  try {
    return JSON.parse(user) as AuthUser
  } catch {
    clearAuth()
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
}

export function updateAuthUser(user: AuthUser) {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage
  storage.setItem('user', JSON.stringify(user))
}
