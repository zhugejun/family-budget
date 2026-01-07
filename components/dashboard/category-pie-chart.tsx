'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { CategoryData } from '@/lib/analytics';
import { getCategoryColor, formatCurrency } from '@/lib/analytics';

interface CategoryPieChartProps {
  data: CategoryData[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-64 text-stone-400'>
        No category data available
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.total,
    percentage: item.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-stone-200'>
          <p className='font-semibold text-stone-800'>{data.name}</p>
          <p className='text-stone-600'>{formatCurrency(data.value)}</p>
          <p className='text-sm text-stone-500'>
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }: any) => {
    if (percentage < 5) return null; // Don't show label for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill='white'
        textAnchor='middle'
        dominantBaseline='central'
        className='text-sm font-semibold'
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className='w-full'>
      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill='#8884d8'
            dataKey='value'
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getCategoryColor(entry.name, index)}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign='bottom'
            height={36}
            iconType='circle'
            formatter={(value, entry: any) => (
              <span className='text-sm text-stone-700'>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category List */}
      <div className='mt-4 space-y-2'>
        {data.slice(0, 5).map((item, index) => (
          <div
            key={item.category}
            className='flex items-center justify-between text-sm'
          >
            <div className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-full'
                style={{
                  backgroundColor: getCategoryColor(item.category, index),
                }}
              />
              <span className='text-stone-700'>{item.category}</span>
            </div>
            <div className='text-right'>
              <span className='font-semibold text-stone-800'>
                {formatCurrency(item.total)}
              </span>
              <span className='text-stone-500 ml-2'>
                ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
