import React, { useState } from 'react'
import { createBooking } from '../services/bookingService'

export default function BookingForm({ service, onSuccess }){
  const [date, setDate] = useState('')
  const [start, setStart] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const WORK_START = '09:00'
  const WORK_END = '18:00'
  const duration = Number(service?.duration_minutes || 60)

  const toSeconds = (hhmm) => {
    const [h,m] = (hhmm || '00:00').split(':').map(Number)
    return (h*3600) + (m*60)
  }
  const secondsToHHMM = (secs) => {
    const h = Math.floor(secs/3600).toString().padStart(2,'0')
    const m = Math.floor((secs%3600)/60).toString().padStart(2,'0')
    return `${h}:${m}`
  }
  const hhmmToHhmmss = (hhmm) => `${hhmm.length===5?hhmm:hhmm.slice(0,5)}:00`
  const maxStartHHMM = () => {
    const endSecs = toSeconds(WORK_END)
    const maxStartSecs = endSecs - (duration*60)
    return secondsToHHMM(Math.max(0, maxStartSecs))
  }

  const todayStr = () => new Date().toISOString().slice(0,10)

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      // Client-side validation for date/time
      if (!date || date < todayStr()) { throw new Error('Please pick today or a future date.') }
      const s = start
      const eSecs = toSeconds(s) + (duration*60)
      if (s < WORK_START || s > maxStartHHMM() || eSecs > toSeconds(WORK_END)) {
        throw new Error(`Please pick a time within working hours (${WORK_START}–${WORK_END}) that fits the service duration.`)
      }
      await createBooking({
        service_id: service.id,
        date,
        start_time: hhmmToHhmmss(s),
        notes
      })
      onSuccess && onSuccess()
    }catch(err){
      setError(err?.data?.error || err?.message || 'Booking failed')
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="card p-3 mt-3">
      <h5 className="mb-3">Book: {service.name}</h5>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="alert alert-info py-2">Accepting bookings: {WORK_START}–{WORK_END}</div>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label" htmlFor="bf_date">Date</label>
          <input id="bf_date" name="date" type="date" className="form-control" min={todayStr()} value={date} onChange={e=>setDate(e.target.value)} required />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="bf_start_time">Start Time</label>
          <input id="bf_start_time" name="start_time" type="time" className="form-control" step="60" min={WORK_START} max={maxStartHHMM()} value={start} onChange={e=>setStart(e.target.value.slice(0,5))} required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="bf_notes">Notes</label>
          <textarea id="bf_notes" name="notes" className="form-control" rows="2" value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
      </div>
      <div className="mt-3 text-end">
        <button disabled={loading} className="btn btn-primary" type="submit">{loading?'Booking...':'Confirm Booking'}</button>
      </div>
    </form>
  )
}
