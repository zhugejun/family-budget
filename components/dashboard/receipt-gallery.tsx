'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Trash2, Calendar, X } from 'lucide-react';
import type { ReceiptImage } from '@/lib/calculations';
import { ReceiptLightbox } from './receipt-lightbox';

interface ReceiptGalleryProps {
  images: ReceiptImage[];
  onDelete: (imageId: string) => Promise<boolean>;
  loading?: boolean;
}

export function ReceiptGallery({
  images,
  onDelete,
  loading = false,
}: ReceiptGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ReceiptImage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (image: ReceiptImage, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Delete receipt image from ${image.receipt_group}?`)) {
      return;
    }

    setDeletingId(image.id);
    const success = await onDelete(image.id);
    setDeletingId(null);

    if (success && selectedImage?.id === image.id) {
      setSelectedImage(null);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse'>
            <ImageIcon className='w-8 h-8 text-amber-600' />
          </div>
          <p className='text-stone-500'>Loading receipt images...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16'>
        <div className='w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4'>
          <ImageIcon className='w-10 h-10 text-stone-400' />
        </div>
        <h3 className='text-xl font-bold text-stone-800 mb-2'>
          No Receipt Images
        </h3>
        <p className='text-stone-500 text-center max-w-md'>
          Receipt images will appear here when you scan receipts
        </p>
      </div>
    );
  }

  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {images.map((image) => (
          <div
            key={image.id}
            className='group relative aspect-square rounded-xl overflow-hidden bg-stone-100 cursor-pointer transition-all hover:shadow-lg hover:scale-105'
            onClick={() => setSelectedImage(image)}
          >
            {/* Image */}
            <Image
              src={image.image_url}
              alt={`Receipt from ${image.receipt_group}`}
              fill
              className='object-cover'
              sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
            />

            {/* Overlay on hover */}
            <div className='absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity'>
              <div className='absolute bottom-0 left-0 right-0 p-3'>
                <div className='flex items-center gap-2 text-white mb-2'>
                  <Calendar className='w-3 h-3' />
                  <span className='text-xs font-medium truncate'>
                    {image.receipt_group}
                  </span>
                </div>
                <p className='text-xs text-stone-300'>
                  {new Date(image.uploaded_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(image, e)}
                disabled={deletingId === image.id}
                className='absolute top-2 right-2 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors disabled:opacity-50'
                aria-label='Delete image'
              >
                {deletingId === image.id ? (
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                ) : (
                  <Trash2 className='w-4 h-4' />
                )}
              </button>
            </div>

            {/* Receipt group badge (always visible) */}
            <div className='absolute top-2 left-2 px-2 py-1 bg-stone-900/70 backdrop-blur-sm text-white text-xs rounded-md'>
              <Calendar className='w-3 h-3 inline mr-1' />
              {new Date(image.uploaded_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox for full-size viewing */}
      {selectedImage && (
        <ReceiptLightbox
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={async () => {
            const success = await onDelete(selectedImage.id);
            if (success) {
              setSelectedImage(null);
            }
            return success;
          }}
        />
      )}
    </>
  );
}
