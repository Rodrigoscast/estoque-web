'use client'

import { Suspense } from 'react'
import LoginPage from './_components/login-page'

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginPage />
    </Suspense>
  )
}
