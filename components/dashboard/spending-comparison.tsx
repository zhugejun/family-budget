'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MemberSpending } from '@/lib/analytics';
import { formatCurrency } from '@/lib/analytics';

interface SpendingComparisonProps {
  data: MemberSpending[];
}

const MEMBER_COLORS: Record<string, string> = {
  You: '#10b981', // emerald-500
  Partner: '#8b5cf6', // violet-500
};

export function SpendingComparison({ data }: SpendingComparisonProps) {
  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-64 text-stone-400'>
        No comparison data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.member,
    amount: item.amount,
    percentage: item.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-stone-200'>
          <p className='font-semibold text-stone-800'>{data.name}</p>
          <p className='text-lg font-bold text-stone-900'>
            {formatCurrency(data.amount)}
          </p>
          <p className='text-sm text-stone-500'>
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='w-full'>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#e7e5e4' />
          <XAxis
            dataKey='name'
            stroke='#78716c'
            style={{ fontSize: '14px', fontWeight: '600' }}
            tick={{ fill: '#78716c' }}
          />
          <YAxis
            stroke='#78716c'
            style={{ fontSize: '12px' }}
            tick={{ fill: '#78716c' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey='amount' radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={MEMBER_COLORS[entry.name] || '#f97316'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Member Breakdown */}
      <div className='mt-4 grid grid-cols-2 gap-4'>
        {data.map((member) => (
          <div
            key={member.member}
            className='flex items-center justify-between p-3 bg-stone-50 rounded-xl'
          >
            <div className='flex items-center gap-3'>
              <div
                className='w-4 h-4 rounded-full'
                style={{
                  backgroundColor: MEMBER_COLORS[member.member] || '#f97316',
                }}
              />
              <span className='font-semibold text-stone-700'>
                {member.member}
              </span>
            </div>
            <div className='text-right'>
              <p className='font-bold text-stone-900'>
                {formatCurrency(member.amount)}
              </p>
              <p className='text-xs text-stone-500'>
                {member.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
