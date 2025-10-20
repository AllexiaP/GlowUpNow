import React, { useEffect, useState } from 'react'
import { getMe, updateMe } from '../services/userService'

export default function UserProfile(){
  const [form,setForm] = useState({ name:'', email:'', phone:'' })
  const [loading,setLoading] = useState(false)
  const [msg,setMsg] = useState('')
  const [err,setErr] = useState('')
  const [initial,setInitial] = useState({ name:'', phone:'' })

  useEffect(()=>{
    (async()=>{
      try{
        const res = await getMe()
        if(res.user){
          const next = { name: res.user.name||'', email: res.user.email||'', phone: res.user.phone||'' }
          setForm(next)
          setInitial({ name: next.name||'', phone: next.phone||'' })
        }
      }catch(e){ setErr('Failed to load profile') }
    })()
  },[])

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true); setMsg(''); setErr('')
    try{
      const current = { name: form.name||'', phone: form.phone||'' }
      if (current.name === (initial.name||'') && (current.phone||'') === (initial.phone||'')) {
        setMsg('No changes')
        return
      }
      await updateMe({ name: current.name, phone: current.phone })
      setInitial(current)
      setMsg('Profile updated')
    }catch(e){ setErr('Update failed') }
    finally{ setLoading(false) }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-3">My Profile</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={submit} className="card p-3">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="profile_name">Name</label>
            <input id="profile_name" name="name" className="form-control" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onFocus={()=>{}} onBlur={()=>{}} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="profile_email">Email</label>
            <input id="profile_email" name="email" type="email" className="form-control" value={form.email} disabled />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="profile_phone">Phone</label>
            <input id="profile_phone" name="phone" className="form-control" value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
          </div>
        </div>
        <div className="text-end mt-3">
          <button className="btn btn-primary" disabled={loading} type="submit">Save</button>
        </div>
      </form>
    </div>
  )
}
