// Home.jsx — Public landing page: hero, category search, featured and all services, testimonials.
import React, { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { listServices } from '../services/serviceService'
import ServiceCard from '../components/ServiceCard'
import BookingForm from '../components/BookingForm'
import { useAuthContext } from '../contexts/AuthContext'

export default function Home(){
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [featured, setFeatured] = useState([])
  const [showFeatured, setShowFeatured] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [q, setQ] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [category, setCategory] = useState('')
  const [toast, setToast] = useState({ type:'', msg:'' })
  const [visibleCount, setVisibleCount] = useState(12)

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  }

  const fetchAll = async ()=>{
    setLoading(true)
    setError('')
    try{
      const res = await listServices({ active: 1, sort: 'created_at', order: 'DESC' })
      const rows = res.data || []
      setServices(rows)
      setFeatured(rows.slice(0,6))
    }catch(e){ setError('Failed to load services') }
    finally{ setLoading(false) }
  }
  useEffect(()=>{ fetchAll() }, [])

  const scrollToFeaturedAnchor = ()=>{
    const el = document.getElementById('featuredAnchor')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/login')
    } else {
      scrollToFeaturedAnchor()
    }
  }

  const applySearch = async (opts={}) => {
    setLoading(true); setError('')
    try{
      const qV = ('q' in opts) ? opts.q : q
      const categoryV = ('category' in opts) ? opts.category : category
      const priceMaxV = ('priceMax' in opts) ? opts.priceMax : priceMax
      const params = { active: 1, q: qV }
      if (categoryV) params.q = `${qV} ${categoryV}`
      if (priceMaxV) params.sort = 'price', params.order = 'ASC'
      const res = await listServices(params)
      let rows = res.data || []
      if (priceMaxV) rows = rows.filter(s => Number(s.price) <= Number(priceMaxV))
      if (categoryV) rows = rows.filter(s => (s.category||'').toLowerCase().includes(categoryV.toLowerCase()))
      setServices(rows)
      setVisibleCount(12)
    }catch(e){ setError('Failed to search services') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ if (error) setToast({ type:'error', msg:error }) }, [error])
  useEffect(()=>{ if (successMsg) setToast({ type:'success', msg: successMsg }) }, [successMsg])

  return (
    <>
      {/* Hero Section (full-bleed) */}
      <section className="hero-bleed mb-4">
        <div className="container">
          <div className="hero-landing">
            <div className="hero-left col-md-6">
              <h1 className="display-5">GlowUpNow</h1>
              <p className="fs-5">Professional at-home salon & spa services. Book trusted stylists and therapists for a pampering experience without leaving your doorstep.</p>
              <div className="d-flex gap-2 mt-3 cta-group">
                <button className="btn btn-primary btn-lg" onClick={handleBookNow}>Book Now</button>
                <button className="btn btn-outline-primary btn-lg" onClick={()=>{ setShowFeatured(false); applySearch({ q:'', priceMax:'', category:'' }); scrollToFeaturedAnchor() }}>Explore Services</button>
              </div>
            </div>
            <div className="hero-right col-md-6">
              <div className="hero-media" role="img" aria-label="Home salon service scene" />
            </div>
          </div>
        </div>
      </section>

      <div className="container py-4">
      <h5 className="mb-2">Browse by Category</h5>
      <hr className="section-divider mb-3" />
      <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-7 g-2 mb-4">
        {['Massage','Facial','Hair','Hand and Foot','Waxing','Eyelash','Eyebrow'].map(label => (
          <div key={label} className="col">
            <button className="btn btn-outline-primary rounded-pill w-100" onClick={()=>{ setCategory(label); setShowFeatured(false); applySearch({ category: label }); scrollToFeaturedAnchor() }}>{label}</button>
          </div>
        ))}
      </div>

      {/* Trust strip */}
      <div className="trust-strip d-flex align-items-center justify-content-between mb-4">
        <span className="brand">TRUSTED BY CLIENTS IN METRO</span>
        <div className="d-flex gap-3 small">
          <span className="brand">SAFE & HYGIENIC</span>
          <span className="brand">SECURE PAYMENTS</span>
          <span className="brand">VERIFIED PROS</span>
        </div>
      </div>

      {/* Value props */}
      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="card h-100"><div className="card-body">
          <h5 className="card-title">Home Service Convenience</h5>
          <p className="card-text small text-muted">Professional treatments delivered to your doorstep. No traffic, no queues.</p>
        </div></div></div>
        <div className="col-md-4"><div className="card h-100"><div className="card-body">
          <h5 className="card-title">Curated Packages</h5>
          <p className="card-text small text-muted">Save with bundles like Relax & Glow or Full Pamper — perfect for self-care days.</p>
        </div></div></div>
        <div className="col-md-4"><div className="card h-100"><div className="card-body">
          <h5 className="card-title">Trusted & Secure</h5>
          <p className="card-text small text-muted">Secure authentication, protected data, and reliable booking experience.</p>
        </div></div></div>
      </div>

      <div className="card p-3 mb-3" style={{ position:'sticky', top:8, zIndex:10 }}>
        <div className="d-flex flex-wrap gap-2 align-items-end">
          <div style={{flex:'1 1 320px', minWidth:240}}>
            <input className="form-control" placeholder="Search services..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault(); setShowFeatured(false); applySearch(); scrollToFeaturedAnchor()}}} />
          </div>
          <div style={{flex:'0 0 auto', minWidth:160, maxWidth:220}}>
            <select className="form-select" value={priceMax} onChange={e=>{ const v=e.target.value; setPriceMax(v); setShowFeatured(false); applySearch({ priceMax: v }); scrollToFeaturedAnchor() }}>
              <option value="">Price filter</option>
              <option value="500">Up to ₱500</option>
              <option value="1000">Up to ₱1,000</option>
              <option value="2000">Up to ₱2,000</option>
            </select>
          </div>
          <div style={{flex:'0 0 auto', minWidth:180, maxWidth:260}}>
            <select className="form-select" value={category} onChange={e=>{ const v=e.target.value; setCategory(v); setShowFeatured(false); applySearch({ category: v }); scrollToFeaturedAnchor() }}>
              <option value="">All categories</option>
              <option value="Massage">Massage</option>
              <option value="Facial">Facial</option>
              <option value="Hair">Hair</option>
              <option value="Hand and Foot">Hand and Foot</option>
              <option value="Waxing">Waxing</option>
              <option value="Eyelash">Eyelash</option>
              <option value="Eyebrow">Eyebrow</option>
            </select>
          </div>
          <div className="ms-auto d-flex gap-2" style={{flex:'0 0 auto'}}>
            <button className="btn btn-outline-secondary" onClick={()=>{ setShowFeatured(false); applySearch(); scrollToFeaturedAnchor() }}>Search</button>
            <button className="btn btn-outline-primary" onClick={()=>{ setQ(''); setPriceMax(''); setCategory(''); setVisibleCount(12); setShowFeatured(true); fetchAll(); scrollToFeaturedAnchor() }}>Clear</button>
          </div>
        </div>
      </div>

      {loading && <div className="alert alert-info">Loading...</div>}

      {/* Anchor for scrolling */}
      <div id="featuredAnchor" />

      {showFeatured && featured.length>0 && (
        <div className="section-featured mb-3">
          <div className="d-flex align-items-end justify-content-between mb-2">
            <h5 id="featured" className="mb-0">Featured</h5>
            <div className="text-muted small">Top {featured.length}</div>
          </div>
          <div className="row g-3">
            {featured.map(s => (
              <div key={s.id} className="col-md-3">
                <ServiceCard service={s} onSelect={user ? setSelected : null} />
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
        <div className="row g-3">
          {services.slice(0, visibleCount).map(s => (
            <div key={s.id} className="col-md-4">
              <ServiceCard service={s} onSelect={user ? setSelected : null} />
            </div>
          ))}
        </div>
      )}

      {visibleCount < services.length && (
        <div className="d-flex justify-content-center mt-3">
          <button className="btn btn-outline-secondary" onClick={()=> setVisibleCount(v=> Math.min(services.length, v+12))}>Load more</button>
        </div>
      )}

      {selected && user && (
        <BookingForm
          service={selected}
          onSuccess={() => {
            setSelected(null)
            setSuccessMsg('Booking created successfully!')
            setTimeout(()=>setSuccessMsg(''), 3000)
          }}
        />
      )}

      {/* Testimonials */}
      <hr className="section-divider my-4" />
      <h5 className="mb-2">What clients say</h5>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card testimonial-card h-100"><div className="card-body">
            <div className="small text-muted mb-1">Aira, Makati</div>
            <div className="stars mb-2">★★★★★</div>
            <div className="quote small">“Loved the convenience and the therapist was very professional. Will book again!”</div>
          </div></div>
        </div>
        <div className="col-md-4">
          <div className="card testimonial-card h-100"><div className="card-body">
            <div className="small text-muted mb-1">Janelle, QC</div>
            <div className="stars mb-2">★★★★★</div>
            <div className="quote small">“Great service! The facial package was exactly what I needed after a long week.”</div>
          </div></div>
        </div>
        <div className="col-md-4">
          <div className="card testimonial-card h-100"><div className="card-body">
            <div className="small text-muted mb-1">Mico, Taguig</div>
            <div className="stars mb-2">★★★★★</div>
            <div className="quote small">“Booked a couples massage — punctual, clean, and super relaxing.”</div>
          </div></div>
        </div>
      </div>

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

      {/* Footer removed (handled by global footer) */}
    </div>
    </>
  )
}
