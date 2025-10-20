import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'

export default function Login(){
  const { login, register, user, loading } = useAuthContext()
  const nav = useNavigate()
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [name,setName] = useState('')
  const [mode, setMode] = useState('login')
  const [error,setError] = useState('')
  const [submitting,setSubmitting] = useState(false)

  const onSubmit = async (e)=>{
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try{
      if(mode==='login'){
        await login(email,password)
      }else{
        await register(name,email,password)
      }
      nav('/')
    }catch(err){
      if (err.status === 422 && err.data?.errors) {
        const messages = Object.values(err.data.errors).filter(Boolean)
        setError(messages.length ? messages.join(' ') : 'Invalid input')
      } else if (err.data?.error) {
        setError(err.data.error)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Authentication failed')
      }
    }finally{setSubmitting(false)}
  }

  if (loading) return (<div className="container py-4"><div className="alert alert-info">Loading...</div></div>)
  if (user) return (<Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />)

  return (
    <div className="container-fluid auth-wrap d-flex align-items-center py-4 py-md-5">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-6 d-none d-lg-block">
            <div className="auth-left">
              <div className="mb-3">
                <div className="fs-4 fw-bold">GlowUpNow</div>
                <div className="small" style={{opacity:.9}}>Home salon & spa services, on demand</div>
              </div>
              <h1 className="display-6 mb-3">{mode==='login' ? 'Welcome back' : 'Join GlowUpNow'}</h1>
              <p className="mb-4">{mode==='login' ? 'Book massages, facials, nails, and hair services with trusted pros at your home. Sign in to continue.' : 'Create your account to book at-home salon & spa services, save preferences, and track your bookings.'}</p>
              <ul className="list-unstyled m-0 p-0 d-grid gap-2">
                {mode==='login' ? (
                  <>
                    <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill bg-light text-dark">Secure</span><span>Protected authentication</span></li>
                    <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill bg-light text-dark">Fast</span><span>Quick, seamless booking</span></li>
                    <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill bg-light text-dark">Trusted</span><span>Verified professionals</span></li>
                  </>
                ) : (
                  <>
                    <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill bg-light text-dark">Personal</span><span>Set your preferences</span></li>
                    <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill bg-light text-dark">Tracking</span><span>Manage bookings & history</span></li>
                    <li className="d-flex align-items-center gap-2"><span className="badge rounded-pill bg-light text-dark">Perks</span><span>Access exclusive offers</span></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="col-lg-5 ms-lg-auto">
            <div className="card auth-card p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h2 className="h3 m-0">{mode==='login' ? 'Sign in' : 'Create account'}</h2>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>setMode(mode==='login'?'register':'login')}>
                  {mode==='login' ? 'Register' : 'Login'}
                </button>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={onSubmit}>
                {mode==='register' && (
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" placeholder="Your full name" value={name} onChange={e=>setName(e.target.value)} onFocus={()=>{}} onBlur={()=>{}} />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onFocus={()=>{}} onBlur={()=>{}} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" placeholder={mode==='login' ? 'Your password' : 'Create a password (min 8 characters)'} value={password} onChange={e=>setPassword(e.target.value)} />
                </div>
                <div className="d-grid gap-2">
                  <button disabled={submitting} className="btn btn-primary" type="submit">{submitting ? 'Please wait...' : (mode==='login' ? 'Sign in' : 'Create account')}</button>
                  <button type="button" className="btn btn-outline-primary" onClick={()=>setMode(mode==='login'?'register':'login')}>
                    {mode==='login' ? 'New here? Create an account' : 'Have an account? Sign in'}
                  </button>
                </div>
                {mode==='register' && (
                  <div className="text-muted small mt-2">By creating an account, you agree to our Terms and Privacy Policy.</div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
