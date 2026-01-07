'use client';

import { useState, useEffect } from 'react';

export interface Settings {
  family_members: string[];
  default_ratio: Record<string, number>;
}

export function useLocalSettings() {
  const [settings, setSettings] = useState<Settings>({
    family_members: ['You', 'Partner'],
    default_ratio: { You: 50, Partner: 50 },
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/local/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (updates: Partial<Settings>) => {
    const response = await fetch('/api/local/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    setSettings(prev => ({ ...prev, ...updates }));
    return data.settings;
  };

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
}
