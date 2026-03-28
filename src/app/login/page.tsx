'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setSuccessMessage('Account created! Check your email to confirm, then sign in.')
        setIsSignUp(false)
        setPassword('')
        setConfirmPassword('')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        router.push('/admin')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Teal hero header */}
      <div className="bg-[#8ccacf] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Staff Login</h1>
          <p className="mt-2 text-white/80 text-sm">
            Access the SCTCA Climate Action Tracker admin tools
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-[#313131] mb-6">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-[#e75425]/10 border border-[#e75425]/30 text-[#e75425] text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-md bg-[#8ccacf]/10 border border-[#8ccacf]/30 text-[#313131] text-sm">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#313131] mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#313131] mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>

              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#313131] mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
                    placeholder="Confirm your password"
                    minLength={6}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#8ccacf] text-white font-medium rounded-md hover:bg-[#7ab9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading
                  ? 'Please wait...'
                  : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccessMessage(null)
                  setConfirmPassword('')
                }}
                className="text-sm text-[#8ccacf] hover:underline"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
