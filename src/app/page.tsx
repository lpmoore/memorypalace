'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getAllMemoryPalaces, saveMemoryPalace, deleteMemoryPalace } from '@/lib/storage';
import { MemoryPalace } from '@/types/types';

export default function Home() {
  const [palaces, setPalaces] = useState<MemoryPalace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPalaces(getAllMemoryPalaces());
    setIsLoading(false);
  }, []);

  const handleExport = () => {
    const data = JSON.stringify(palaces, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-palace-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const importedPalaces = JSON.parse(json) as MemoryPalace[];
        
        if (!Array.isArray(importedPalaces)) {
          throw new Error('Invalid format: Expected an array');
        }

        // Basic validation
        if (importedPalaces.length > 0 && !importedPalaces[0].id) {
           throw new Error('Invalid format: Missing IDs');
        }

        // Save each imported palace
        importedPalaces.forEach(palace => saveMemoryPalace(palace));
        
        // Refresh state
        setPalaces(getAllMemoryPalaces());
        alert(`Successfully imported ${importedPalaces.length} memory palaces!`);
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data. Please ensure the file is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this memory palace? This action cannot be undone.')) {
      deleteMemoryPalace(id);
      setPalaces(getAllMemoryPalaces());
    }
  };

  const totalItems = palaces.reduce((acc, palace) => {
    return acc + palace.rooms.reduce((rAcc, room) => rAcc + room.items.length, 0);
  }, 0);

  return (
    <div className='max-w-6xl mx-auto p-8'>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className='text-4xl font-serif font-bold text-white text-shadow-lg'>
            Your Memory Palaces
          </h2>
          {!isLoading && (
            <p className="text-gray-400 mt-2">
              <span className="text-blue-400 font-bold">{palaces.length}</span> Palaces • <span className="text-green-400 font-bold">{totalItems}</span> Items Learned
            </p>
          )}
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors border border-gray-600 text-sm"
            title="Download backup"
          >
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:text-white transition-colors border border-gray-600 text-sm"
            title="Restore from backup"
          >
            Import
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
          <Link 
            href="/new-memory"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-lg text-sm flex items-center"
          >
            + New Palace
          </Link>
        </div>
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
              className="group block bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all hover:shadow-2xl hover:-translate-y-1 relative"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={palace.backgroundImageUrl} 
                  alt={palace.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                <button
                  onClick={(e) => handleDelete(e, palace.id)}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                  title="Delete Palace"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
                  {palace.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {palace.rooms.length} {palace.rooms.length === 1 ? 'Room' : 'Rooms'} • {palace.rooms.reduce((acc, r) => acc + r.items.length, 0)} Items
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
