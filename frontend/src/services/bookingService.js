import { httpGet, httpPost, httpPut, httpDelete } from './http'

export async function listBookings(params = {}){
  const q = new URLSearchParams(params).toString()
  return httpGet(`/api/bookings${q ? `?${q}` : ''}`)
}
export async function createBooking(payload){
  return httpPost('/api/bookings', payload)
}
export async function updateBooking(payload){
  return httpPut('/api/bookings', payload)
}
export async function updateBookingStatus(payload){
  const { httpPatch } = await import('./http')
  return httpPatch('/api/bookings/status', payload)
}
export async function rescheduleBooking(payload){
  const { httpPatch } = await import('./http')
  return httpPatch('/api/bookings/reschedule', payload)
}
export async function deleteBooking(id){
  return httpDelete('/api/bookings', { id })
}
export async function cancelBooking(id){
  return updateBookingStatus({ id, status: 'canceled' })
}
