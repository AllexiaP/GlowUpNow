// AdminSidebar.jsx — Left navigation for admin area with collapse toggle and tooltips.
import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

function IconDashboard(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="3" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="13" y="10" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>)
}
function IconServices(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2 5h5l-4 3 1 6-5-3-5 3 1-6-4-3h5l2-5z" stroke="currentColor" strokeWidth="1" fill="none"/></svg>)
}
function IconBookings(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10h10M7 14h4M3 6h18M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>)
}
function IconUsers(){
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11a4 4 0 1 0-8 0" stroke="currentColor" strokeWidth="1.2"/><path d="M3 20a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>)
}

export default function AdminSidebar({ collapsed=false, onToggle }){
  const navigate = useNavigate()
  const { logout } = useAuthContext()
  return (
    <aside className="admin-sidebar" aria-label="Admin sidebar">
      <div className="admin-sidebar-inner d-flex flex-column" style={{height: '100vh', padding: '1rem 0'}}>
        <div className="px-3 mb-4 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-title text-white fw-bold d-none d-md-block">GlowUpNow</div>
          </div>
          <button type="button" className="btn btn-sm btn-outline-light sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </div>

        <nav className="nav flex-column px-2" style={{gap:8}}>
          <NavLink to="/admin/dashboard" title="Dashboard" className={({isActive})=>`admin-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`}>
            <IconDashboard />
            <span className="link-label">Dashboard</span>
          </NavLink>
          <NavLink to="/admin/services" title="Services" className={({isActive})=>`admin-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`}>
            <IconServices />
            <span className="link-label">Services</span>
          </NavLink>
          <NavLink to="/admin/bookings" title="Bookings" className={({isActive})=>`admin-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`}>
            <IconBookings />
            <span className="link-label">Bookings</span>
          </NavLink>
          <NavLink to="/admin/users" title="Users" className={({isActive})=>`admin-link d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'active' : ''}`}>
            <IconUsers />
            <span className="link-label">Users</span>
          </NavLink>
          <button className="admin-link d-flex align-items-center gap-2 px-3 py-2 btn btn-link text-start" onClick={async()=>{ try{ await logout(); navigate('/login', { replace: true }) }catch(e){ navigate('/login', { replace: true }) } }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 4v16a2 2 0 0 1-2 2h-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="link-label">Logout</span>
          </button>
        </nav>

        <div className="mt-auto px-3 pb-3 text-white small">Signed in as Admin</div>
      </div>
    </aside>
  )
}

