// useToggle — Boolean toggle hook.
import { useCallback, useState } from 'react'

export default function useToggle(initial = false) {
  const [value, setValue] = useState(!!initial)
  const toggle = useCallback((next) => {
    if (typeof next === 'boolean') { setValue(next); return }
    setValue(v => !v)
  }, [])
  return [value, toggle, setValue]
}

