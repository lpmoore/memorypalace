export interface Item {
  id: string;
  description: string;
  association: string;
  imageUrl?: string;
  
  // SRS Stats
  nextReviewDate?: number; // Timestamp
  interval?: number; // Days
  repetition?: number; // Count
  easeFactor?: number; // Multiplier (default 2.5)
}

export interface Room {
  id: string;
  name: string;
  position: { x: number; y: number }; // Percentage coordinates
  items: Item[];
}

export interface MemoryPalace {
  id: string;
  name: string; // This will be the "What would you like to remember?" text initially
  description?: string;
  backgroundImageUrl: string; // URL or base64 data URI
  rooms: Room[];
  createdAt: number;
}
