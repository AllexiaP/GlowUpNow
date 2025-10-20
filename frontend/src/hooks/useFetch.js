// useFetch — Generic async lifecycle (data, loading, error, reload).
import { useCallback, useEffect, useState } from 'react'

export default function useFetch(fn, deps = [], opts = {}){
  const { immediate = true } = opts
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const run = useCallback(async (...args)=>{
    setLoading(true); setError(null)
    try{
      const res = await fn(...args)
      setData(res)
      return res
    }catch(e){ setError(e); throw e }
    finally{ setLoading(false) }
  }, [fn])

  useEffect(()=>{ if(immediate) { run() } }, [immediate, run, ...deps])

  return { data, error, loading, reload: run, setData }
}

