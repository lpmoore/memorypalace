'use client';

import React, { useRef } from 'react';
import { Room } from '@/types/types';
import RoomMarker from './RoomMarker';

interface PalaceImageProps {
  imageUrl: string;
  rooms: Room[];
  onAddRoom: (x: number, y: number) => void;
  onRoomClick?: (room: Room) => void;
}

export default function PalaceImage({ imageUrl, rooms, onAddRoom, onRoomClick }: PalaceImageProps) {
  const imageRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddRoom(x, y);
  };

  return (
    <div 
      ref={imageRef}
      className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 cursor-crosshair"
      onClick={handleImageClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Memory Palace"
        className="w-full h-full object-cover pointer-events-none select-none"
      />
      
      {rooms.map((room) => (
        <RoomMarker 
          key={room.id} 
          room={room} 
          onClick={onRoomClick}
        />
      ))}
      
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded pointer-events-none">
        Click anywhere to add a room
      </div>
    </div>
  );
}
