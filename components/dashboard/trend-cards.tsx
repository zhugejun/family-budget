'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Award,
  Tag,
  Calendar,
} from 'lucide-react';
import type { TrendData } from '@/lib/analytics';
import { formatCurrency, formatPercentage } from '@/lib/analytics';

interface TrendCardsProps {
  trendData: TrendData;
}

export function TrendCards({ trendData }: TrendCardsProps) {
  const {
    avgDailySpending,
    highestExpense,
    mostExpensiveCategory,
    monthOverMonthChange,
  } = trendData;

  const isPositiveChange = monthOverMonthChange >= 0;

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {/* Average Daily Spending */}
      <div className='bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50'>
        <div className='flex items-start justify-between mb-2'>
          <div className='p-2 bg-emerald-100 rounded-lg'>
            <Calendar className='w-5 h-5 text-emerald-600' />
          </div>
        </div>
        <p className='text-sm text-emerald-700 font-medium mb-1'>Avg Daily</p>
        <p className='text-2xl font-bold text-emerald-900'>
          {formatCurrency(avgDailySpending)}
        </p>
      </div>

      {/* Highest Expense */}
      <div className='bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200/50'>
        <div className='flex items-start justify-between mb-2'>
          <div className='p-2 bg-violet-100 rounded-lg'>
            <Award className='w-5 h-5 text-violet-600' />
          </div>
        </div>
        <p className='text-sm text-violet-700 font-medium mb-1'>
          Highest Expense
        </p>
        {highestExpense ? (
          <>
            <p className='text-2xl font-bold text-violet-900'>
              {formatCurrency(highestExpense.price * highestExpense.quantity)}
            </p>
            <p className='text-xs text-violet-600 mt-1 truncate'>
              {highestExpense.name}
            </p>
          </>
        ) : (
          <p className='text-2xl font-bold text-violet-900'>-</p>
        )}
      </div>

      {/* Most Expensive Category */}
      <div className='bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200/50'>
        <div className='flex items-start justify-between mb-2'>
          <div className='p-2 bg-amber-100 rounded-lg'>
            <Tag className='w-5 h-5 text-amber-600' />
          </div>
        </div>
        <p className='text-sm text-amber-700 font-medium mb-1'>Top Category</p>
        <p className='text-xl font-bold text-amber-900 truncate'>
          {mostExpensiveCategory}
        </p>
      </div>

      {/* Month-over-Month Change */}
      <div
        className={`bg-gradient-to-br rounded-2xl p-4 border ${
          isPositiveChange
            ? 'from-rose-50 to-pink-50 border-rose-200/50'
            : 'from-green-50 to-emerald-50 border-green-200/50'
        }`}
      >
        <div className='flex items-start justify-between mb-2'>
          <div
            className={`p-2 rounded-lg ${
              isPositiveChange ? 'bg-rose-100' : 'bg-green-100'
            }`}
          >
            {isPositiveChange ? (
              <TrendingUp className='w-5 h-5 text-rose-600' />
            ) : (
              <TrendingDown className='w-5 h-5 text-green-600' />
            )}
          </div>
        </div>
        <p
          className={`text-sm font-medium mb-1 ${
            isPositiveChange ? 'text-rose-700' : 'text-green-700'
          }`}
        >
          vs Last Month
        </p>
        <p
          className={`text-2xl font-bold ${
            isPositiveChange ? 'text-rose-900' : 'text-green-900'
          }`}
        >
          {formatPercentage(monthOverMonthChange)}
        </p>
      </div>
    </div>
  );
}
