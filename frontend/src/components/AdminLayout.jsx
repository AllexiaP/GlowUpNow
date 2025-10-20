// AdminLayout.jsx — Wraps admin pages with sidebar and main content; handles sidebar collapsed state.
import React from 'react'
import AdminSidebar from './AdminSidebar'
import useLocalStorage from '../hooks/useLocalStorage'

export default function AdminLayout({ children }){
  const [collapsed, setCollapsed] = useLocalStorage('admin_sidebar_collapsed', false)
  return (
    <div className={`admin-layout ${collapsed ? 'admin-collapsed' : ''}`}>
      <AdminSidebar collapsed={collapsed} onToggle={()=> setCollapsed(v=>!v)} />
      <main className="admin-main">
        <div className="admin-content container-fluid py-3 py-md-4">{children}</div>
      </main>
    </div>
  )
}

