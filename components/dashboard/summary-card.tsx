'use client';

import React from 'react';
import { Users } from 'lucide-react';

interface SummaryCardProps {
  member: string;
  amount: number;
  variant: 'emerald' | 'violet';
}

export function SummaryCard({ member, amount, variant }: SummaryCardProps) {
  const isEmerald = variant === 'emerald';

  return (
    <div
      className={`p-5 rounded-2xl border ${
        isEmerald
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
          : 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200'
      }`}
    >
      <div className='flex items-center gap-2 mb-2'>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isEmerald
              ? 'bg-emerald-200 text-emerald-700'
              : 'bg-violet-200 text-violet-700'
          }`}
        >
          <Users className='w-4 h-4' />
        </div>
        <span className='font-medium text-stone-600'>{member}</span>
      </div>
      <p
        className={`text-2xl font-bold font-serif ${
          isEmerald ? 'text-emerald-700' : 'text-violet-700'
        }`}
      >
        ${amount.toFixed(2)}
      </p>
    </div>
  );
}
