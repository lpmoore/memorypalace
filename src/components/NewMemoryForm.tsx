'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { saveMemoryPalace } from '@/lib/storage';
import { MemoryPalace } from '@/types/types';

export default function NewMemoryForm() {
  const router = useRouter();
  const [memory, setMemory] = useState('');
  const [imageSource, setImageSource] = useState('upload');
  const [imageStyle, setImageStyle] = useState('modern');
  const [imageColor, setImageColor] = useState('blue');
  const [generatedImage, setGeneratedImage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/generate-image?style=${imageStyle}&color=${imageColor}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const data = await response.json();
      setGeneratedImage(data.url);
    } catch (error) {
      console.error('Error in handleGenerateImage:', error);
      setError('Could not generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!memory.trim()) {
      setError('Please enter what you want to remember.');
      return;
    }

    let finalImage = '';
    if (imageSource === 'upload') {
      if (!uploadedImage) {
        setError('Please upload an image.');
        return;
      }
      finalImage = uploadedImage;
    } else {
      if (!generatedImage) {
        setError('Please generate an image first.');
        return;
      }
      finalImage = generatedImage;
    }

    const newPalace: MemoryPalace = {
      id: crypto.randomUUID(),
      name: memory,
      backgroundImageUrl: finalImage,
      rooms: [],
      createdAt: Date.now(),
    };

    try {
      saveMemoryPalace(newPalace);
      router.push(`/palace/${newPalace.id}`);
    } catch (err) {
      console.error('Failed to save memory palace:', err);
      setError('Failed to save memory palace. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-xl mx-auto p-4 bg-gray-800 rounded-lg shadow-md'
    >
      <div className='mb-4'>
        <label
          htmlFor='memory'
          className='block text-lg font-medium text-gray-300 mb-2'
        >
          What would you like to remember?
        </label>
        <textarea
          id='memory'
          value={memory}
          onChange={(e) => setMemory(e.target.value)}
          className='w-full p-2 bg-gray-700 text-white rounded-md'
          rows={4}
          placeholder='E.g., The order of a deck of cards, a speech, or a list of groceries.'
        />
      </div>

      <div className='mb-4'>
        <label className='block text-lg font-medium text-gray-300 mb-2'>
          Palace Image
        </label>
        <div className='flex items-center mb-2'>
          <input
            type='radio'
            id='upload'
            name='imageSource'
            value='upload'
            checked={imageSource === 'upload'}
            onChange={() => setImageSource('upload')}
            className='mr-2'
          />
          <label htmlFor='upload' className='text-gray-300'>Upload an image</label>
        </div>
        <div className='flex items-center'>
          <input
            type='radio'
            id='generate'
            name='imageSource'
            value='generate'
            checked={imageSource === 'generate'}
            onChange={() => setImageSource('generate')}
            className='mr-2'
          />
          <label htmlFor='generate' className='text-gray-300'>Generate an image</label>
        </div>
      </div>

      {imageSource === 'upload' && (
        <div className='mb-4'>
          <input
            type='file'
            accept='image/*'
            onChange={handleFileUpload}
            className='w-full p-2 bg-gray-700 text-white rounded-md'
          />
          {uploadedImage && (
            <div className='mt-4'>
              <Image
                src={uploadedImage}
                alt='Uploaded Palace'
                className='w-full h-auto rounded-md'
                width={800}
                height={600}
              />
            </div>
          )}
        </div>
      )}

      {imageSource === 'generate' && (
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div>
            <label
              htmlFor='style'
              className='block text-sm font-medium text-gray-300 mb-1'
            >
              Style
            </label>
            <select
              id='style'
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value)}
              className='w-full p-2 bg-gray-700 text-white rounded-md'
            >
              <option value='modern'>Modern</option>
              <option value='classic'>Classic</option>
              <option value='fantasy'>Fantasy</option>
            </select>
          </div>
          <div>
            <label
              htmlFor='color'
              className='block text-sm font-medium text-gray-300 mb-1'
            >
              Color
            </label>
            <select
              id='color'
              value={imageColor}
              onChange={(e) => setImageColor(e.target.value)}
              className='w-full p-2 bg-gray-700 text-white rounded-md'
            >
              <option value='blue'>Blue</option>
              <option value='red'>Red</option>
              <option value='green'>Green</option>
            </select>
          </div>
        </div>
      )}

      {imageSource === 'generate' && (
        <div className='mb-4'>
          <button
            type='button'
            onClick={handleGenerateImage}
            className='w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md text-white font-bold mb-4'
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
          
          {generatedImage && (
            <div className='mt-4'>
              {/* Using img tag instead of Next.js Image to avoid potential optimization issues with Pexels URLs */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedImage}
                alt='Generated Palace'
                className='w-full h-auto rounded-md'
              />
            </div>
          )}
        </div>
      )}

      {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

      <button
        type='submit'
        className='w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold'
      >
        Next
      </button>
    </form>
  );
}
