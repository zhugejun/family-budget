'use client';

import { useState, useEffect } from 'react';

export interface ReceiptImage {
  id: string;
  receipt_group: string;
  image_path: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  uploaded_at: string;
}

export function useLocalReceiptImages() {
  const [images, setImages] = useState<ReceiptImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/local/receipt-images');
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching receipt images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const addImage = async (image: Omit<ReceiptImage, 'id' | 'uploaded_at'>) => {
    const response = await fetch('/api/local/receipt-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(image),
    });
    const data = await response.json();
    setImages(prev => [...prev, data.image]);
    return data.image;
  };

  const deleteImage = async (id: string): Promise<boolean> => {
    try {
      await fetch(`/api/local/receipt-images?id=${id}`, { method: 'DELETE' });
      setImages(prev => prev.filter(img => img.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting receipt image:', error);
      return false;
    }
  };

  const getImagesByGroup = (receiptGroup: string) => {
    return images.filter(img => img.receipt_group === receiptGroup);
  };

  return {
    images,
    loading,
    addImage,
    deleteImage,
    getImagesByGroup,
    refetch: fetchImages,
  };
}
