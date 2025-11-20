'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllMemoryPalaces } from '@/lib/storage';
import { MemoryPalace } from '@/types/types';

export default function Home() {
  const [palaces, setPalaces] = useState<MemoryPalace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPalaces(getAllMemoryPalaces());
    setIsLoading(false);
  }, []);

  return (
    <div className='max-w-6xl mx-auto p-8'>
      <div className="flex justify-between items-center mb-8">
        <h2 className='text-4xl font-serif font-bold text-white text-shadow-lg'>
          Your Memory Palaces
        </h2>
        <Link 
          href="/new-memory"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-lg"
        >
          Create New Palace
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 mt-12">Loading...</div>
      ) : palaces.length === 0 ? (
        <div className='text-center p-10 bg-gray-800 rounded-xl border border-gray-700'>
          <h3 className='text-2xl font-bold text-white mb-4'>
            Welcome to Your Memory Palace
          </h3>
          <p className='text-xl text-gray-300 mb-8'>
            Unlock the vast potential of your mind. Create, explore, and strengthen
            your memories.
          </p>
          <Link 
            href="/new-memory"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 font-bold shadow-xl"
          >
            Start Your First Journey
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {palaces.map((palace) => (
            <Link 
              key={palace.id} 
              href={`/palace/${palace.id}`}
              className="group block bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={palace.backgroundImageUrl} 
                  alt={palace.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {palace.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {palace.rooms.length} {palace.rooms.length === 1 ? 'Room' : 'Rooms'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
