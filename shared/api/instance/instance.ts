import axios from 'axios'
import { useAccountStore } from '@/store/useAccountStore'

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STORYNATION_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Web-Access': true,
  },
  withCredentials: false,
})

instance.interceptors.request.use((config) => {
  const token = useAccountStore.getState().data?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { instance }
