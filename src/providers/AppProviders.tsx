import type { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { CurrencyProvider } from './CurrencyProvider'
import { ThemeProvider } from './ThemeProvider'

type Props = { children: ReactNode }

export function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>{children}</AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  )
}
