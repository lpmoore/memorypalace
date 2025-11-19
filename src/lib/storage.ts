import { MemoryPalace } from '@/types/types';

const STORAGE_KEY = 'memory_palaces';

export const saveMemoryPalace = (palace: MemoryPalace): void => {
  if (typeof window === 'undefined') return;

  const palaces = getAllMemoryPalaces();
  const existingIndex = palaces.findIndex((p) => p.id === palace.id);

  if (existingIndex >= 0) {
    palaces[existingIndex] = palace;
  } else {
    palaces.push(palace);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(palaces));
};

export const getMemoryPalace = (id: string): MemoryPalace | null => {
  if (typeof window === 'undefined') return null;

  const palaces = getAllMemoryPalaces();
  return palaces.find((p) => p.id === id) || null;
};

export const getAllMemoryPalaces = (): MemoryPalace[] => {
  if (typeof window === 'undefined') return [];

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data) as MemoryPalace[];
  } catch (error) {
    console.error('Failed to parse memory palaces from local storage:', error);
    return [];
  }
};

export const deleteMemoryPalace = (id: string): void => {
  if (typeof window === 'undefined') return;

  const palaces = getAllMemoryPalaces();
  const filteredPalaces = palaces.filter((p) => p.id !== id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPalaces));
};
