'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  Loader2,
  Camera,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  Check,
  ImageIcon,
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

interface FileWithPreview {
  file: File;
  preview: string;
}

export function ReceiptUploadZone({
  isProcessing,
  onMultipleImageUpload,
  processingStatus,
}: ReceiptUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(
      (file) =>
        file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    // Create preview URLs for valid files
    const filesWithPreviews = validFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '', // No preview for PDFs
    }));

    setSelectedFiles((prev) => [...prev, ...filesWithPreviews]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      // Revoke object URL to prevent memory leak
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const confirmUpload = useCallback(() => {
    const files = selectedFiles.map((f) => f.file);
    onMultipleImageUpload(files);
    // Clean up preview URLs
    selectedFiles.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
  }, [selectedFiles, onMultipleImageUpload]);

  const cancelUpload = useCallback(() => {
    // Clean up preview URLs
    selectedFiles.forEach((f) => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
  }, [selectedFiles]);

  // Show file preview if files are selected
  if (selectedFiles.length > 0 && !isProcessing) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-stone-800'>
            Review Files ({selectedFiles.length})
          </h3>
          <button
            onClick={cancelUpload}
            className='text-sm text-stone-500 hover:text-stone-700'
          >
            Cancel
          </button>
        </div>

        {/* File Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
          {selectedFiles.map((fileWithPreview, index) => (
            <div
              key={index}
              className='relative group bg-white rounded-lg border-2 border-stone-200 overflow-hidden aspect-square'
            >
              {fileWithPreview.preview ? (
                <img
                  src={fileWithPreview.preview}
                  alt={fileWithPreview.file.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex flex-col items-center justify-center bg-stone-50'>
                  <FileText className='w-12 h-12 text-stone-400 mb-2' />
                  <span className='text-xs text-stone-500'>PDF</span>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => removeFile(index)}
                className='absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'
              >
                <X className='w-4 h-4' />
              </button>

              {/* File name tooltip */}
              <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <p className='text-white text-xs truncate'>
                  {fileWithPreview.file.name}
                </p>
              </div>
            </div>
          ))}

          {/* Add more button */}
          <label className='relative aspect-square border-2 border-dashed border-stone-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer flex flex-col items-center justify-center'>
            <Upload className='w-8 h-8 text-stone-400 mb-1' />
            <span className='text-xs text-stone-500'>Add more</span>
            <input
              type='file'
              accept='image/*,application/pdf'
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className='absolute inset-0 opacity-0 cursor-pointer'
            />
          </label>
        </div>

        {/* Confirm Button */}
        <button
          onClick={confirmUpload}
          className='w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg transition-all'
        >
          <Check className='w-5 h-5' />
          Process {selectedFiles.length} Receipt
          {selectedFiles.length !== 1 ? 's' : ''}
        </button>
      </div>
    );
  }

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
