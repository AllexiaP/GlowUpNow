// useModal — Modal open/close with Escape handling and focus management.
import { useCallback, useEffect, useRef, useState } from 'react'

export default function useModal(initial=false){
  const [open, setOpen] = useState(!!initial)
  const ref = useRef(null)
  const onKeyDown = useCallback((e)=>{ if(e.key==='Escape') setOpen(false) },[])
  const openModal = useCallback(()=> setOpen(true),[])
  const closeModal = useCallback(()=> setOpen(false),[])
  const toggleModal = useCallback(()=> setOpen(v=>!v),[])
  useEffect(()=>{
    if (!open) return
    const el = ref.current
    const prev = document.activeElement
    if (el && el.focus) { try{ el.focus() }catch{} }
    return ()=>{ if(prev && prev.focus) { try{ prev.focus() }catch{} } }
  }, [open])
  return { open, openModal, closeModal, toggleModal, onKeyDown, ref, setOpen }
}

