'use client'

import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/f4/83/d1/f483d17ed6cbb57ee5d9f6ac21d7d78e.jpg)',
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Blur effect */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/f4/83/d1/f483d17ed6cbb57ee5d9f6ac21d7d78e.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <LoginForm />
      </div>
    </div>
  )
}
