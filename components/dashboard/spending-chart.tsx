'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailySpending } from '@/lib/analytics';
import { formatCurrency } from '@/lib/analytics';

interface SpendingChartProps {
  data: DailySpending[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-64 text-stone-400'>
        No spending data available for this month
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    amount: item.amount,
    count: item.count,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-stone-200'>
          <p className='font-semibold text-stone-800'>{data.date}</p>
          <p className='text-amber-600 font-bold'>
            {formatCurrency(data.amount)}
          </p>
          <p className='text-sm text-stone-500'>
            {data.count} {data.count === 1 ? 'expense' : 'expenses'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='w-full'>
      <ResponsiveContainer width='100%' height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id='colorAmount' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#f97316' stopOpacity={0.8} />
              <stop offset='95%' stopColor='#f97316' stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#e7e5e4' />
          <XAxis
            dataKey='date'
            stroke='#78716c'
            style={{ fontSize: '12px' }}
            tick={{ fill: '#78716c' }}
          />
          <YAxis
            stroke='#78716c'
            style={{ fontSize: '12px' }}
            tick={{ fill: '#78716c' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type='monotone'
            dataKey='amount'
            stroke='#f97316'
            strokeWidth={2}
            fill='url(#colorAmount)'
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className='mt-4 grid grid-cols-3 gap-4'>
        <div className='text-center'>
          <p className='text-sm text-stone-500'>Total Days</p>
          <p className='text-lg font-bold text-stone-800'>{data.length}</p>
        </div>
        <div className='text-center'>
          <p className='text-sm text-stone-500'>Avg/Day</p>
          <p className='text-lg font-bold text-stone-800'>
            {formatCurrency(
              data.reduce((sum, d) => sum + d.amount, 0) / data.length
            )}
          </p>
        </div>
        <div className='text-center'>
          <p className='text-sm text-stone-500'>Peak Day</p>
          <p className='text-lg font-bold text-stone-800'>
            {formatCurrency(Math.max(...data.map((d) => d.amount)))}
          </p>
        </div>
      </div>
    </div>
  );
}
