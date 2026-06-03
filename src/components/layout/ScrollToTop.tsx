import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset scroll position on every client-side navigation. */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, search, hash])

  return null
}
