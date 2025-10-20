import React, { createContext, useContext, useEffect, useState } from 'react'
import { me as apiMe, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await apiMe()
        setUser(res.user || null)
      } catch { /* ignore */ }
      setLoading(false)
    })()
  }, [])

  const login = async (email, password) => {
    const res = await apiLogin(email, password)
    setUser(res.user)
    return res
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  const register = async (name, email, password) => {
    const res = await apiRegister(name, email, password)
    setUser(res.user)
    return res
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(){
  return useContext(AuthContext)
}
