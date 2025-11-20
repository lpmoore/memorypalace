import React, { useState, useEffect } from 'react';
import { Room, Item } from '@/types/types';
import { calculateSRS, Grade, getNextReviewText } from '@/lib/srs';
import { saveMemoryPalace, getAllMemoryPalaces } from '@/lib/storage';

interface ReviewModeProps {
  rooms: Room[];
  onExit: () => void;
}

interface ReviewItem extends Item {
  roomName: string;
  roomId: string;
}

export default function ReviewMode({ rooms, onExit }: ReviewModeProps) {
  // Flatten all items into a single list with their room context
  // Filter for items due for review (or new items)
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const allItems: ReviewItem[] = rooms.flatMap(room => 
      room.items.map(item => ({ ...item, roomName: room.name, roomId: room.id }))
    );

    // Prioritize items due for review
    const dueItems = allItems.filter(item => !item.nextReviewDate || item.nextReviewDate <= now);
    
    // If no items are due, maybe show some future ones? Or just show all for now if it's empty?
    // Let's stick to due items. If empty, we can offer to "Cram" (review all).
    if (dueItems.length > 0) {
      // Sort by due date (oldest due first)
      dueItems.sort((a, b) => (a.nextReviewDate || 0) - (b.nextReviewDate || 0));
      setReviewQueue(dueItems);
    } else {
      // Cram mode: Review everything if nothing is strictly due
      setReviewQueue(allItems);
    }
  }, [rooms]);

  const currentItem = reviewQueue[currentIndex];

  const handleGrade = (grade: Grade) => {
    if (!currentItem) return;

    // Calculate new stats
    const updatedItem = calculateSRS(currentItem, grade);

    // Save to local storage
    // We need to find the palace, room, and item and update it.
    // This is a bit heavy but necessary for persistence.
    const palaces = getAllMemoryPalaces();
    // Find the palace that contains this room/item. 
    // Since we don't have the palace ID passed in props directly, we might need to search.
    // Optimization: Pass palaceId to ReviewMode or search.
    // For now, let's assume we are in the context of a single palace page, 
    // but ReviewMode props only have `rooms`. 
    // Actually, `rooms` are passed from `PalacePage`. We should probably pass the whole palace or ID.
    // However, we can just search all palaces for the matching room ID.
    
    let palaceUpdated = false;
    const updatedPalaces = palaces.map(palace => {
      const roomIndex = palace.rooms.findIndex(r => r.id === currentItem.roomId);
      if (roomIndex !== -1) {
        const room = palace.rooms[roomIndex];
        const itemIndex = room.items.findIndex(i => i.id === currentItem.id);
        if (itemIndex !== -1) {
          // Found it! Update the item.
          const newItems = [...room.items];
          newItems[itemIndex] = { ...updatedItem }; // Remove extra ReviewItem props
          delete (newItems[itemIndex] as any).roomName;
          delete (newItems[itemIndex] as any).roomId;
          
          palace.rooms[roomIndex] = { ...room, items: newItems };
          palaceUpdated = true;
        }
      }
      return palace;
    });

    if (palaceUpdated) {
      // Save all (or just the one)
      updatedPalaces.forEach(p => saveMemoryPalace(p));
    }

    // Move to next item
    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setCompletedCount(prev => prev + 1);
    } else {
      // End of queue
      if (confirm(`Review complete! You reviewed ${completedCount + 1} items. Restart?`)) {
        // Ideally we would refresh the queue based on new stats, but for now just restart
        setCurrentIndex(0);
        setIsRevealed(false);
        setCompletedCount(0);
      } else {
        onExit();
      }
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (!isRevealed) {
          setIsRevealed(true);
        }
      } else if (e.key === 'Escape') {
        onExit();
      } else if (isRevealed) {
        // Grading shortcuts
        if (e.key === '1') handleGrade(0); // Again
        if (e.key === '2') handleGrade(3); // Hard
        if (e.key === '3') handleGrade(4); // Good
        if (e.key === '4') handleGrade(5); // Easy
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, currentIndex, reviewQueue.length, onExit]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentItem) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No items to review!</h2>
          <button onClick={onExit} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
        <div>
          <h2 className="text-xl font-bold">Review Mode (SRS)</h2>
          <p className="text-sm text-gray-400">
            Item {currentIndex + 1} of {reviewQueue.length} • {currentItem.roomName}
          </p>
        </div>
        <button 
          onClick={onExit}
          className="px-3 py-1 text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-400 transition-colors"
        >
          Exit (Esc)
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700 min-h-[400px] flex flex-col">
          
          {/* Question / Prompt Side */}
          <div className="p-8 text-center flex-grow flex flex-col justify-center items-center border-b border-gray-700">
            <h3 className="text-gray-400 uppercase tracking-wider text-sm mb-2">Item Description</h3>
            <p className="text-3xl font-bold mb-8">{currentItem.description}</p>
            
            {!isRevealed && (
              <button 
                onClick={() => setIsRevealed(true)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105"
              >
                Reveal Memory (Space)
              </button>
            )}
          </div>

          {/* Answer / Reveal Side */}
          {isRevealed && (
            <div className="p-8 bg-gray-900 flex flex-col md:flex-row gap-6 animate-fadeIn">
              <div className="flex-1">
                <h3 className="text-gray-400 uppercase tracking-wider text-sm mb-2">Association</h3>
                <p className="text-xl leading-relaxed text-blue-300">{currentItem.association}</p>
                <div className="mt-4 text-xs text-gray-500">
                  Next review: {currentItem.interval ? getNextReviewText(currentItem.interval) : 'New'}
                </div>
              </div>
              {currentItem.imageUrl && (
                <div className="flex-shrink-0 w-full md:w-48 h-48 bg-black rounded-lg overflow-hidden border border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={currentItem.imageUrl} 
                    alt="Visual memory aid" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-center gap-4">
        {!isRevealed ? (
          <button 
            onClick={() => setIsRevealed(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors w-full max-w-xs"
          >
            Reveal
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-4 w-full max-w-2xl">
            <button 
              onClick={() => handleGrade(0)}
              className="flex flex-col items-center p-2 bg-red-900/50 hover:bg-red-900 border border-red-700 rounded-lg transition-colors"
            >
              <span className="font-bold text-red-200">Again (1)</span>
              <span className="text-xs text-red-400">&lt; 1m</span>
            </button>
            <button 
              onClick={() => handleGrade(3)}
              className="flex flex-col items-center p-2 bg-yellow-900/50 hover:bg-yellow-900 border border-yellow-700 rounded-lg transition-colors"
            >
              <span className="font-bold text-yellow-200">Hard (2)</span>
              <span className="text-xs text-yellow-400">2d</span>
            </button>
            <button 
              onClick={() => handleGrade(4)}
              className="flex flex-col items-center p-2 bg-green-900/50 hover:bg-green-900 border border-green-700 rounded-lg transition-colors"
            >
              <span className="font-bold text-green-200">Good (3)</span>
              <span className="text-xs text-green-400">4d</span>
            </button>
            <button 
              onClick={() => handleGrade(5)}
              className="flex flex-col items-center p-2 bg-blue-900/50 hover:bg-blue-900 border border-blue-700 rounded-lg transition-colors"
            >
              <span className="font-bold text-blue-200">Easy (4)</span>
              <span className="text-xs text-blue-400">7d</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
