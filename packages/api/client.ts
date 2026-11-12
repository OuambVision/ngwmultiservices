import axios from 'axios'

/** Payload REST base URL. Includes `/api`, no trailing slash. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_PAYLOAD_API_URL ||
  'http://localhost:3000/api'

/** Origin of the Payload server, without `/api`. */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
