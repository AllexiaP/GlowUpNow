import { useEffect, useState } from 'react'

export default function useLocalStorage(key, initialValue){
  const read = () => {
    if (typeof window === 'undefined') return initialValue
    try{
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    }catch{ return initialValue }
  }
  const [value, setValue] = useState(read)
  useEffect(()=>{
    try{ window.localStorage.setItem(key, JSON.stringify(value)) }catch{}
  }, [key, value])
  return [value, setValue]
}
