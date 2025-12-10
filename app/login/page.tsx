'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/login-form'
import { tokenManager } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (tokenManager.isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/f4/83/d1/f483d17ed6cbb57ee5d9f6ac21d7d78e.jpg)',
        }}
      />

      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/f4/83/d1/f483d17ed6cbb57ee5d9f6ac21d7d78e.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 w-full flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  )
}
