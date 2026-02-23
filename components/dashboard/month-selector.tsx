'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  formatMonth,
  getPreviousMonth,
  getNextMonth,
  getCurrentMonth,
  isCurrentMonth,
} from '@/lib/date-utils';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  expenseCount?: number;
}

export function MonthSelector({
  year,
  month,
  onChange,
  expenseCount = 0,
}: MonthSelectorProps) {
  const handlePrevious = () => {
    const prev = getPreviousMonth(year, month);
    onChange(prev.year, prev.month);
  };

  const handleNext = () => {
    const next = getNextMonth(year, month);
    onChange(next.year, next.month);
  };

  const handleToday = () => {
    const current = getCurrentMonth();
    onChange(current.year, current.month);
  };

  const isCurrent = isCurrentMonth(year, month);

  return (
    <div className='flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl px-3 sm:px-6 py-3 sm:py-4 shadow-sm border border-amber-100'>
      {/* Previous Month Button */}
      <button
        onClick={handlePrevious}
        className='p-2 rounded-xl hover:bg-amber-50 text-stone-600 hover:text-stone-800 transition-all'
        aria-label='Previous month'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>

      {/* Current Month Display */}
      <div className='flex items-center gap-4'>
        <div className='text-center'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-amber-600' />
            <h2 className='text-lg sm:text-2xl font-bold text-stone-800 font-serif'>
              {formatMonth(year, month)}
            </h2>
          </div>
          {expenseCount > 0 && (
            <p className='text-sm text-stone-500 mt-1'>
              {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
            </p>
          )}
        </div>

        {/* Quick Jump to Current Month */}
        {!isCurrent && (
          <button
            onClick={handleToday}
            className='ml-2 sm:ml-4 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-all'
          >
            This Month
          </button>
        )}
      </div>

      {/* Next Month Button */}
      <button
        onClick={handleNext}
        className='p-2 rounded-xl hover:bg-amber-50 text-stone-600 hover:text-stone-800 transition-all'
        aria-label='Next month'
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </div>
  );
}
