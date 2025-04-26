import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const StreamForm = ({ addStream, isLoading }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!name.trim()) {
      setError('Stream name is required');
      return false;
    }
    if (!url.trim()) {
      setError('Stream URL is required');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    try {
      addStream(name.trim(), url.trim());
      setName('');
      setUrl('');
    } catch (error) {
      setError('Failed to add stream');
      console.error('Add stream error:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add New Stream</h2>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stream Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Kitchen Camera"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stream URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="rtsp://example.com/stream or webcam index (0, 1)"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter RTSP URL or webcam index (0 for default camera)
          </p>
        </div>
        
        <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition"
            >
            <Plus size={16} />
            {isLoading ? 'Adding...' : 'Add Stream'}
        </button>

      </form>
    </div>
  );
};

export default StreamForm;
