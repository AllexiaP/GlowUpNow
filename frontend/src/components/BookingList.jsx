import React, { useEffect, useMemo, useState } from 'react'
import { listBookings } from '../services/bookingService'

export default function BookingList({ onSelect, onInteract }){
  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  // Filters
  const [fId, setFId] = useState('')
  const [fDate, setFDate] = useState('')
  const [fTime, setFTime] = useState('')
  const [fCustomer, setFCustomer] = useState('')
  const [fService, setFService] = useState('')
  const [fStatus, setFStatus] = useState('')
  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const load = async ()=>{
    setLoading(true); setError('')
    try{
      const res = await listBookings({ status: fStatus })
      const rows = res.data || []
      setItems(rows)
    }catch(e){ setError('Failed to load bookings') }
    finally{ setLoading(false) }
  }
  useEffect(()=>{ load() },[fStatus])

  const filtered = useMemo(()=>{
    return items.filter(b => {
      if (fId !== '' && String(b.id) !== String(fId)) return false
      if (fDate && String(b.date) !== String(fDate)) return false
      if (fTime && !(String(b.start_time||'').startsWith(fTime) || String(b.end_time||'').startsWith(fTime))) return false
      if (fCustomer && !String(b.customer_name||'').toLowerCase().includes(fCustomer.toLowerCase())) return false
      if (fService && !String(b.service_name||'').toLowerCase().includes(fService.toLowerCase())) return false
      return true
    })
  }, [items, fId, fDate, fTime, fCustomer, fService])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * perPage
  const pageItems = filtered.slice(startIdx, startIdx + perPage)

  const fireInteract = ()=>{ if (onInteract) onInteract() }
  const clearFilters = ()=>{
    setFId(''); setFDate(''); setFTime(''); setFCustomer(''); setFService(''); setFStatus(''); setPerPage(10); setPage(1); fireInteract(); load()
  }
  const onEnter = (e)=>{ if(e.key==='Enter'){ e.preventDefault(); setPage(1); fireInteract() } }

  return (
    <div>
      <div className="card p-3 mb-3" style={{ position:'sticky', top:8, zIndex:10 }}>
        <div className="row g-3 align-items-end">
          {/* Row 1: #, Date, Time, Customer, Service (2+2+2+3+3 = 12 on lg) */}
          <div className="col-6 col-md-3 col-lg-2">
            <label className="form-label">#</label>
            <input type="number" className="form-control" value={fId} onChange={e=>{ setFId(e.target.value); setPage(1); fireInteract() }} onKeyDown={onEnter} />
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={fDate} onChange={e=>{ setFDate(e.target.value); setPage(1); fireInteract() }} onKeyDown={onEnter} />
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <label className="form-label">Time</label>
            <input type="time" className="form-control" value={fTime} onChange={e=>{ setFTime(e.target.value); setPage(1); fireInteract() }} onKeyDown={onEnter} />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">Customer</label>
            <input className="form-control" value={fCustomer} onChange={e=>{ setFCustomer(e.target.value); setPage(1); fireInteract() }} onKeyDown={onEnter} placeholder="Name" />
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">Service</label>
            <input className="form-control" value={fService} onChange={e=>{ setFService(e.target.value); setPage(1); fireInteract() }} onKeyDown={onEnter} placeholder="Service" />
          </div>
          {/* Row 2: Status, Per page, Clear (2+2+8) */}
          <div className="col-6 col-md-3 col-lg-2">
            <label className="form-label">Status</label>
            <select className="form-select" value={fStatus} onChange={e=>{ setFStatus(e.target.value); setPage(1); fireInteract() }} onKeyDown={onEnter}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <label className="form-label">Per page</label>
            <select className="form-select" value={perPage} onChange={e=>{ setPerPage(Number(e.target.value)); setPage(1); fireInteract() }} onKeyDown={onEnter}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="col-12 col-lg-8 d-flex justify-content-lg-end align-items-end">
            <button className="btn btn-outline-primary" type="button" onClick={clearFilters}>Clear search/filters</button>
          </div>
        </div>
      </div>

      {loading && <div className="text-muted small mb-2">Loading...</div>}
      {filtered.length === 0 && !loading ? (
        <div className="text-muted">No results matched your filters.</div>
      ) : (
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(b=> (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.date}</td>
                <td>{b.start_time} - {b.end_time}</td>
                <td>{b.customer_name}</td>
                <td>{b.service_name}</td>
                <td><span className={`badge text-bg-${b.status==='confirmed'?'success':b.status==='pending'?'warning':b.status==='canceled'?'danger':'secondary'}`}>{b.status}</span></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=> onSelect && onSelect(b)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="small text-muted">Showing {filtered.length === 0 ? 0 : (startIdx+1)}–{Math.min(startIdx+perPage, filtered.length)} of {filtered.length}</div>
        <div className="btn-group" role="group" aria-label="Pagination">
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={safePage<=1} onClick={()=>{ fireInteract(); setPage(p=>Math.max(1, p-1)) }}>Prev</button>
          <span className="btn btn-outline-secondary btn-sm disabled">Page {safePage} / {totalPages}</span>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={safePage>=totalPages} onClick={()=>{ fireInteract(); setPage(p=>Math.min(totalPages, p+1)) }}>Next</button>
        </div>
      </div>
    </div>
  )
}
