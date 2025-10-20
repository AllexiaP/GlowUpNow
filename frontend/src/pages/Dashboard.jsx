// Dashboard.jsx — Admin analytics: summary stats, service coverage, bookings overview (filters, CSV, quick-view modal).
import React, { useEffect, useState } from 'react'
import useModal from '../hooks/useModal'
import { getSummary, getServiceCoverage, getAnalyticsBookings } from '../services/analyticsService'

export default function Dashboard(){
  const [data,setData] = useState(null)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [toast, setToast] = useState({ type:'', msg:'' })
  const [coverage,setCoverage] = useState(null)
  const [covLoading,setCovLoading] = useState(false)
  const [boRows, setBoRows] = useState([])
  const [boTotal, setBoTotal] = useState(0)
  const [boPage, setBoPage] = useState(1)
  const [boPerPage, setBoPerPage] = useState(10)
  const [boQ, setBoQ] = useState('')
  const [boStatus, setBoStatus] = useState('')
  const [boLoading, setBoLoading] = useState(false)
  const [boQFocus, setBoQFocus] = useState(false)
  const [fromFocus, setFromFocus] = useState(false)
  const [toFocus, setToFocus] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const { open: bookingOpen, openModal: openBookingModal, closeModal: closeBookingModal, onKeyDown: bookingKeyDown, ref: bookingRef } = useModal(false)
  
  
  const fmt = (d)=>{
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`
  }
  const StatCard = ({ label, value, icon }) => {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div style={{width:40,height:40,borderRadius:8,background:'var(--gu-mist)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--gu-primary-600)'}}>
            {icon}
          </div>
          <div>
            <div className="text-muted small">{label}</div>
            <div className="h4 m-0">{value}</div>
          </div>
        </div>
      </div>
    )
  }

  // Line chart with markers, tooltips, axes, gridlines, and 7-day moving average
  const LineChart = ({ points, height=160 }) => {
    const m = { top: 8, right: 8, bottom: 24, left: 36 }
    const n = points.length
    const innerH = height - m.top - m.bottom
    const maxVal = points.reduce((mx,p)=> Math.max(mx, Number(p.cnt||0)), 0)
    const safeMax = maxVal > 0 ? maxVal : 1
    const innerW = Math.max(260, n>1 ? n*22 : 260)
    const width = innerW + m.left + m.right
    const x = (i)=> m.left + (n>1 ? (i * (innerW / (n-1))) : innerW/2)
    const y = (v)=> m.top + (innerH - (Number(v)/safeMax) * innerH)

    const polyMain = n ? points.map((p,i)=> `${x(i)},${y(p.cnt||0)}`).join(' ') : ''

    // 7-day moving average overlay
    const avgPoints = points.map((p,i)=>{
      const start = Math.max(0, i-6)
      const win = points.slice(start, i+1)
      const avg = win.reduce((s,q)=> s + Number(q.cnt||0), 0) / win.length
      return { date: p.date, cnt: avg }
    })
    const polyAvg = n ? avgPoints.map((p,i)=> `${x(i)},${y(p.cnt)}`).join(' ') : ''

    // y-axis ticks (5 levels)
    const steps = 4
    const stepVal = Math.ceil(safeMax / steps)
    const yTicks = Array.from({ length: steps + 1 }, (_,i)=> i * stepVal)
    // x-axis ticks ~5 labels
    const xTickEvery = Math.max(1, Math.ceil(n / 5))

    return (
      <svg width={width} height={height} style={{maxWidth:'100%'}}>
        {/* gridlines + y labels */}
        {yTicks.map((t,i)=> (
          <g key={`y${i}`}>
            <line x1={m.left} x2={width-m.right} y1={y(t)} y2={y(t)} stroke="var(--gu-soft)" />
            <text x={m.left-6} y={y(t)} textAnchor="end" dominantBaseline="middle" className="small" fill="var(--gu-muted)">{t}</text>
          </g>
        ))}
        {/* x-axis baseline */}
        <line x1={m.left} x2={width-m.right} y1={height-m.bottom} y2={height-m.bottom} stroke="var(--gu-soft)" />
        {points.map((p,i)=> (i % xTickEvery === 0 ? (
          <text key={`x${i}`} x={x(i)} y={height-6} textAnchor="middle" className="small" fill="var(--gu-muted)">{String(p.date||'').slice(5)}</text>
        ) : null))}

        {/* average overlay */}
        <polyline points={polyAvg} fill="none" stroke="var(--gu-accent)" strokeWidth="2" strokeDasharray="4 4" />
        {/* main line */}
        <polyline points={polyMain} fill="none" stroke="var(--gu-primary)" strokeWidth="2.5" />
        {/* markers with native tooltip */}
        {points.map((p,i)=> (
          <g key={`m${i}`}>
            <circle cx={x(i)} cy={y(p.cnt||0)} r="3.5" fill="#fff" stroke="var(--gu-primary)" />
            <title>{`${p.date}: ${p.cnt}`}</title>
          </g>
        ))}
      </svg>
    )
  }

  // Simple donut PieChart with legend
  const PieChart = ({ data, size=220, inner=0.6, colors }) => {
    const [active, setActive] = useState(-1)
    const total = data.reduce((s,d)=> s + Number(d.value||0), 0)
    const cx = size/2, cy = size/2
    const r = (size/2) - 8
    const ir = r * inner
    const toXY = (angle, radius)=> [cx + radius*Math.cos(angle), cy + radius*Math.sin(angle)]
    const arcs = []
    let start = -Math.PI/2 // start at top
    const palette = ['var(--gu-primary)','var(--gu-accent)','var(--gu-primary-600)','rgba(73,34,91,.35)','rgba(165,106,189,.35)','rgba(73,34,91,.2)']
    data.forEach((d, i)=>{
      const val = Number(d.value||0)
      const slice = total>0 ? (val/total) * Math.PI*2 : 0
      const end = start + slice
      const [sx, sy] = toXY(start, r)
      const [ex, ey] = toXY(end, r)
      const [isx, isy] = toXY(end, ir)
      const [iex, iey] = toXY(start, ir)
      const largeArc = slice > Math.PI ? 1 : 0
      const color = (colors && colors[i]) ? colors[i] : palette[i % palette.length]
      const path = [
        `M ${sx} ${sy}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`,
        `L ${isx} ${isy}`,
        `A ${ir} ${ir} 0 ${largeArc} 0 ${iex} ${iey}`,
        'Z'
      ].join(' ')
      arcs.push({ path, color, label: d.label, value: val, start, end })
      start = end
    })
    const handleMove = (e)=>{
      if (total<=0) { setActive(-1); return }
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist < ir || dist > r) { setActive(-1); return }
      let ang = Math.atan2(dy, dx) // [-PI, PI], 0 at +x
      let fromTop = ang - (-Math.PI/2) // rotate so 0 at top
      while (fromTop < 0) fromTop += Math.PI*2
      const frac = fromTop / (Math.PI*2)
      // find slice by cumulative fraction to avoid angle wrap logic
      let acc = 0
      for (let i=0;i<data.length;i++){
        const val = Number(data[i].value||0)
        const next = acc + (total>0 ? val/total : 0)
        if (frac >= acc && frac < next){ setActive(i); return }
        acc = next
      }
      setActive(-1)
    }
    return (
      <div className="d-flex flex-wrap align-items-center gap-3">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onMouseMove={handleMove} onMouseLeave={()=>setActive(-1)}>
          {arcs.map((a,idx)=> (
            <path key={idx} d={a.path} fill={a.color} opacity={active===-1 || active===idx ? 1 : 0.5} stroke="#fff" strokeWidth={active===idx ? 2 : 1} />
          ))}
          {/* center hole to ensure crisp donut if total is 0 */}
          {total===0 && (
            <circle cx={cx} cy={cy} r={r} fill="var(--gu-mist)" />
          )}
        </svg>
        <div className="d-grid small" style={{minWidth: 180}}>
          <div className="mb-1">
            {active>=0 && total>0 ? (
              <strong>{data[active].label}: {Number(data[active].value||0)} ({Math.round((Number(data[active].value||0)/total)*100)}%)</strong>
            ) : (
              <span className="text-muted">Drag/hover over chart to preview</span>
            )}
          </div>
          {data.map((d,i)=> (
            <div key={i} className="d-flex align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <span style={{display:'inline-block',width:10,height:10,borderRadius:2,background: ((colors && colors[i]) ? colors[i] : (['var(--gu-primary)','var(--gu-accent)','var(--gu-primary-600)','rgba(73,34,91,.35)','rgba(165,106,189,.35)','rgba(73,34,91,.2)'][i % 6]))}} />
                <span style={{fontWeight: active===i ? 600 : 400}}>{d.label}</span>
              </div>
              <span className="text-muted">{Number(d.value||0)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  const computeThisWeek = ()=>{
    const t = new Date();
    const dow = t.getDay(); // 0 Sun .. 6 Sat
    const diffToMon = (dow===0 ? -6 : 1 - dow);
    const mon = new Date(t); mon.setHours(0,0,0,0); mon.setDate(t.getDate()+diffToMon);
    const sun = new Date(mon); sun.setDate(mon.getDate()+6);
    return { from: fmt(mon), to: fmt(sun) }
  }
  const initWeek = computeThisWeek()
  const [from,setFrom] = useState(initWeek.from)
  const [to,setTo] = useState(initWeek.to)

  const load = async (opts={}) => {
    const useFrom = opts.from ?? from
    const useTo = opts.to ?? to
    setLoading(true); setError('')
    try{
      const res = await getSummary({ from: useFrom, to: useTo })
      setData(res)
    }catch(e){ setError('Failed to load analytics') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[])
  useEffect(()=>{ if (error) setToast({ type:'error', msg:error }) }, [error])

  useEffect(()=>{
    const run = async()=>{
      setCovLoading(true)
      try{
        const res = await getServiceCoverage({ from, to })
        setCoverage(res)
      }catch(e){ /* ignore */ }
      finally{ setCovLoading(false) }
    }
    run()
  }, [from, to])

  useEffect(()=>{
    const run = async()=>{
      setBoLoading(true)
      try{
        const res = await getAnalyticsBookings({ from, to, q: boQ, status: boStatus, page: boPage, per_page: boPerPage })
        setBoRows(Array.isArray(res.rows)? res.rows : [])
        setBoTotal(Number(res.total||0))
      }catch(e){ /* noop */ }
      finally{ setBoLoading(false) }
    }
    run()
  }, [from, to, boQ, boStatus, boPage, boPerPage])

  const computeLast7Days = ()=>{
    const end = new Date(); end.setHours(0,0,0,0)
    const start = new Date(end); start.setDate(end.getDate()-6)
    return { from: fmt(start), to: fmt(end) }
  }
  const computeThisMonth = ()=>{
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth()+1, 0)
    return { from: fmt(start), to: fmt(end) }
  }

  const Bar = ({ label, value, max, color='var(--gu-primary)' }) => {
    const pct = max>0 ? Math.round((value/max)*100) : 0
    return (
      <div className="mb-2">
        <div className="d-flex justify-content-between"><span>{label}</span><span className="text-muted small">{value}</span></div>
        <div className="bg-light" style={{height:8, borderRadius:4}}>
          <div style={{width:`${pct}%`, height:8, background:color, borderRadius:4}} />
        </div>
      </div>
    )
  }

  

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h3 className="mb-1">Admin Analytics</h3>
          <div className="text-muted small">Overview of bookings · {from} → {to}</div>
        </div>
        <div className="d-flex gap-3 flex-wrap align-items-end">
          <div>
            <label className="form-label" htmlFor="dash_from">From</label>
            <input id="dash_from" name="from" type="date" className="form-control" value={from} onChange={e=>setFrom(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); load() } }} onFocus={()=>setFromFocus(true)} onBlur={()=>setFromFocus(false)} style={fromFocus?{ boxShadow:'0 0 0 .2rem rgba(111,66,193,.25)', borderColor:'#6f42c1' }:undefined} />
          </div>
          <div>
            <label className="form-label" htmlFor="dash_to">To</label>
            <input id="dash_to" name="to" type="date" className="form-control" value={to} onChange={e=>setTo(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); load() } }} onFocus={()=>setToFocus(true)} onBlur={()=>setToFocus(false)} style={toFocus?{ boxShadow:'0 0 0 .2rem rgba(111,66,193,.25)', borderColor:'#6f42c1' }:undefined} />
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary" onClick={load}>Apply</button>
            <div className="btn-group" role="group" aria-label="Range presets">
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>{ const r=computeThisWeek(); setFrom(r.from); setTo(r.to); load({ from: r.from, to: r.to }); }}>{'This Week'}</button>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>{ const r=computeLast7Days(); setFrom(r.from); setTo(r.to); load({ from: r.from, to: r.to }); }}>{'Last 7 Days'}</button>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>{ const r=computeThisMonth(); setFrom(r.from); setTo(r.to); load({ from: r.from, to: r.to }); }}>{'This Month'}</button>
            </div>
          </div>
        </div>
      </div>
      {loading && <div className="text-muted small mb-2">Loading...</div>}
      {data && (
        <div className="row g-3">
          {(() => {
            const rows = data.by_status || []
            const getCount = (s) => Number((rows.find(r => r.status === s)?.cnt) || 0)
            const confirmed = getCount('confirmed') + getCount('completed')
            const pending = getCount('pending')
            const canceled = getCount('canceled')
            const total = data.totals?.bookings ?? (confirmed + pending + canceled)
            return (
              <>
                <div className="col-6 col-md-3">
                  <StatCard label="Total Bookings" value={total} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" stroke="currentColor"/><path d="M4 8h16" stroke="currentColor"/></svg>} />
                </div>
                <div className="col-6 col-md-3">
                  <StatCard label="Confirmed" value={confirmed} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2"/></svg>} />
                </div>
                <div className="col-6 col-md-3">
                  <StatCard label="Pending" value={pending} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor"/><path d="M12 7v5l3 3" stroke="currentColor"/></svg>} />
                </div>
                <div className="col-6 col-md-3">
                  <StatCard label="Canceled" value={canceled} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor"/></svg>} />
                </div>
              </>
            )
          })()}

          {/* Revenue summary cards */}
          {(()=>{
            const rev = data.revenue || { total:0, avg_per_day:0, avg_duration_minutes:0 }
            return (
              <>
                <div className="col-6 col-md-4">
                  <StatCard label="Total Revenue" value={`₱${Number(rev.total||0).toFixed(2)}`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" stroke="currentColor"/><path d="M4 7l2-3h12l2 3" stroke="currentColor"/></svg>} />
                </div>
                <div className="col-6 col-md-4">
                  <StatCard label="Avg Revenue / Day" value={`₱${Number(rev.avg_per_day||0).toFixed(2)}`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v16H4z" stroke="currentColor"/><path d="M8 2v4M16 2v4M4 10h16" stroke="currentColor"/></svg>} />
                </div>
                <div className="col-6 col-md-4">
                  <StatCard label="Avg Duration (mins)" value={`${Number(rev.avg_duration_minutes||0).toFixed(1)}`} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor"/><path d="M12 7v5l3 3" stroke="currentColor"/></svg>} />
                </div>
              </>
            )
          })()}
          
          <div className="col-12 col-md-6">
            <div className="card"><div className="card-body">
              <h5 className="card-title">Status Breakdown</h5>
              {(()=>{
                const rows = data.by_status || []
                const by = Object.fromEntries(rows.map(r=> [r.status, Number(r.cnt||0)]))
                const series = [
                  { label:'confirmed', value:Number(by['confirmed']||0) },
                  { label:'completed', value:Number(by['completed']||0) },
                  { label:'pending',   value:Number(by['pending']||0) },
                  { label:'canceled',  value:Number(by['canceled']||0) },
                ]
                const colors = ['var(--gu-primary)','var(--gu-primary)','var(--gu-accent)','var(--gu-primary-600)']
                const nonZero = series.some(s => s.value>0)
                return !nonZero ? <div className="text-muted">No data</div> : <PieChart data={series} colors={colors} />
              })()}
            </div></div>
          </div>
          <div className="col-12 col-md-6">
            <div className="card"><div className="card-body">
              <h5 className="card-title">Category Breakdown</h5>
              {(()=>{
                const rows = data.by_category || []
                const series = rows.map(r=> ({ label: r.category, value: Number(r.cnt||0) }))
                return series.length===0 ? <div className="text-muted">No data</div> : <PieChart data={series} />
              })()}
            </div></div>
          </div>

          {/* Revenue by Category */}
          <div className="col-12">
            <div className="card"><div className="card-body">
              <h5 className="card-title">Revenue by Category</h5>
              {(()=>{
                const rows = data.revenue_by_category || []
                if (rows.length===0) return <div className="text-muted">No data</div>
                const max = rows.reduce((m,r)=> Math.max(m, Number(r.total_rev||0)), 0)
                return rows.map((r,i)=> (
                  <Bar key={i} label={r.category} value={Number(r.total_rev||0)} max={max} color="var(--gu-primary-600)" />
                ))
              })()}
            </div></div>
          </div>
          
          <div className="col-12">
            <div className="card"><div className="card-body">
              <h5 className="card-title">Daily Bookings</h5>
              {(()=>{
                const pts = data.daily || []
                const total = pts.reduce((s,p)=> s + Number(p.cnt||0), 0)
                const days = pts.length || 1
                const avg = total / days
                let peak = { date: '-', cnt: 0 }
                pts.forEach(p=>{ const c = Number(p.cnt||0); if (c>peak.cnt) peak = { date: p.date, cnt: c } })
                return (
                  <div className="row g-3 align-items-start">
                    <div className="col-md-8">
                      <LineChart points={pts} />
                    </div>
                    <div className="col-md-4">
                      <div className="small text-muted mb-2">Summary</div>
                      <ul className="list-unstyled m-0 d-grid gap-1 small">
                        <li><strong>Total bookings:</strong> {total}</li>
                        <li><strong>Average/day:</strong> {avg.toFixed(1)}</li>
                        <li><strong>Peak day:</strong> {peak.date} ({peak.cnt})</li>
                      </ul>
                    </div>
                  </div>
                )
              })()}
            </div></div>
          </div>
          <div className="col-12">
            <div className="card"><div className="card-body">
              <h5 className="card-title">Top Services</h5>
              {(()=>{
                const rows = data.top_services || []
                const max = rows.reduce((m,r)=>Math.max(m, Number(r.cnt||0)),0)
                return rows.length===0 ? <div className="text-muted">No data</div> : rows.map((r,i)=> (
                  <Bar key={i} label={r.name} value={Number(r.cnt||0)} max={max} />
                ))
              })()}
            </div></div>
          </div>

          <div className="col-12">
            <div className="card"><div className="card-body">
              <h5 className="card-title">Service Coverage</h5>
              {covLoading ? (
                <div className="text-muted">Loading...</div>
              ) : (!coverage || !Array.isArray(coverage.services) || coverage.services.length===0) ? (
                <div className="text-muted">No data</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead><tr><th>#</th><th>Service</th><th className="text-end">Bookings</th></tr></thead>
                    <tbody>
                      {coverage.services.map((r,i)=> (
                        <tr key={r.id||i}><td>{r.id}</td><td>{r.name}</td><td className="text-end">{Number(r.bookings||0)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div></div>
          </div>

          <div className="col-12">
            <div className="card"><div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Bookings Overview</h5>
                <div className="d-flex gap-2">
                  <div className="input-group input-group-sm" style={{width:260}}>
                    <span className="input-group-text">Search</span>
                    <input className="form-control" value={boQ} onChange={e=>{ setBoPage(1); setBoQ(e.target.value) }} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); setBoPage(1) } }} onFocus={()=>setBoQFocus(true)} onBlur={()=>setBoQFocus(false)} style={boQFocus?{ boxShadow:'0 0 0 .2rem rgba(111,66,193,.25)', borderColor:'#6f42c1' }:undefined} />
                  </div>
                  <select className="form-select form-select-sm" style={{width:150}} value={boStatus} onChange={e=>{ setBoPage(1); setBoStatus(e.target.value) }}>
                    <option value="">All Status</option>
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="canceled">canceled</option>
                    <option value="completed">completed</option>
                  </select>
                  <select className="form-select form-select-sm" style={{width:100}} value={boPerPage} onChange={e=>{ setBoPage(1); setBoPerPage(Number(e.target.value)) }}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <button className="btn btn-outline-secondary btn-sm" onClick={()=>{
                    const cols = ['ID','Date','Start','End','Status','Customer','Service','Price','Notes']
                    const lines = [cols.join(',')].concat(boRows.map(r=>[
                      r.id,
                      r.date,
                      (r.start_time||'').slice(0,5),
                      (r.end_time||'').slice(0,5),
                      r.status,
                      '"'+String(r.customer_name||'').replaceAll('"','""')+'"',
                      '"'+String(r.service_name||'').replaceAll('"','""')+'"',
                      Number(r.price||0).toFixed(2),
                      '"'+String(r.notes||'').replaceAll('"','""')+'"',
                    ].join(',')))
                    const blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8;' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `bookings_${from}_to_${to}.csv`
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    URL.revokeObjectURL(url)
                  }}>Export CSV</button>
                  
                </div>
              </div>
              {boLoading ? (
                <div className="text-muted">Loading...</div>
              ) : boRows.length===0 ? (
                <div className="text-muted">No data</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
                        <th>Customer</th>
                        <th>Service</th>
                        <th className="text-end">Price</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boRows.map((r)=> (
                        <tr key={r.id} onDoubleClick={()=>{ setSelectedBooking(r); openBookingModal() }} style={{cursor:'zoom-in'}}>
                          <td>{r.id}</td>
                          <td>{r.date}</td>
                          <td>{(r.start_time||'').slice(0,5)}</td>
                          <td>{(r.end_time||'').slice(0,5)}</td>
                          <td>{r.status}</td>
                          <td>{r.customer_name}</td>
                          <td>{r.service_name}</td>
                          <td className="text-end">₱{Number(r.price||0).toFixed(2)}</td>
                          <td>{r.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="small text-muted">Showing {(boRows.length===0)?0:((boPage-1)*boPerPage+1)}–{Math.min(boPage*boPerPage, boTotal)} of {boTotal}</div>
                <div className="btn-group" role="group">
                  <button className="btn btn-outline-secondary btn-sm" disabled={boPage<=1} onClick={()=>setBoPage(p=>Math.max(1,p-1))}>Prev</button>
                  <span className="btn btn-outline-secondary btn-sm disabled">Page {boPage} / {Math.max(1, Math.ceil(boTotal/boPerPage))}</span>
                  <button className="btn btn-outline-secondary btn-sm" disabled={boPage>=Math.max(1, Math.ceil(boTotal/boPerPage))} onClick={()=>setBoPage(p=>p+1)}>Next</button>
                </div>
              </div>

              {bookingOpen && (
                <>
                  <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" onKeyDown={bookingKeyDown}>
                    <div className="modal-dialog">
                      <div className="modal-content" ref={bookingRef}>
                        <div className="modal-header">
                          <h5 className="modal-title">Booking Details</h5>
                          <button type="button" className="btn-close" aria-label="Close" onClick={closeBookingModal}></button>
                        </div>
                        <div className="modal-body">
                          {selectedBooking ? (
                            <div className="small">
                              <div><strong>ID:</strong> {selectedBooking.id}</div>
                              <div><strong>Date:</strong> {selectedBooking.date}</div>
                              <div><strong>Time:</strong> {(selectedBooking.start_time||'').slice(0,5)} – {(selectedBooking.end_time||'').slice(0,5)}</div>
                              <div><strong>Status:</strong> {selectedBooking.status}</div>
                              <div><strong>Customer:</strong> {selectedBooking.customer_name}</div>
                              <div><strong>Service:</strong> {selectedBooking.service_name}</div>
                              <div><strong>Price:</strong> ₱{Number(selectedBooking.price||0).toFixed(2)}</div>
                              <div><strong>Notes:</strong> {selectedBooking.notes || '—'}</div>
                              <div><strong>Created:</strong> {selectedBooking.created_at || '—'}</div>
                            </div>
                          ) : (
                            <div className="text-muted">No booking selected.</div>
                          )}
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-outline-secondary" onClick={closeBookingModal}>Close</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-backdrop fade show"></div>
                </>
              )}
            </div></div>
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
