// http.js — HTTP helpers for API base and JSON/form requests.
export const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost/glowupnow/backend/public'

export async function httpGet(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json', ...(opts.headers || {}) },
  })
  return handle(res)
}

export async function httpPost(path, body = {}, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
  })
  return handle(res)
}

export async function httpPut(path, body = {}, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
  })
  return handle(res)
}

export async function httpPostForm(path, formData, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...(opts.headers || {}) },
    body: formData,
  })
  return handle(res)
}

export async function httpPutForm(path, formData, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { ...(opts.headers || {}) },
    body: formData,
  })
  return handle(res)
}

export async function httpPatch(path, body = {}, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
  })
  return handle(res)
}

export async function httpDelete(path, body = null, opts = {}) {
  const hasBody = body !== null && body !== undefined
  const res = await fetch(`${API}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: hasBody ? { 'Content-Type': 'application/json', ...(opts.headers || {}) } : { ...(opts.headers || {}) },
    body: hasBody ? JSON.stringify(body) : undefined,
  })
  return handle(res)
}

async function handle(res) {
  const text = await res.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { /* non-JSON response */ }
  }
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || text || 'Request failed'
    const err = new Error(message)
    err.status = res.status
    err.data = data
    err.raw = text
    throw err
  }
  return data
}
