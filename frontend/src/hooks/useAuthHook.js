// useAuthHook — Derived auth state (isLoggedIn, isAdmin) from AuthContext.
import { useMemo } from 'react'
import { useAuthContext } from '../contexts/AuthContext'

export default function useAuthHook(){
  const { user, loading, login, logout, register } = useAuthContext()
  const isLoggedIn = !!user
  const isAdmin = !!user && user.role === 'admin'
  return useMemo(()=>({ user, loading, isLoggedIn, isAdmin, login, logout, register }), [user, loading, login, logout, register])
}

