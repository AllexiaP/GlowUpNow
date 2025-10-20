// AdminUsers.jsx — Admin: read-only list of users with search, pagination, and dense view toggle.
import React, { useMemo, useState } from 'react'
import { listUsers } from '../services/userService'
import { useFetch, useToggle } from '../hooks'

export default function AdminUsers(){
  const [page,setPage] = useState(1)
  const [perPage,setPerPage] = useState(10)
  const [q,setQ] = useState('')
  const [dense, toggleDense] = useToggle(false)

  const { data, loading, error } = useFetch(
    () => listUsers({ q, page, perPage }),
    [q, page, perPage],
    { immediate: true }
  )

  const rows = data?.rows || []
  const total = Number(data?.total || 0)
  const startIdx = (page-1)*perPage
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)

  return (
    <div className="container py-4">
      <h2 className="mb-3">User Management</h2>
      <div className="card p-3 mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-end">
          <div className="input-group" style={{maxWidth:360}}>
            <span className="input-group-text">Search</span>
            <input className="form-control" placeholder="name, email, role" value={q} onChange={e=>{ setPage(1); setQ(e.target.value) }} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); setPage(1) } }} />
          </div>
          <div>
            <label className="form-label">Per page</label>
            <select className="form-select" value={perPage} onChange={e=>{ setPage(1); setPerPage(Number(e.target.value)) }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <label className="form-label mb-0">Dense</label>
            <button className={`btn btn-sm ${dense?'btn-primary':'btn-outline-primary'}`} onClick={()=>toggleDense()} type="button">{dense?'On':'Off'}</button>
          </div>
        </div>
      </div>

      {loading && <div className="text-muted small mb-2">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-responsive">
          <table className={`table ${dense? 'table-sm':''} table-striped table-hover m-0`}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.length===0 ? (
                <tr><td colSpan={6} className="text-muted">No users found</td></tr>
              ) : rows.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="small text-muted">Showing {rows.length===0?0:(startIdx+1)}–{Math.min(startIdx+rows.length, total)} of {total}</div>
          <div className="btn-group" role="group">
            <button className="btn btn-outline-secondary btn-sm" disabled={safePage<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
            <span className="btn btn-outline-secondary btn-sm disabled">Page {safePage} / {totalPages}</span>
            <button className="btn btn-outline-secondary btn-sm" disabled={safePage>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
