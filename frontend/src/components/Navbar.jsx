// Navbar.jsx — Top navigation; hides brand in admin area and shows responsive burger on non-admin small screens.
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuthContext()
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const inAdminArea = pathname.startsWith('/admin')
  return (
    <nav className={`navbar navbar-expand-lg ${isHome ? 'navbar-dark navbar-hero position-absolute top-0 start-0 w-100' : 'navbar-dark'}`}>
      <div className="container">
        {!(user && user.role === 'admin' && inAdminArea) && (
          <Link className="navbar-brand" to="/">GlowUpNow</Link>
        )}
        {!inAdminArea && (
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
            <span className="navbar-toggler-icon"></span>
          </button>
        )}
        <div className="collapse navbar-collapse" id="nav">
          <ul className={`navbar-nav ms-auto align-items-lg-center gap-2 ${isHome ? 'navbar-hero-links' : ''}`}>
            {!user && pathname !== '/login' && (
              <li className="nav-item"><Link className={`btn btn-login btn-sm`} to="/login">Login</Link></li>
            )}
            {user && (
              <>
                {user.role !== 'admin' && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/bookings">Bookings</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                  </>
                )}
                {user.role === 'admin' && inAdminArea && (
                  <></>
                )}
                {!(user.role === 'admin' && inAdminArea) && (
                  <li className="nav-item"><span className="nav-link disabled">Hi, {user.name}</span></li>
                )}
                {!(user.role === 'admin' && inAdminArea) && (
                  <li className="nav-item"><button className="btn btn-sm btn-light" onClick={logout}>Logout</button></li>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
