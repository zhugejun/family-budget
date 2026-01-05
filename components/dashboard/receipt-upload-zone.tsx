'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Loader2, Camera } from 'lucide-react';

interface ReceiptUploadZoneProps {
  isProcessing: boolean;
  onImageUpload: (file: File) => void;
}

export function ReceiptUploadZone({
  isProcessing,
  onImageUpload,
}: ReceiptUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
        dragOver
          ? 'border-amber-400 bg-amber-50'
          : 'border-stone-300 bg-white/50 hover:border-amber-300 hover:bg-white/80'
      }`}
    >
      {isProcessing ? (
        <div className='flex flex-col items-center gap-4'>
          <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center animate-pulse'>
            <Loader2 className='w-8 h-8 text-amber-600 animate-spin' />
          </div>
          <p className='text-stone-600 font-medium'>
            Processing receipt with AI...
          </p>
          <p className='text-stone-400 text-sm'>Extracting items and prices</p>
        </div>
      ) : (
        <>
          <div className='w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Upload className='w-8 h-8 text-amber-600' />
          </div>
          <p className='text-stone-700 font-medium text-lg mb-2'>
            Drop receipt image here
          </p>
          <p className='text-stone-400 mb-4'>or click to browse</p>
          <input
            type='file'
            accept='image/*'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(file);
            }}
            className='absolute inset-0 opacity-0 cursor-pointer'
          />
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm'>
            <Camera className='w-4 h-4' />
            Supports JPG, PNG
          </div>
        </>
      )}
    </div>
  );
}
