// ServiceCard.jsx — Displays a service with image skeleton, details, and optional Book action.
import React, { useState } from 'react'
import { API } from '../services/http'

export default function ServiceCard({ service, onSelect }){
  const imgSrc = service.image_path ? (service.image_path.startsWith('http') ? service.image_path : `${API}${service.image_path}`) : null
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="card h-100">
      <div style={{position:'relative', height:180, overflow:'hidden'}}>
        {!loaded && <div style={{position:'absolute', inset:0, background:'linear-gradient(90deg, var(--gu-mist), #f3eef6, var(--gu-mist))', animation:'shimmer 1.2s infinite'}} />}
        {imgSrc ? (
          <img src={imgSrc} alt={service.name} onLoad={()=>setLoaded(true)} style={{objectFit:'cover', width:'100%', height:'100%', display: loaded? 'block':'none'}} />
        ) : (
          <div style={{height:'100%', background:'var(--gu-mist)'}} />
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-1">{service.name}</h5>
        <p className="card-text small flex-grow-1">{service.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="service-price fw-bold">₱{Number(service.price).toFixed(2)}</span>
          <span className="badge text-bg-secondary">{service.duration_minutes} mins</span>
        </div>
      </div>
      {onSelect && (
        <div className="card-footer bg-transparent border-0 text-end">
          <button className="btn btn-primary btn-sm" onClick={()=>onSelect(service)}>Book</button>
        </div>
      )}
    </div>
  )
}
