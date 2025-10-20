// useEventSource — SSE wrapper with connect/close and event handlers.
import { useCallback, useEffect, useRef, useState } from 'react'

export default function useEventSource(url, opts={}){
  const { withCredentials=true, events } = opts
  const esRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  const open = useCallback((u=url, handlers=events)=>{
    if (!u) return
    if (esRef.current) { try{ esRef.current.close() }catch{} }
    const es = new EventSource(u, { withCredentials })
    esRef.current = es
    setConnected(true)
    setError(null)
    if (handlers) {
      Object.entries(handlers).forEach(([name, fn])=>{ if(typeof fn==='function') es.addEventListener(name, fn) })
    }
    es.onerror = (e)=>{ setError(e) }
  }, [url, events, withCredentials])

  const close = useCallback(()=>{
    if (esRef.current) { try{ esRef.current.close() }catch{}; esRef.current=null; setConnected(false) }
  }, [])

  useEffect(()=>()=>{ if(esRef.current) { try{ esRef.current.close() }catch{} } }, [])

  return { connected, error, open, close, ref: esRef }
}

