'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { ReceiptImage } from '@/lib/calculations';

export function useReceiptImages(userId: string | undefined) {
  const [images, setImages] = useState<ReceiptImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all receipt images for the user
  const fetchImages = async () => {
    if (!userId) {
      setImages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('receipt_images')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setImages(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching receipt images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [userId]);

  // Upload a new receipt image
  const uploadImage = async (file: File, receiptGroup: string): Promise<ReceiptImage | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('receiptGroup', receiptGroup);

      const response = await fetch('/api/receipts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { image } = await response.json();
      
      // Add to local state
      setImages(prev => [image, ...prev]);
      
      return image;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      return null;
    }
  };

  // Delete a receipt image
  const deleteImage = async (imageId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/receipts?id=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      
      return true;
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      return false;
    }
  };

  // Get images for a specific receipt group
  const getImagesByGroup = (receiptGroup: string): ReceiptImage[] => {
    return images.filter(img => img.receipt_group === receiptGroup);
  };

  // Get a single image by ID
  const getImageById = (imageId: string): ReceiptImage | undefined => {
    return images.find(img => img.id === imageId);
  };

  return {
    images,
    loading,
    error,
    uploadImage,
    deleteImage,
    getImagesByGroup,
    getImageById,
    refetch: fetchImages,
  };
}
