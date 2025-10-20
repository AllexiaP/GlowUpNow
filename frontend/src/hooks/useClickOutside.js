import { useEffect } from 'react'

export default function useClickOutside(ref, handler){
  useEffect(()=>{
    function onMouseDown(e){
      const el = ref && 'current' in ref ? ref.current : null
      if (!el) return
      if (!el.contains(e.target)) { handler && handler(e) }
    }
    document.addEventListener('mousedown', onMouseDown)
    return ()=> document.removeEventListener('mousedown', onMouseDown)
  }, [ref, handler])
}
