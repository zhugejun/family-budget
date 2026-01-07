'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { CategoryManager } from './category-manager';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyMembers: string[];
  defaultRatio: Record<string, number>;
  onUpdateDefaultRatio: (member: string, value: string) => void;
  categories: string[];
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (oldName: string, newName: string) => Promise<void>;
  onDeleteCategory: (name: string) => Promise<void>;
}

export function SettingsDialog({
  open,
  onOpenChange,
  familyMembers,
  defaultRatio,
  onUpdateDefaultRatio,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-stone-600 to-stone-700 rounded-xl flex items-center justify-center'>
              <Settings className='w-5 h-5 text-white' />
            </div>
            <span>Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your default split ratio and expense categories
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto pr-2 space-y-6'>
          {/* Default Split Ratio Section */}
          <div className='bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200'>
            <h3 className='text-lg font-semibold text-stone-800 mb-2'>
              Default Split Ratio
            </h3>
            <p className='text-sm text-stone-600 mb-4'>
              Set the default split percentage for new expenses. You can always
              customize individual items.
            </p>

            {/* Single Slider with both members */}
            <div className='space-y-4'>
              {/* Member labels and percentages */}
              <div className='flex items-center justify-between'>
                <div className='text-center'>
                  <p className='text-sm font-medium text-stone-600 mb-1'>
                    {familyMembers[0]}
                  </p>
                  <p className='text-2xl font-bold text-emerald-600'>
                    {defaultRatio[familyMembers[0]]}%
                  </p>
                </div>
                <div className='text-center'>
                  <p className='text-sm font-medium text-stone-600 mb-1'>
                    {familyMembers[1]}
                  </p>
                  <p className='text-2xl font-bold text-violet-600'>
                    {defaultRatio[familyMembers[1]]}%
                  </p>
                </div>
              </div>

              {/* Slider */}
              <Slider
                value={[defaultRatio[familyMembers[0]]]}
                onValueChange={(value) =>
                  onUpdateDefaultRatio(familyMembers[0], value[0].toString())
                }
                min={0}
                max={100}
                step={1}
                className='w-full'
              />

              {/* Visual guide */}
              <div className='flex justify-between text-xs text-stone-400'>
                <span>← More for {familyMembers[0]}</span>
                <span>More for {familyMembers[1]} →</span>
              </div>
            </div>

            {/* Example Preview */}
            <div className='mt-4 p-3 bg-white/80 rounded-lg border border-amber-200'>
              <p className='text-xs text-stone-500 mb-2'>
                Split Example (for $100 expense):
              </p>
              <div className='flex justify-between text-sm'>
                <span className='text-emerald-700'>
                  {familyMembers[0]}: $
                  {((defaultRatio[familyMembers[0]] / 100) * 100).toFixed(2)}
                </span>
                <span className='text-violet-700'>
                  {familyMembers[1]}: $
                  {((defaultRatio[familyMembers[1]] / 100) * 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Category Management Section */}
          <div className='bg-stone-50 rounded-xl p-6 border border-stone-200'>
            <h3 className='text-lg font-semibold text-stone-800 mb-4'>
              Category Management
            </h3>
            <CategoryManager
              categories={categories}
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
