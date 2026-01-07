'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  Loader2,
  Camera,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

interface ReceiptUploadZoneProps {
  isProcessing: boolean;
  onMultipleImageUpload: (files: File[]) => void;
  processingStatus?: {
    total: number;
    completed: number;
    failed: number;
    currentFile?: string;
  };
}

export function ReceiptUploadZone({
  isProcessing,
  onMultipleImageUpload,
  processingStatus,
}: ReceiptUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const validFiles = Array.from(files).filter(
        (file) =>
          file.type.startsWith('image/') || file.type === 'application/pdf'
      );

      if (validFiles.length > 0) {
        onMultipleImageUpload(validFiles);
      }
    },
    [onMultipleImageUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
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
      {isProcessing && processingStatus ? (
        <div className='flex flex-col items-center gap-4'>
          <div className='w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center animate-pulse'>
            <Loader2 className='w-8 h-8 text-amber-600 animate-spin' />
          </div>
          <p className='text-stone-600 font-medium'>
            Processing receipts with AI...
          </p>
          {processingStatus.currentFile && (
            <div className='flex items-center gap-2 text-sm text-stone-500'>
              <FileText className='w-4 h-4' />
              <span className='truncate max-w-xs'>
                {processingStatus.currentFile}
              </span>
            </div>
          )}
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <div className='w-2 h-2 bg-amber-500 rounded-full animate-pulse' />
              <span className='text-stone-600'>
                {processingStatus.completed} / {processingStatus.total}
              </span>
            </div>
            {processingStatus.completed > 0 && (
              <div className='flex items-center gap-1.5 text-green-600'>
                <CheckCircle2 className='w-4 h-4' />
                <span>{processingStatus.completed} done</span>
              </div>
            )}
            {processingStatus.failed > 0 && (
              <div className='flex items-center gap-1.5 text-red-600'>
                <XCircle className='w-4 h-4' />
                <span>{processingStatus.failed} failed</span>
              </div>
            )}
          </div>
          <div className='w-full max-w-xs bg-stone-200 rounded-full h-2 overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300'
              style={{
                width: `${
                  (processingStatus.completed / processingStatus.total) * 100
                }%`,
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className='w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Upload className='w-8 h-8 text-amber-600' />
          </div>
          <p className='text-stone-700 font-medium text-lg mb-2'>
            Drop receipts here
          </p>
          <p className='text-stone-400 mb-4'>
            Multiple images or PDFs, up to 10MB each
          </p>
          <input
            type='file'
            accept='image/*,application/pdf'
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className='absolute inset-0 opacity-0 cursor-pointer'
          />
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full text-amber-700 text-sm'>
            <Camera className='w-4 h-4' />
            Supports JPG, PNG, PDF • Batch upload enabled
          </div>
        </>
      )}
    </div>
  );
}
