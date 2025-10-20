// ServiceManagement.jsx — Admin: manage services (CRUD), filters, pagination, image upload.
import React, { useEffect, useState, useRef, useMemo } from 'react'
import useClickOutside from '../hooks/useClickOutside'
import useDebounce from '../hooks/useDebounce'
import useModal from '../hooks/useModal'
import { listServices, createService, updateService, deleteService, createServiceForm } from '../services/serviceService'

export default function ServiceManagement(){
  const empty = { id: 0, name: '', category:'', description: '', price: '', duration_minutes: '', image_path:'', active: 1 }
  const [items,setItems] = useState([])
  const [form,setForm] = useState(empty)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [success,setSuccess] = useState('')
  const [q,setQ] = useState('')
  const [imageFile, setImageFile] = useState(null)
  // Filters
  const [fCategory, setFCategory] = useState('')
  const [fPriceMin, setFPriceMin] = useState('')
  const [fPriceMax, setFPriceMax] = useState('')
  const [fDurMin, setFDurMin] = useState('')
  const [fDurMax, setFDurMax] = useState('')
  const [fActive, setFActive] = useState('')
  // Pagination
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const formRef = useRef(null)
  // Delete modal state
  const [toDelete, setToDelete] = useState(null)
  const { open: confirmOpen, openModal, closeModal, onKeyDown, ref: delRef } = useModal(false)
  // Toasts
  const [toast, setToast] = useState({ type:'', msg:'' })
  const [nameTouched, setNameTouched] = useState(false)
  const [priceTouched, setPriceTouched] = useState(false)
  const [durTouched, setDurTouched] = useState(false)
  const [qFocus, setQFocus] = useState(false)

  useClickOutside(delRef, ()=>{ if (confirmOpen && !loading) closeDelete() })

  const load = async()=>{
    setLoading(true); setError('')
    try{
      const res = await listServices({ q, active: '' })
      setItems(res.data || [])
    }catch(e){ setError('Failed to load services') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[])

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try{
      const payload = { ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes) }
      if (imageFile) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k,v])=>{ if(v!==undefined && v!==null && v!=='') fd.append(k, String(v)) })
        if (form.id) fd.append('id', String(form.id))
        fd.append('image', imageFile)
        await createServiceForm(fd)
      } else {
        if(form.id){ await updateService(payload) }
        else { await createService(payload) }
      }
      setForm(empty)
      setImageFile(null)
      setSuccess('Saved')
      load()
    }catch(err){ setError(err.data?.error || err.data?.errors ? JSON.stringify(err.data.errors) : 'Save failed') }
    finally{ setLoading(false) }
  }

  const edit = (s)=> {
    setForm({ ...s })
    setImageFile(null)
    // scroll to form for editing
    setTimeout(()=>{
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 0)
  }
  const doRemove = async(id)=>{
    setLoading(true); setError(''); setSuccess('')
    try{ await deleteService(id); setSuccess('Deleted'); load() }catch(e){ setError('Delete failed') } finally{ setLoading(false) }
  }
  const openDelete = (s)=>{ setToDelete(s); openModal() }
  const closeDelete = ()=>{ closeModal(); setToDelete(null) }
  const confirmDelete = async()=>{
    if(!toDelete) return;
    const id = toDelete.id
    closeDelete()
    await doRemove(id)
  }

  // Derived filtering + pagination
  const dq = useDebounce(q, 300)
  const filteredItems = useMemo(()=> items.filter(s => {
    if (dq && !(`${s.name} ${s.category} ${s.description||''}`.toLowerCase().includes(dq.toLowerCase()))) return false
    if (fCategory && s.category !== fCategory) return false
    const price = Number(s.price)
    if (fPriceMin !== '' && price < Number(fPriceMin)) return false
    if (fPriceMax !== '' && price > Number(fPriceMax)) return false
    const dur = Number(s.duration_minutes)
    if (fDurMin !== '' && dur < Number(fDurMin)) return false
    if (fDurMax !== '' && dur > Number(fDurMax)) return false
    if (fActive !== '' && Number(s.active) !== Number(fActive)) return false
    return true
  }), [items, dq, fCategory, fPriceMin, fPriceMax, fDurMin, fDurMax, fActive])
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * perPage
  const pageItems = useMemo(()=> filteredItems.slice(startIdx, startIdx + perPage), [filteredItems, startIdx, perPage])

  const clearFilters = ()=>{
    setQ(''); setFCategory(''); setFPriceMin(''); setFPriceMax(''); setFDurMin(''); setFDurMax(''); setFActive(''); setPage(1)
    load()
  }
  const onInteract = ()=>{ setSuccess(''); setError(''); setToast({type:'',msg:''}) }
  const onEnter = (e)=>{ if(e.key==='Enter'){ e.preventDefault(); setPage(1); onInteract() } }

  useEffect(()=>{
    if (error) setToast({ type:'error', msg:error })
  }, [error])
  useEffect(()=>{
    if (success) setToast({ type:'success', msg:success })
  }, [success])

  return (
    <div className="container py-4">
      <h2 className="mb-3">Service Management</h2>

      <div ref={formRef} className="card p-3 mb-3">
        <form onSubmit={submit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <input className={`form-control ${nameTouched && !form.name ? 'is-invalid':''}`} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onBlur={()=>setNameTouched(true)} onFocus={()=>setNameTouched(false)} required />
            {nameTouched && !form.name ? (<div className="invalid-feedback">Name is required</div>) : null}
          </div>
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              <option value="">Select category</option>
              <option value="Massage">Massage</option>
              <option value="Facial">Facial</option>
              <option value="Hair">Hair</option>
              <option value="Hand and Foot">Hand and Foot</option>
              <option value="Waxing">Waxing</option>
              <option value="Eyelash">Eyelash</option>
              <option value="Eyebrow">Eyebrow</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Price</label>
            <input type="number" step="0.01" className={`form-control ${priceTouched && (!form.price || Number(form.price)<=0) ? 'is-invalid':''}`} value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} onBlur={()=>setPriceTouched(true)} onFocus={()=>setPriceTouched(false)} required />
            {priceTouched && (!form.price || Number(form.price)<=0) ? (<div className="invalid-feedback">Enter a positive price</div>) : null}
          </div>
          <div className="col-md-4">
            <label className="form-label">Duration (mins)</label>
            <input type="number" className={`form-control ${durTouched && (!form.duration_minutes || Number(form.duration_minutes)<=0) ? 'is-invalid':''}`} value={form.duration_minutes} onChange={e=>setForm(f=>({...f,duration_minutes:e.target.value}))} onBlur={()=>setDurTouched(true)} onFocus={()=>setDurTouched(false)} required />
            {durTouched && (!form.duration_minutes || Number(form.duration_minutes)<=0) ? (<div className="invalid-feedback">Enter a positive duration</div>) : null}
          </div>
          <div className="col-md-4">
            <label className="form-label">Image</label>
            <input type="file" accept="image/*" className="form-control" onChange={e=>setImageFile((e.target.files && e.target.files[0]) || null)} />
            {form.id && form.image_path ? (<div className="form-text">Current: {form.image_path}</div>) : null}
          </div>
          <div className="col-md-4">
            <label className="form-label">Active</label>
            <select className="form-select" value={form.active} onChange={e=>setForm(f=>({...f,active:Number(e.target.value)}))}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="2" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          </div>
          <div className="col-12 text-end">
            <button className="btn btn-primary" disabled={loading} type="submit">{form.id?'Update':'Create'} Service</button>
            {form.id ? <button type="button" className="btn btn-outline-secondary ms-2" onClick={()=>{ setForm(empty); setImageFile(null) }}>Cancel</button> : null}
          </div>
        </form>
      </div>

      <div className="card p-3 mb-3" style={{ position:'sticky', top:8, zIndex:10 }}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">Search</label>
            <input className="form-control" placeholder="Search services" value={q} onChange={e=>{ setQ(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} onFocus={()=>setQFocus(true)} onBlur={()=>setQFocus(false)} style={qFocus?{ boxShadow:'0 0 0 .2rem rgba(111,66,193,.25)', borderColor:'#6f42c1' }:undefined} />
          </div>
          <div className="col-6 col-md-6 col-lg-3">
            <label className="form-label">Category</label>
            <select className="form-select" value={fCategory} onChange={e=>{ setFCategory(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter}>
              <option value="">All</option>
              <option value="Massage">Massage</option>
              <option value="Facial">Facial</option>
              <option value="Hair">Hair</option>
              <option value="Hand and Foot">Hand and Foot</option>
              <option value="Waxing">Waxing</option>
              <option value="Eyelash">Eyelash</option>
              <option value="Eyebrow">Eyebrow</option>
            </select>
          </div>
          <div className="col-6 col-md-6 col-lg-3">
            <label className="form-label">Active</label>
            <select className="form-select" value={fActive} onChange={e=>{ setFActive(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter}>
              <option value="">All</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div className="col-6 col-md-6 col-lg-3">
            <label className="form-label">Per page</label>
            <select className="form-select" value={perPage} onChange={e=>{ setPerPage(Number(e.target.value)); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="col-md-6 col-lg-4">
            <label className="form-label">Price</label>
            <div className="d-flex gap-2">
              <input type="number" step="0.01" className="form-control" placeholder="Min" value={fPriceMin} onChange={e=>{ setFPriceMin(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} />
              <input type="number" step="0.01" className="form-control" placeholder="Max" value={fPriceMax} onChange={e=>{ setFPriceMax(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} />
            </div>
          </div>
          <div className="col-md-6 col-lg-4">
            <label className="form-label">Duration (mins)</label>
            <div className="d-flex gap-2">
              <input type="number" className="form-control" placeholder="Min" value={fDurMin} onChange={e=>{ setFDurMin(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} />
              <input type="number" className="form-control" placeholder="Max" value={fDurMax} onChange={e=>{ setFDurMax(e.target.value); setPage(1); onInteract() }} onKeyDown={onEnter} onKeyPress={onEnter} />
            </div>
          </div>
          <div className="col-md-12 col-lg-4 d-flex justify-content-lg-end align-items-end mt-2 mt-lg-0">
            <button className="btn btn-outline-primary" type="button" onClick={clearFilters}>Clear search/filters</button>
          </div>
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

      {filteredItems.length === 0 ? (
        <div className="text-muted">No results matched your filters.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Duration</th><th>Active</th><th></th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(s => (
                <tr key={s.id} onDoubleClick={()=>edit(s)}>
                  <td>{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.category || '-'}</td>
                  <td>₱{Number(s.price).toFixed(2)}</td>
                  <td>{s.duration_minutes} mins</td>
                  <td>{s.active? 'Yes':'No'}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>edit(s)} disabled={loading}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>openDelete(s)} disabled={loading}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="small text-muted">Showing {filteredItems.length === 0 ? 0 : (startIdx+1)}–{Math.min(startIdx+perPage, filteredItems.length)} of {filteredItems.length}</div>
        <div className="btn-group" role="group" aria-label="Pagination">
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={safePage<=1} onClick={()=>{ onInteract(); setPage(p=>Math.max(1, p-1))}}>Prev</button>
          <span className="btn btn-outline-secondary btn-sm disabled">Page {safePage} / {totalPages}</span>
          <button type="button" className="btn btn-outline-secondary btn-sm" disabled={safePage>=totalPages} onClick={()=>{ onInteract(); setPage(p=>Math.min(totalPages, p+1))}}>Next</button>
        </div>
      </div>

      {confirmOpen && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" onKeyDown={onKeyDown}>
            <div className="modal-dialog">
              <div className="modal-content" ref={delRef}>
                <div className="modal-header">
                  <h5 className="modal-title">Delete service</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeDelete}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete “{toDelete?.name}”?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={closeDelete} disabled={loading}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={loading}>Delete</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  )
}
