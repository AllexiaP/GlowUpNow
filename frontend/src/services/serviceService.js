import { httpGet, httpPost, httpPut, httpDelete, httpPostForm } from './http'

export async function listServices(params = {}){
  const q = new URLSearchParams(params).toString()
  return httpGet(`/api/services${q ? `?${q}` : ''}`)
}
export async function createService(payload){
  return httpPost('/api/services', payload)
}
export async function updateService(payload){
  return httpPut('/api/services', payload)
}
export async function deleteService(id){
  return httpDelete('/api/services', { id })
}

// FormData versions (also used for updates when including files)
export async function createServiceForm(formData){
  // Controller will treat presence of `id` as update
  return httpPostForm('/api/services', formData)
}
