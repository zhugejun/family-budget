'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Receipt, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Check your email to confirm your account!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-6'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-orange-200 mb-4'>
            <Receipt className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-stone-800 font-serif'>
            Family Budget
          </h1>
          <p className='text-stone-600 mt-2'>Track expenses together</p>
        </div>

        {/* Auth Form */}
        <div className='bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-stone-200'>
          <div className='flex gap-2 mb-6'>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                isLogin
                  ? 'bg-stone-800 text-white shadow-lg'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                !isLogin
                  ? 'bg-stone-800 text-white shadow-lg'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Email
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
                  placeholder='you@example.com'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-stone-700 mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400' />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className='w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent'
                  placeholder='••••••••'
                />
              </div>
            </div>

            {error && (
              <div className='p-3 bg-rose-50 border border-rose-200 rounded-xl'>
                <p className='text-sm text-rose-600'>{error}</p>
              </div>
            )}

            {message && (
              <div className='p-3 bg-emerald-50 border border-emerald-200 rounded-xl'>
                <p className='text-sm text-emerald-600'>{message}</p>
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-200 flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Login' : 'Create Account'}
                  <ArrowRight className='w-5 h-5' />
                </>
              )}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <a href='/' className='text-sm text-stone-600 hover:text-stone-800'>
              ← Back to home
            </a>
          </div>
        </div>

        <p className='text-center text-xs text-stone-500 mt-6'>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
