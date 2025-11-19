'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { getMemoryPalace } from '@/lib/storage';
import { MemoryPalace } from '@/types/types';

export default function PalacePage() {
  const params = useParams();
  const id = params.id as string;
  const [palace, setPalace] = useState<MemoryPalace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getMemoryPalace(id);
      setPalace(data);
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!palace) {
    return <div className="text-white text-center mt-10">Palace not found</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{palace.name}</h1>
        <p className="text-gray-400 mb-8">
          This is where you will build your memory palace.
        </p>

        <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={palace.backgroundImageUrl}
            alt={palace.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Rooms</h2>
          <p className="text-gray-400">
            No rooms added yet. Click on the image to add a room (Coming Soon).
          </p>
        </div>
      </div>
    </main>
  );
}
