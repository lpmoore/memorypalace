'use client';

import { Room } from '@/types/types';

interface RoomListProps {
  rooms: Room[];
  onDeleteRoom: (id: string) => void;
}

export default function RoomList({ rooms, onDeleteRoom }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-center text-gray-400">
        <p>No rooms yet.</p>
        <p className="text-sm mt-2">Click on the image to add your first room.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Rooms ({rooms.length})</h2>
      </div>
      <ul className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
        {rooms.map((room) => (
          <li key={room.id} className="p-4 hover:bg-gray-750 transition-colors flex justify-between items-center group">
            <div>
              <h3 className="font-medium text-white">{room.name}</h3>
              <p className="text-sm text-gray-400">{room.items.length} items</p>
            </div>
            <button
              onClick={() => onDeleteRoom(room.id)}
              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1"
              aria-label="Delete room"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
