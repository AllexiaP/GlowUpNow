import React, { useEffect, useRef, useState } from 'react'
import BookingList from '../components/BookingList'
import { updateBookingStatus } from '../services/bookingService'

export default function BookingManagement(){
  const [statusId, setStatusId] = useState('')
  const [newStatus, setNewStatus] = useState('confirmed')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const formRef = useRef(null)
  const [idEditable, setIdEditable] = useState(false)
  const [currentStatus, setCurrentStatus] = useState('')
  const [toast, setToast] = useState({ type:'', msg:'' })

  const update = async ()=>{
    setMsg(''); setErr('')
    if (!statusId) { setErr('Please select a booking to update'); return }
    if (newStatus === currentStatus) {
      setMsg(`No changes. Status is already "${newStatus}".`)
      // clear form as requested when update is clicked without changes
      setStatusId(''); setNewStatus('confirmed'); setIdEditable(false)
      return
    }
    try{
      await updateBookingStatus({ id: Number(statusId), status: newStatus })
      setMsg('Status updated')
      setCurrentStatus(newStatus)
      // auto-clear form details after success
      setStatusId(''); setNewStatus('confirmed'); setIdEditable(false)
    }catch(e){ setErr(e.data?.error || 'Update failed') }
  }

  const scrollToForm = ()=>{
    if (formRef.current) { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  }
  const handleSelectForEdit = (booking)=>{
    const id = booking?.id
    const st = booking?.status || 'confirmed'
    setStatusId(String(id || ''))
    setNewStatus(st)
    setCurrentStatus(st)
    setIdEditable(true)
    setMsg(''); setErr('')
    scrollToForm()
  }

  const handleInteract = ()=>{ setMsg(''); setErr('') }

  useEffect(()=>{ if (msg) setToast({ type:'success', msg }) }, [msg])
  useEffect(()=>{ if (err) setToast({ type:'error', msg: err }) }, [err])

  return (
    <div className="container py-4">
      <h2 className="mb-3">Booking Management</h2>

      <div className="card p-3 mb-3" ref={formRef}>
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label" htmlFor="bm_booking_id">Booking ID</label>
            <input id="bm_booking_id" name="booking_id" className="form-control" value={statusId} disabled={!idEditable} onChange={e=>setStatusId(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); update() } }} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="bm_new_status">New Status</label>
            <select id="bm_new_status" name="new_status" className="form-select" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end gap-2">
            <button className="btn btn-primary" onClick={update} disabled={!statusId}>Update Status</button>
            <button className="btn btn-outline-secondary" onClick={()=>{ setStatusId(''); setNewStatus('confirmed'); setIdEditable(false); setMsg(''); setErr('') }}>Cancel</button>
          </div>
        </div>
      </div>

      <BookingList onSelect={handleSelectForEdit} onInteract={() => { handleInteract(); setToast({type:'', msg:''}) }} />

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
