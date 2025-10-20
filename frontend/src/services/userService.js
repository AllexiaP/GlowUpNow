// userService.js — Authenticated user profile and admin user listing helpers.
import { httpGet, httpPut } from './http'

export async function getMe(){
  return httpGet('/api/auth/me')
}

export async function updateMe(payload){
  return httpPut('/api/users', payload)
}

// Admin: list all users (supports ?q=&page=&perPage=)
export async function listUsers(params){
  const qs = new URLSearchParams(params || {}).toString();
  return httpGet('/api/admin/users' + (qs ? ('?' + qs) : ''));
}

// Admin: update user (role, name, phone)
export async function updateUser(payload){
  return httpPut('/api/admin/users', payload);
}

// Admin: delete user
export async function deleteUser(id){
  return fetch('/api/admin/users?id=' + encodeURIComponent(id), {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  }).then(r=>r.json());
}
