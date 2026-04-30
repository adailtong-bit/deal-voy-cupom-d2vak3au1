import { useState, useEffect } from 'react'

export function useEnvironment() {
  const [hostname, setHostname] = useState(window.location.hostname)

  useEffect(() => {
    setHostname(window.location.hostname)
  }, [])

  // Considere produção se for o domínio oficial
  const isProduction =
    hostname === 'routevoy.com' || hostname === 'www.routevoy.com'
  const isDevelopment = !isProduction

  return {
    isProduction,
    isDevelopment,
    environment: isProduction ? 'production' : 'development',
  }
}
