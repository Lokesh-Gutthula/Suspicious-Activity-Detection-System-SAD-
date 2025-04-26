import React from 'react';
import { Camera, Play, Square, Trash } from 'lucide-react';


const StreamList = ({ streams, startStream, stopStream, removeStream, isLoading }) => {

  if (streams.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <Camera size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No streams</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add a stream to start monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {streams.map((stream) => (
        <StreamCard
          key={stream.id}
          stream={stream}
          onStart={() => startStream(stream.id)}
          onStop={() => stopStream(stream.id)}
          onRemove={() => removeStream(stream.id)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

const StreamCard = ({ stream, onStart, onStop, onRemove, isLoading }) => {
  return (
    <div className="bg-zinc-900 text-white rounded-lg shadow-md p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{stream.name}</h3>
        {stream.isActive && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
        )}
      </div>

      {/* URL Display */}
      <div className="bg-gray-800 rounded p-2 text-xs font-mono text-gray-300 overflow-hidden">
        {stream.url}
      </div>

      {/* Status */}
      <div className="flex items-center text-sm text-gray-400">
        <Camera size={16} className="mr-2" />
        {stream.isActive ? 'Monitoring active' : 'Monitoring inactive'}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between gap-2">
        {stream.isActive ? (
          <button
            onClick={onStop}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded disabled:opacity-50"
          >
            <Square size={16} className="mr-2" /> Stop
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded disabled:opacity-50"
          >
            <Play size={16} className="mr-2" /> Start
          </button>
        )}

        <button
          onClick={onRemove}
          disabled={isLoading}
          className="flex items-center px-3 py-1.5 border border-gray-400 hover:border-red-500 text-sm rounded text-white disabled:opacity-50"
        >
          <Trash size={16} className="mr-2" /> Remove
        </button>
      </div>
    </div>
  );
};

export default StreamList;
