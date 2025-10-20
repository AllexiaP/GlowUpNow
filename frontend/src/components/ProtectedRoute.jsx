import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role }){
  const { user, loading } = useAuthContext()
  if (loading) return <div className="container py-4"><div className="alert alert-info">Loading...</div></div>
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) {
    const target = user.role === 'admin' ? '/admin/dashboard' : '/dashboard'
    return <Navigate to={target} replace />
  }
  return children
}
