'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function NewMemoryForm() {
  const [memory, setMemory] = useState('');
  const [imageSource, setImageSource] = useState('upload');
  const [imageStyle, setImageStyle] = useState('modern');
  const [imageColor, setImageColor] = useState('blue');
  const [generatedImage, setGeneratedImage] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(memory, imageSource, imageStyle, imageColor);
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
          <label htmlFor='upload'>Upload an image</label>
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
          <label htmlFor='generate'>Generate an image</label>
        </div>
      </div>

      {imageSource === 'upload' && (
        <div className='mb-4'>
          <input
            type='file'
            className='w-full p-2 bg-gray-700 text-white rounded-md'
          />
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
              <option value=''>Select a style</option>
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
              <option value=''>Select a color</option>
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
          {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
          {generatedImage && (
            <div className='mt-4'>
              <Image
                src={generatedImage}
                alt='Generated Palace'
                className='w-full h-auto rounded-md'
                width={800}
                height={600}
              />
            </div>
          )}
        </div>
      )}

      <button
        type='submit'
        className='w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-bold'
      >
        Next
      </button>
    </form>
  );
}
