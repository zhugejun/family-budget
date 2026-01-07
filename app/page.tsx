import { redirect } from 'next/navigation';

export default function Home() {
  // In local SQLite mode, redirect directly to dashboard
  redirect('/dashboard');
}
