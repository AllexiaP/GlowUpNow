// useInterval — Runs a callback every given delay with cleanup.
import { useEffect, useRef } from 'react'

export default function useInterval(callback, delay){
  const saved = useRef(callback)
  useEffect(()=>{ saved.current = callback }, [callback])
  useEffect(()=>{
    if (delay === null || delay === false) return
    const id = setInterval(()=> saved.current(), delay)
    return ()=> clearInterval(id)
  }, [delay])
}

