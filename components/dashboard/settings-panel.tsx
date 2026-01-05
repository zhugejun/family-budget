'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { CategoryManager } from './category-manager';

interface SettingsPanelProps {
  familyMembers: string[];
  defaultRatio: Record<string, number>;
  onUpdateDefaultRatio: (member: string, value: string) => void;
  categories: string[];
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (oldName: string, newName: string) => Promise<void>;
  onDeleteCategory: (name: string) => Promise<void>;
}

export function SettingsPanel({
  familyMembers,
  defaultRatio,
  onUpdateDefaultRatio,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: SettingsPanelProps) {
  return (
    <div className='mt-4 p-4 bg-gradient-to-r from-stone-100 to-stone-50 rounded-2xl border border-stone-200'>
      <h3 className='text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2'>
        <Settings className='w-4 h-4' />
        Default Split Ratio
      </h3>
      <div className='flex items-center gap-4'>
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm text-stone-600'>{familyMembers[0]}</span>
            <span className='text-sm font-bold text-emerald-600'>
              {defaultRatio[familyMembers[0]]}%
            </span>
          </div>
          <input
            type='range'
            min='0'
            max='100'
            value={defaultRatio[familyMembers[0]]}
            onChange={(e) =>
              onUpdateDefaultRatio(familyMembers[0], e.target.value)
            }
            className='w-full h-2 bg-gradient-to-r from-emerald-300 to-violet-300 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer'
          />
          <div className='flex items-center justify-between mt-1'>
            <span className='text-sm text-stone-600'>{familyMembers[1]}</span>
            <span className='text-sm font-bold text-violet-600'>
              {defaultRatio[familyMembers[1]]}%
            </span>
          </div>
        </div>
      </div>
      <p className='text-xs text-stone-400 mt-3'>
        New items will use this ratio. You can still customize individual items.
      </p>

      {/* Category Management */}
      <CategoryManager
        categories={categories}
        onAddCategory={onAddCategory}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  );
}
