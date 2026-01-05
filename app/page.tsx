import Link from 'next/link';
import {
  Receipt,
  Camera,
  Users,
  PieChart,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'>
      {/* Header */}
      <header className='bg-white/70 backdrop-blur-lg border-b border-amber-200/50'>
        <div className='max-w-6xl mx-auto px-6 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200'>
              <Receipt className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold text-stone-800 font-serif'>
              Family Budget
            </span>
          </div>
          <Link
            href='/auth'
            className='px-6 py-2 bg-stone-800 text-white font-medium rounded-xl hover:bg-stone-700 transition-colors'
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className='max-w-6xl mx-auto px-6 py-20 text-center'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm font-medium mb-6'>
          <Sparkles className='w-4 h-4' />
          AI-Powered Expense Tracking
        </div>

        <h1 className='text-5xl md:text-6xl font-bold text-stone-800 mb-6 font-serif'>
          Track Family Expenses
          <br />
          <span className='bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent'>
            The Smart Way
          </span>
        </h1>

        <p className='text-xl text-stone-600 mb-8 max-w-2xl mx-auto'>
          Upload receipts, split costs fairly, and see who owes what—all in one
          beautiful app. Perfect for couples, roommates, and families.
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/auth'
            className='px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2'
          >
            Start Tracking Free
            <ArrowRight className='w-5 h-5' />
          </Link>
          <a
            href='#features'
            className='px-8 py-4 bg-white/80 backdrop-blur text-stone-700 font-semibold rounded-xl hover:bg-white transition-all border border-stone-200'
          >
            See How It Works
          </a>
        </div>

        {/* Hero Image Placeholder */}
        <div className='mt-16 bg-white/50 backdrop-blur rounded-3xl p-8 border border-stone-200 shadow-2xl'>
          <div className='aspect-video bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center'>
            <div className='text-center'>
              <Receipt className='w-16 h-16 text-amber-600 mx-auto mb-4' />
              <p className='text-stone-600 font-medium'>
                Beautiful Dashboard Preview
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='max-w-6xl mx-auto px-6 py-20'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-stone-800 mb-4 font-serif'>
            Everything You Need
          </h2>
          <p className='text-xl text-stone-600'>
            Powerful features that make expense tracking effortless
          </p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {/* Feature 1 */}
          <div className='bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-4'>
              <Camera className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-xl font-bold text-stone-800 mb-2'>
              AI Receipt Scanning
            </h3>
            <p className='text-stone-600'>
              Just snap a photo. Our AI extracts items, prices, and categories
              automatically.
            </p>
          </div>

          {/* Feature 2 */}
          <div className='bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4'>
              <Users className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-xl font-bold text-stone-800 mb-2'>
              Smart Splitting
            </h3>
            <p className='text-stone-600'>
              Flexible ratios for any situation. 50/50, 70/30, or custom splits
              per item.
            </p>
          </div>

          {/* Feature 3 */}
          <div className='bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center mb-4'>
              <PieChart className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-xl font-bold text-stone-800 mb-2'>
              Real-Time Tracking
            </h3>
            <p className='text-stone-600'>
              See who owes what instantly. Categories, totals, and splits update
              live.
            </p>
          </div>

          {/* Feature 4 */}
          <div className='bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center mb-4'>
              <Zap className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-xl font-bold text-stone-800 mb-2'>
              Lightning Fast
            </h3>
            <p className='text-stone-600'>
              Built with Next.js for instant page loads and smooth interactions.
            </p>
          </div>

          {/* Feature 5 */}
          <div className='bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mb-4'>
              <Shield className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-xl font-bold text-stone-800 mb-2'>
              Secure & Private
            </h3>
            <p className='text-stone-600'>
              Your data is encrypted and protected. Only you can access your
              expenses.
            </p>
          </div>

          {/* Feature 6 */}
          <div className='bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-shadow'>
            <div className='w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mb-4'>
              <Receipt className='w-6 h-6 text-white' />
            </div>
            <h3 className='text-xl font-bold text-stone-800 mb-2'>
              Custom Categories
            </h3>
            <p className='text-stone-600'>
              Organize expenses your way. Add, edit, or delete categories
              anytime.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='max-w-4xl mx-auto px-6 py-20'>
        <div className='bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-12 text-center text-white shadow-2xl'>
          <h2 className='text-4xl font-bold mb-4 font-serif'>
            Ready to Get Started?
          </h2>
          <p className='text-xl mb-8 text-amber-50'>
            Join families who are tracking expenses the smart way
          </p>
          <Link
            href='/auth'
            className='inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-all shadow-lg'
          >
            Create Free Account
            <ArrowRight className='w-5 h-5' />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-stone-200 bg-white/50 backdrop-blur'>
        <div className='max-w-6xl mx-auto px-6 py-8'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center'>
                <Receipt className='w-4 h-4 text-white' />
              </div>
              <span className='font-semibold text-stone-800'>
                Family Budget
              </span>
            </div>
            <p className='text-sm text-stone-600'>
              © 2026 Family Budget. Built with Next.js, Supabase & Claude AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
