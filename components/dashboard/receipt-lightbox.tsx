'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Download, Trash2, Calendar, ZoomIn, ZoomOut } from 'lucide-react';
import type { ReceiptImage } from '@/lib/calculations';

interface ReceiptLightboxProps {
  image: ReceiptImage;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
}

export function ReceiptLightbox({
  image,
  onClose,
  onDelete,
}: ReceiptLightboxProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirm('Delete this receipt image? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.file_name || `receipt_${image.receipt_group}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-stone-900/95 backdrop-blur-sm animate-in fade-in duration-200'
      onClick={onClose}
    >
      {/* Content container */}
      <div
        className='relative w-full h-full flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 bg-stone-800/50 backdrop-blur-sm'>
          <div className='flex items-center gap-3 text-white'>
            <Calendar className='w-5 h-5 text-amber-400' />
            <div>
              <h3 className='font-semibold'>{image.receipt_group}</h3>
              <p className='text-sm text-stone-300'>
                {new Date(image.uploaded_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex items-center gap-2'>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className='p-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Zoom out'
            >
              <ZoomOut className='w-5 h-5' />
            </button>

            <span className='text-white text-sm px-2'>
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className='p-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Zoom in'
            >
              <ZoomIn className='w-5 h-5' />
            </button>

            <div className='w-px h-6 bg-stone-600' />

            <button
              onClick={handleDownload}
              className='p-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors'
              aria-label='Download image'
            >
              <Download className='w-5 h-5' />
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className='p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50'
              aria-label='Delete image'
            >
              {isDeleting ? (
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
              ) : (
                <Trash2 className='w-5 h-5' />
              )}
            </button>

            <button
              onClick={onClose}
              className='p-2 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors'
              aria-label='Close'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className='flex-1 overflow-auto p-8 flex items-center justify-center'>
          <div
            className='relative transition-transform duration-200'
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <Image
              src={image.image_url}
              alt={`Receipt from ${image.receipt_group}`}
              width={1200}
              height={1600}
              className='max-w-full h-auto rounded-lg shadow-2xl'
              priority
            />
          </div>
        </div>

        {/* Footer with file info */}
        <div className='p-4 bg-stone-800/50 backdrop-blur-sm text-center'>
          <p className='text-sm text-stone-300'>
            {image.file_name && (
              <>
                {image.file_name}
                {image.file_size &&
                  ` • ${(image.file_size / 1024).toFixed(1)} KB`}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
