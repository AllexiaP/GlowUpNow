// analyticsService.js — Client wrappers for analytics endpoints (summary, coverage, bookings).
import { httpGet } from './http'

export async function getSummary(params={}){
  const q = new URLSearchParams(params).toString()
  return httpGet(`/api/analytics/summary${q?`?${q}`:''}`)
}

export async function getServiceCoverage(params={}){
  const q = new URLSearchParams(params).toString()
  return httpGet(`/api/analytics/services-coverage${q?`?${q}`:''}`)
}

export async function getRightJoinDemo(params={}){
  const q = new URLSearchParams(params).toString()
  return httpGet(`/api/analytics/right-join-demo${q?`?${q}`:''}`)
}

export async function getAnalyticsBookings(params={}){
  const q = new URLSearchParams(params).toString()
  return httpGet(`/api/analytics/bookings${q?`?${q}`:''}`)
}
