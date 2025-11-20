'use client';

import { Room } from '@/types/types';

interface RoomMarkerProps {
  room: Room;
  onClick?: (room: Room) => void;
}

export default function RoomMarker({ room, onClick }: RoomMarkerProps) {
  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style={{ left: `${room.position.x}%`, top: `${room.position.y}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(room);
      }}
    >
      <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:bg-blue-400 transition-colors">
        <span className="text-xs font-bold text-white">{room.items.length}</span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {room.name}
      </div>
    </div>
  );
}
