import { httpGet, httpPost } from './http'

export async function login(email, password){
  return httpPost('/api/auth/login', { email, password })
}
export async function logout(){
  return httpPost('/api/auth/logout')
}
export async function register(name, email, password){
  return httpPost('/api/auth/register', { name, email, password })
}
export async function me(){
  return httpGet('/api/auth/me')
}
