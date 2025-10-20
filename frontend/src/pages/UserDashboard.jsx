import React, { useEffect, useState } from 'react'
import { listServices } from '../services/serviceService'
import ServiceCard from '../components/ServiceCard'
import { useNavigate } from 'react-router-dom'

export default function UserDashboard(){
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [featured, setFeatured] = useState([])
  const [showFeatured, setShowFeatured] = useState(true)
  const [visibleCount, setVisibleCount] = useState(12)
  const [q, setQ] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ type:'', msg:'' })

  useEffect(()=>{
    const loadServices = async ()=>{
      setLoading(true); setError('')
      try{
        const res = await listServices({ active:1, sort:'created_at', order:'DESC' })
        const rows = res.data || []
        setServices(rows)
        setFeatured(rows.slice(0,6))
      }catch{ setError('Failed to load services') }
      finally{ setLoading(false) }
    }
    loadServices()
  },[])

  const handleSelectForBooking = (svc) => {
    navigate('/bookings', { state: { selected: svc } })
  }

  const scrollToAnchor = ()=>{
    const el = document.getElementById('ud-featuredAnchor')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const fetchAll = async ()=>{
    setLoading(true); setError('')
    try{
      const res = await listServices({ active:1, sort:'created_at', order:'DESC' })
      const rows = res.data || []
      setServices(rows)
      setFeatured(rows.slice(0,6))
    }catch{ setError('Failed to load services') }
    finally{ setLoading(false) }
  }

  const applySearch = async (opts={})=>{
    setLoading(true); setError('')
    try{
      const qV = ('q' in opts) ? opts.q : q
      const priceV = ('priceMax' in opts) ? opts.priceMax : priceMax
      const catV = ('category' in opts) ? opts.category : category
      const params = { active:1, q: qV }
      if (priceV) params.sort='price', params.order='ASC'
      const res = await listServices(params)
      let rows = res.data || []
      if (priceV) rows = rows.filter(s => Number(s.price) <= Number(priceV))
      if (catV) rows = rows.filter(s => (s.category||'').toLowerCase().includes(catV.toLowerCase()))
      setServices(rows)
      setVisibleCount(12)
    }catch{ setError('Search failed') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ if (error) setToast({ type:'error', msg:error }) }, [error])

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3" style={{ position:'sticky', top:8, zIndex:10 }}>
        <h3 className="mb-0">Discover Services</h3>
        <div className="d-flex gap-2">
          <input className="form-control" placeholder="Search services" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); setShowFeatured(false); applySearch(); scrollToAnchor() } }} />
          <select className="form-select" value={priceMax} onChange={e=>{ const v=e.target.value; setPriceMax(v); setShowFeatured(false); applySearch({ priceMax: v }); scrollToAnchor() }}>
            <option value="">Price</option>
            <option value="500">≤ ₱500</option>
            <option value="1000">≤ ₱1,000</option>
            <option value="2000">≤ ₱2,000</option>
          </select>
          <select className="form-select" value={category} onChange={e=>{ const v=e.target.value; setCategory(v); setShowFeatured(false); applySearch({ category: v }); scrollToAnchor() }}>
            <option value="">All categories</option>
            <option value="Massage">Massage</option>
            <option value="Hair">Hair</option>
            <option value="Nails">Nails</option>
            <option value="Skin">Skin</option>
            <option value="Package">Package</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={()=>{ setShowFeatured(false); applySearch(); scrollToAnchor() }}>Search</button>
          <button className="btn btn-outline-primary" onClick={()=>{ setQ(''); setPriceMax(''); setCategory(''); setVisibleCount(12); setShowFeatured(true); fetchAll(); scrollToAnchor() }}>Clear</button>
        </div>
      </div>

      {loading && <div className="text-muted small mb-2">Loading...</div>}

      {/* Anchor for scrolling */}
      <div id="ud-featuredAnchor" />

      {showFeatured && featured.length>0 && (
        <div className="section-featured mb-3">
          <div className="d-flex align-items-end justify-content-between mb-2">
            <h5 className="mb-0">Featured</h5>
            <div className="text-muted small">Top {featured.length}</div>
          </div>
          <div className="row g-3">
            {featured.map(s => (
              <div key={s.id} className="col-md-3">
                <ServiceCard service={s} onSelect={handleSelectForBooking} />
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="section-divider" />
      <div className="d-flex align-items-end justify-content-between mb-2">
        <h5 className="mb-0">All Services</h5>
        <div className="text-muted small">{services.length} results</div>
      </div>

      {services.length===0 ? (
        <div className="text-muted">No results matched your filters.</div>
      ) : (
        <>
          <div className="row g-3">
            {services.slice(0, visibleCount).map(s => (
              <div key={s.id} className="col-md-4">
                <ServiceCard service={s} onSelect={handleSelectForBooking} />
              </div>
            ))}
          </div>
          {visibleCount < services.length && (
            <div className="d-flex justify-content-center mt-3">
              <button className="btn btn-outline-secondary" onClick={()=> setVisibleCount(v=> Math.min(services.length, v+12))}>Load more</button>
            </div>
          )}
        </>
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
