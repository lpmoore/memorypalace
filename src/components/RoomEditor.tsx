'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Room, Item } from '@/types/types';

interface RoomEditorProps {
  room: Room;
  onSave: (updatedRoom: Room) => void;
  onClose: () => void;
}

export default function RoomEditor({ room, onSave, onClose }: RoomEditorProps) {
  const [items, setItems] = useState<Item[]>(room.items);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemAssociation, setNewItemAssociation] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDescription.trim() || !newItemAssociation.trim()) return;

    const newItem: Item = {
      id: crypto.randomUUID(),
      description: newItemDescription.trim(),
      association: newItemAssociation.trim(),
      imageUrl: newItemImageUrl,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onSave({ ...room, items: updatedItems });
    
    setNewItemDescription('');
    setNewItemAssociation('');
    setNewItemImageUrl('');
    setActiveImage(newItemImageUrl || null); // Show the new image if it exists
    descriptionInputRef.current?.focus();
  };

  const handleDeleteItem = (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    onSave({ ...room, items: updatedItems });
    if (activeImage === items.find(i => i.id === itemId)?.imageUrl) {
      setActiveImage(null);
    }
  };

  const handleEnhance = async () => {
    if (!newItemDescription.trim() || !newItemAssociation.trim()) return;

    setIsEnhancing(true);
    try {
      // Step 1: Enhance Text
      const textResponse = await fetch('/api/enhance-imagery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: newItemDescription,
          association: newItemAssociation,
        }),
      });

      if (!textResponse.ok) {
        const errorData = await textResponse.json();
        if (errorData.code === 'INSUFFICIENT_QUOTA') {
          alert('OpenAI API quota exceeded. Please check your billing details at platform.openai.com.');
          setIsEnhancing(false);
          return;
        }
        throw new Error('Failed to enhance text');
      }

      const textData = await textResponse.json();
      if (textData.enhancedAssociation) {
        setNewItemAssociation(textData.enhancedAssociation);
      }

      // Step 2: Generate Image (using the new enhanced text)
      const imageResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textData.enhancedAssociation || newItemAssociation,
        }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        if (errorData.code === 'POLICY_VIOLATION') {
          alert('The image generation was blocked by safety filters. Please try a different description.');
          setIsEnhancing(false);
          return;
        }
        if (errorData.code === 'INSUFFICIENT_QUOTA') {
          alert('OpenAI API quota exceeded. Please check your billing details at platform.openai.com.');
          setIsEnhancing(false);
          return;
        }
        throw new Error('Failed to generate image');
      }

      const imageData = await imageResponse.json();
      if (imageData.imageUrl) {
        setNewItemImageUrl(imageData.imageUrl);
        setActiveImage(imageData.imageUrl);
      }

    } catch (error) {
      console.error('Error enhancing imagery:', error);
      if (error instanceof Error && error.message !== 'Failed to generate image') {
         // Only alert if it wasn't the image generation that failed (since we might want to keep the text)
         // Actually, if image fails, we still have the text, so maybe just log it or show a smaller error?
         // For now, let's keep it simple and alert if anything critical fails.
         alert('Failed to enhance imagery. Please try again.');
      }
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">


      <div className="flex-grow overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* Left Side: Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 border-r border-gray-700">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center italic mt-10">No items in this room yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li 
                  key={item.id} 
                  className="bg-gray-800 p-3 rounded-lg border border-gray-700 group relative hover:border-blue-500 transition-colors cursor-pointer"
                  onMouseEnter={() => item.imageUrl && setActiveImage(item.imageUrl)}
                >
                  <div className="flex gap-4">
                    <div className="pr-8">
                      <p className="font-medium text-white">{item.description}</p>
                      <p className="text-sm text-gray-400 mt-1">{item.association}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="absolute top-2 right-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete item"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Side: Preview Area */}
        <div className="w-full md:w-1/2 bg-gray-900 p-4 flex flex-col items-center justify-center border-l border-gray-800">
          {activeImage ? (
            <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={activeImage} 
                 alt="Preview" 
                 className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
               />
            </div>
          ) : (
            <div className="text-gray-600 text-center">
              <p className="text-6xl mb-4">👁️</p>
              <p>Hover over an item to preview its image</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Add New Item</h3>
        <form onSubmit={handleAddItem} className="space-y-3">
          <div>
            <input
              ref={descriptionInputRef}
              type="text"
              placeholder="Item Description (e.g., Piano)"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Association (e.g., Playing a concerto)"
              value={newItemAssociation}
              onChange={(e) => setNewItemAssociation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
            />
            <button
              type="button"
              onClick={handleEnhance}
              disabled={isEnhancing || !newItemDescription.trim() || !newItemAssociation.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-400 disabled:text-gray-600 transition-colors"
              title="Enhance with AI"
            >
              {isEnhancing ? (
                <span className="animate-spin block">✨</span>
              ) : (
                <span>✨</span>
              )}
            </button>
          </div>
          
          {/* We don't need to show the small thumbnail here anymore since we have the big preview */}
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={!newItemDescription.trim() || !newItemAssociation.trim() || !newItemImageUrl}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md transition-colors text-sm font-medium"
            >
              {newItemImageUrl ? 'Add Item' : 'Generate Image to Add'}
            </button>
            {!newItemImageUrl && newItemDescription.trim() && newItemAssociation.trim() && (
              <button
                type="submit"
                className="ml-4 text-xs text-gray-400 hover:text-white underline"
              >
                Skip Image
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
