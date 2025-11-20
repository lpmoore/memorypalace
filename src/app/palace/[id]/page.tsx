'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getMemoryPalace, saveMemoryPalace } from '@/lib/storage';
import { MemoryPalace, Room } from '@/types/types';
import PalaceImage from '@/components/PalaceImage';
import RoomList from '@/components/RoomList';
import Modal from '@/components/Modal';
import RoomEditor from '@/components/RoomEditor';
import ReviewMode from '@/components/ReviewMode';

export default function PalacePage() {
  const params = useParams();
  const id = params.id as string;
  const [palace, setPalace] = useState<MemoryPalace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Room Modal state
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [pendingRoomPosition, setPendingRoomPosition] = useState<{x: number, y: number} | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Edit Room Modal state
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Review Mode state
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    if (id) {
      const data = getMemoryPalace(id);
      setPalace(data);
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isAddRoomModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddRoomModalOpen]);

  const handleAddRoomClick = (x: number, y: number) => {
    setPendingRoomPosition({ x, y });
    setNewRoomName('');
    setIsAddRoomModalOpen(true);
  };

  const handleConfirmAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!palace || !pendingRoomPosition || !newRoomName.trim()) return;

    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: newRoomName.trim(),
      position: pendingRoomPosition,
      items: [],
    };

    const updatedPalace = {
      ...palace,
      rooms: [...palace.rooms, newRoom],
    };

    setPalace(updatedPalace);
    saveMemoryPalace(updatedPalace);
    setIsAddRoomModalOpen(false);
    setPendingRoomPosition(null);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!palace) return;
    if (!confirm('Are you sure you want to delete this room?')) return;

    const updatedPalace = {
      ...palace,
      rooms: palace.rooms.filter((r) => r.id !== roomId),
    };

    setPalace(updatedPalace);
    saveMemoryPalace(updatedPalace);
  };

  const handleRoomClick = (room: Room) => {
    setEditingRoom(room);
  };

  const handleSaveRoom = (updatedRoom: Room) => {
    if (!palace) return;

    const updatedPalace = {
      ...palace,
      rooms: palace.rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)),
    };

    setPalace(updatedPalace);
    saveMemoryPalace(updatedPalace);
    // We keep the editor open so the user can see their changes, 
    // but we update the local state to reflect the save.
    setEditingRoom(updatedRoom); 
  };

  if (isLoading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!palace) {
    return <div className="text-white text-center mt-10">Palace not found</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      {isReviewMode ? (
        <ReviewMode 
          rooms={palace.rooms} 
          onExit={() => setIsReviewMode(false)} 
        />
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{palace.name}</h1>
              <p className="text-gray-400">
                Click on the image to add rooms to your memory palace. Click a room marker to add items.
              </p>
            </div>
            <button
              onClick={() => setIsReviewMode(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
            >
              <span>🧠</span> Start Review
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PalaceImage 
                imageUrl={palace.backgroundImageUrl}
                rooms={palace.rooms}
                onAddRoom={handleAddRoomClick}
                onRoomClick={handleRoomClick}
              />
            </div>
            
            <div>
              <RoomList 
                rooms={palace.rooms} 
                onDeleteRoom={handleDeleteRoom}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        title="Add New Room"
      >
        <form onSubmit={handleConfirmAddRoom}>
          <div className="mb-4">
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
              Room Name
            </label>
            <input
              ref={inputRef}
              type="text"
              id="roomName"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Entrance Hall"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddRoomModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Room
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        title={editingRoom ? `Editing ${editingRoom.name}` : 'Edit Room'}
      >
        {editingRoom && (
          <RoomEditor
            room={editingRoom}
            onSave={handleSaveRoom}
            onClose={() => setEditingRoom(null)}
          />
        )}
      </Modal>
    </main>
  );
}
