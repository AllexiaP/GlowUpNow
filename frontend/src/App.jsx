import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ServiceManagement from './pages/ServiceManagement'
import BookingManagement from './pages/BookingManagement'
import UserProfile from './pages/UserProfile'
import AdminLayout from './components/AdminLayout'
import SiteFooter from './components/SiteFooter'
import Bookings from './pages/Bookings'
import ProtectedRoute from './components/ProtectedRoute'
import UserDashboard from './pages/UserDashboard'
import AdminUsers from './pages/AdminUsers'

function App(){
  return (
    <div className="app-shell d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-fill">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute role="customer">
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute role="customer">
              <Bookings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <ServiceManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <BookingManagement />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}

export default App
