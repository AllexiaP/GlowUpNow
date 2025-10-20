import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { listBookings, cancelBooking, rescheduleBooking } from '../services/bookingService'
import BookingForm from '../components/BookingForm'
import { API } from '../services/http'
import useLocalStorage from '../hooks/useLocalStorage'
import useClickOutside from '../hooks/useClickOutside'

export default function Bookings(){
  const { user } = useAuthContext()
  const location = useLocation()
  const [selected, setSelected] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [resModalOpen, setResModalOpen] = useState(false)
  const [resId, setResId] = useState(null)
  const [resDate, setResDate] = useState('')
  const [resStart, setResStart] = useState('')
  const [resDuration, setResDuration] = useState(60)
  const [resLoading, setResLoading] = useState(false)
  const [resError, setResError] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelId, setCancelId] = useState(null)
  const [toast, setToast] = useState({ type:'', msg:'' })
  // Filters + pagination for "Your Bookings"
  const [fId, setFId] = useLocalStorage('bookings_fId','')
  const [fDate, setFDate] = useLocalStorage('bookings_fDate','')
  const [fTime, setFTime] = useLocalStorage('bookings_fTime','')
  const [fStatus, setFStatus] = useLocalStorage('bookings_fStatus','')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useLocalStorage('bookings_perPage',10)

  // Derived filtering + pagination for user's bookings
  const onInteract = ()=>{ setSuccessMsg(''); setError(''); setToast({type:'',msg:''}) }
  const onEnter = (e)=>{ if(e.key==='Enter'){ e.preventDefault(); setPage(1); onInteract() } }
  const filtered = useMemo(()=>{
    return bookings.filter(b => {
      if (fId!=='' && String(b.id)!==String(fId)) return false
      if (fDate && String(b.date)!==String(fDate)) return false
      if (fTime && !(String(b.start_time||'').startsWith(fTime) || String(b.end_time||'').startsWith(fTime))) return false
      if (fStatus && String(b.status)!==String(fStatus)) return false
      return true
    })
  }, [bookings, fId, fDate, fTime, fStatus])
  const totalPages = useMemo(()=> Math.max(1, Math.ceil(filtered.length / Number(perPage||10))), [filtered.length, perPage])
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * Number(perPage||10)
  const pageItems = useMemo(()=> filtered.slice(startIdx, startIdx + Number(perPage||10)), [filtered, startIdx, perPage])
  const clearFilters = ()=>{ setFId(''); setFDate(''); setFTime(''); setFStatus(''); setPerPage(10); setPage(1); onInteract() }

  const WORK_START = '09:00'
  const WORK_END = '18:00'
  const toSeconds = (hhmm) => {
    const [h,m] = (hhmm || '00:00').split(':').map(Number)
    return (h*3600) + (m*60)
  }
  const secondsToHHMM = (secs) => {
    const h = Math.floor(secs/3600).toString().padStart(2,'0')
    const m = Math.floor((secs%3600)/60).toString().padStart(2,'0')
    return `${h}:${m}`
  }
  const maxStartHHMM = () => {
    const endSecs = toSeconds(WORK_END)
    const maxStartSecs = endSecs - (Number(resDuration||60)*60)
    return secondsToHHMM(Math.max(0, maxStartSecs))
  }
  const todayStr = () => new Date().toISOString().slice(0,10)

  useEffect(()=>{
    if (location.state && location.state.selected) {
      setSelected(location.state.selected)
    }
  }, [location.state])

  const loadBookings = async ()=>{
    if (!user) return
    setBookingsLoading(true); setError('')
    try{
      const res = await listBookings({ user_id: user.id })
      const rows = Array.isArray(res) ? res : (res?.data || [])
      setBookings(rows)
    }catch(e){ setError('Failed to load your bookings') }
    finally{ setBookingsLoading(false) }
  }

  useEffect(()=>{ loadBookings() }, [user])

  // SSE: real-time updates to user's bookings list
  useEffect(()=>{
    if (!user) return
    let es
    try{
      const url = `${API}/api/stream/bookings`
      es = new EventSource(url, { withCredentials: true })
    }catch(e){ console.warn('SSE unavailable', e); return }

    const handleUpsertById = async (id)=>{
      try{
        const res = await listBookings({ id })
        const rows = Array.isArray(res) ? res : (res?.data || [])
        if (rows.length===0) return
        const row = rows[0]
        if (row.user_id !== user.id) return
        setBookings(prev => {
          const idx = prev.findIndex(b => b.id === row.id)
          if (idx >= 0) {
            const next = prev.slice()
            next[idx] = { ...prev[idx], ...row }
            return next
          }
          return [row, ...prev]
        })
      }catch(err){ /* ignore */ }
    }

    es.addEventListener('status_changed', (ev)=>{
      try{ const payload = JSON.parse(ev.data); if (payload?.id) handleUpsertById(payload.id) }catch{ /* ignore */ }
    })
    es.addEventListener('created', (ev)=>{
      try{ const payload = JSON.parse(ev.data); if (payload?.id) handleUpsertById(payload.id) }catch{ /* ignore */ }
    })
    es.addEventListener('ping', ()=>{})
    es.onerror = ()=>{ try{ es && es.close() }catch{} }
    return ()=>{ try{ es && es.close() }catch{} }
  }, [user])

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Bookings</h3>
      </div>

      {error && <div className="text-muted small mb-2">{error}</div>}

      {selected ? (
        <BookingForm
          service={selected}
          onSuccess={async () => {
            setSelected(null)
            await loadBookings()
            setSuccessMsg('Booking created successfully!')
            setTimeout(()=>setSuccessMsg(''), 3000)
          }}
        />
      ) : (
        <div className="text-muted">Select a service from your Dashboard to start booking.</div>
      )}

      {successMsg && <div className="text-muted small mt-3">{successMsg}</div>}

      <div className="mt-4">
        <h4>Your Bookings</h4>
        <div className="card p-3 mb-3" style={{ position:'sticky', top:8, zIndex:10 }}>
          <div className="row g-2 align-items-end">
            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label">#</label>
              <input type="number" className="form-control" value={fId} onChange={e=>{ setFId(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} />
            </div>
            <div className="col-6 col-md-3 col-lg-4">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={fDate} onChange={e=>{ setFDate(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} />
            </div>
            <div className="col-6 col-md-3 col-lg-4">
              <label className="form-label">Time</label>
              <input type="time" className="form-control" value={fTime} onChange={e=>{ setFTime(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} />
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label">Status</label>
              <select className="form-select" value={fStatus} onChange={e=>{ setFStatus(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="canceled">Canceled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="row g-2 align-items-end mt-0">
            <div className="col-6 col-md-3 col-lg-3">
              <label className="form-label">Per page</label>
              <select className="form-select" value={perPage} onChange={e=>{ setPerPage(Number(e.target.value)); setPage(1); onInteract() }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="col-12 col-lg-9 d-flex justify-content-lg-end gap-2">
              <button className="btn btn-outline-secondary" onClick={()=>{ setPage(1); onInteract() }}>Search</button>
              <button className="btn btn-outline-primary" onClick={clearFilters}>Clear</button>
            </div>
          </div>
        </div>
        {bookingsLoading && <div className="text-muted small">Loading bookings...</div>}
        {(!bookingsLoading && bookings.length===0) && <div className="text-muted">You have no bookings yet.</div>}
        {filtered.length===0 && !bookingsLoading ? (
          <div className="text-muted">No results matched your filters.</div>
        ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr><th>#</th><th>Date</th><th>Time</th><th>Service</th><th>Status</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {pageItems.map(b => (
                <tr key={b.id} onDoubleClick={()=>{ setResId(b.id); setResDate(b.date); setResStart((b.start_time||'').slice(0,5)); setResDuration(Number(b.duration_minutes||60)); setResError(''); setResModalOpen(true) }}>
                  <td>{b.id}</td>
                  <td>{b.date}</td>
                  <td>{b.start_time} - {b.end_time}</td>
                  <td>{b.service_name}</td>
                  <td><span className={`badge text-bg-${b.status==='confirmed'?'success':b.status==='pending'?'warning':b.status==='canceled'?'danger':'secondary'}`}>{b.status}</span></td>
                  <td className="text-end">
                    {(b.status==='pending' && (Number(b.reschedule_count||0) < 1 || Number(b.cancel_count||0) < 1)) && (
                      <>
                        {Number(b.reschedule_count||0) < 1 && (
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>{ setResId(b.id); setResDate(b.date); setResStart((b.start_time||'').slice(0,5)); setResDuration(Number(b.duration_minutes||60)); setResError(''); setResModalOpen(true) }}>Edit</button>
                        )}
                        {Number(b.cancel_count||0) < 1 && (
                        <button className="btn btn-sm btn-outline-danger" onClick={()=>{ setCancelId(b.id); setCancelModalOpen(true) }}>Cancel</button>
                        )}
                      </>
                    )}
                    {(b.status==='confirmed' && Number(b.cancel_count||0) < 1) && (
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>{ setCancelId(b.id); setCancelModalOpen(true) }}>Cancel</button>
                    )}
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
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={safePage<=1} onClick={()=>{ onInteract(); setPage(p=>Math.max(1, p-1)) }}>Prev</button>
            <span className="btn btn-outline-secondary btn-sm disabled">Page {safePage} / {totalPages}</span>
            <button type="button" className="btn btn-outline-secondary btn-sm" disabled={safePage>=totalPages} onClick={()=>{ onInteract(); setPage(p=>Math.min(totalPages, p+1)) }}>Next</button>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cancel booking</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={()=>{ if(!bookingsLoading){ setCancelModalOpen(false); setCancelId(null) } }}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to cancel booking #{cancelId}?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>{ if(!bookingsLoading){ setCancelModalOpen(false); setCancelId(null) } }}>Close</button>
                  <button type="button" className="btn btn-danger" disabled={bookingsLoading} onClick={async()=>{
                    const id = cancelId
                    setCancelModalOpen(false); setCancelId(null)
                    try{
                      setBookingsLoading(true)
                      await cancelBooking(id)
                      const res = await listBookings({ user_id: user.id })
                      const rows = Array.isArray(res) ? res : (res?.data || [])
                      setBookings(rows)
                      setToast({ type:'success', msg:'Booking canceled' })
                    }catch(e){ setToast({ type:'error', msg: (e && e.message) || 'Cancel failed' }) }
                    finally{ setBookingsLoading(false) }
                  }}>Cancel booking</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {resModalOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reschedule Booking #{resId}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={()=>{ if(!resLoading){ setResModalOpen(false) } }} />
              </div>
              <div className="modal-body">
                {resError && <div className="alert alert-danger">{resError}</div>}
                <div className="alert alert-info py-2">Accepting bookings: {WORK_START}–{WORK_END}</div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="res_date">Date</label>
                  <input id="res_date" name="date" type="date" className="form-control" min={todayStr()} value={resDate} onChange={e=>setResDate(e.target.value)} />
                </div>
                <div className="mb-2">
                  <label className="form-label" htmlFor="res_start_time">Start Time</label>
                  <input id="res_start_time" name="start_time" type="time" className="form-control" step="60" min={WORK_START} max={maxStartHHMM()} value={resStart} onChange={e=>setResStart((e.target.value||'').slice(0,5))} />
                </div>
                <div className="text-muted small">Note: Only pending bookings can be rescheduled.</div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>{ if(!resLoading){ setResModalOpen(false) } }}>Close</button>
                <button type="button" className="btn btn-primary" disabled={resLoading} onClick={async()=>{
                  const id = resId; const date = resDate; const s = resStart; const dur = Number(resDuration||60)
                  setResModalOpen(false)
                  setResLoading(true); setResError('')
                  try{
                    // Client validation
                    if (!date || date < todayStr()) { throw new Error('Please pick today or a future date.') }
                    const eSecs = toSeconds(s) + (dur*60)
                    if (s < WORK_START || s > maxStartHHMM() || eSecs > toSeconds(WORK_END)) {
                      throw new Error(`Please pick a time within working hours (${WORK_START}–${WORK_END}) that fits the service duration.`)
                    }
                    await rescheduleBooking({ id, date, start_time: `${s}:00` })
                    // refresh list
                    const res = await listBookings({ user_id: user.id })
                    const rows = Array.isArray(res) ? res : (res?.data || [])
                    setBookings(rows)
                    setToast({ type:'success', msg:'Booking rescheduled' })
                  }catch(e){ setToast({ type:'error', msg: (e && e.message) || 'Reschedule failed' }) }
                  finally{ setResLoading(false) }
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div style={{position:'fixed', right:16, bottom:16, zIndex:9999}}>
        {toast.msg && (
          <div className={`toast align-items-center text-white ${toast.type==='error'?'bg-danger':'bg-success'} show`} role="alert">
            <div className="d-flex">
              <div className="toast-body">{toast.msg}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={()=>setToast({type:'',msg:''})}></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
