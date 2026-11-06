import { clearAuth, getAuthToken } from './authStorage'

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && token !== 'undefined' && token !== 'null') {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    clearAuth()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }

  return response
}
