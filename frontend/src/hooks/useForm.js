// useForm — Controlled form state with validation and submit.
import { useCallback, useState } from 'react'

export default function useForm({ initialValues = {}, validate, onSubmit } = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = useCallback((e) => {
    const { name, type, checked, value } = e.target
    const v = type === 'checkbox' ? !!checked : value
    setValues(s => ({ ...s, [name]: v }))
  }, [])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched(s => ({ ...s, [name]: true }))
    if (validate) setErrors(validate(values) || {})
  }, [validate, values])

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const errs = validate ? (validate(values) || {}) : {}
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (onSubmit) return onSubmit(values)
  }, [validate, values, onSubmit])

  const reset = useCallback((next = initialValues) => {
    setValues(next)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return { values, setValues, errors, touched, handleChange, handleBlur, handleSubmit, reset }
}

