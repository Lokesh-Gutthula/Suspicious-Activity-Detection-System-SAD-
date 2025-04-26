import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import Navbar from '../components/Navbar';
import { createStream, deleteStream, getUserStreams, startMonitoring, stopMonitoring } from '../api';

import StreamForm from '../components/Monitoring/StreamForm';
import StreamList from '../components/Monitoring/StreamList';

const MonitoringPage = () => {
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    setIsLoading(true);
    try {
      const res = await getUserStreams();
      const loaded = res.streams.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        isActive: s.is_active,
      }));
      setStreams(loaded);
    } catch (err) {
      console.error('Failed to load streams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addStream = async (name, url) => {
    setIsLoading(true);
    try {
      const result = await createStream(name, url);
      setStreams((prev) => [
        ...prev,
        { id: result.stream_id, name, url, isActive: false },
      ]);
    } catch (err) {
      console.error('Add stream error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeStream = async (id) => {
    setIsLoading(true);
    try {
      await deleteStream(id);
      setStreams((prev) => prev.filter((s) => s.id !== id));
      alert('Stream deleted successfully');
    } catch (err) {
      console.error('Delete stream error:', err);
      alert(`Failed to delete stream: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startStream = async (id) => {
    setIsLoading(true);
    const stream = streams.find((s) => s.id === id);
    try {
      await startMonitoring(stream.name, stream.url);
      setStreams((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: true } : s))
      );
    } catch (err) {
      console.error('Start monitoring error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async (id) => {
    setIsLoading(true);
    const stream = streams.find((s) => s.id === id);
    try {
      await stopMonitoring(stream.name);
      setStreams((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: false } : s))
      );
    } catch (err) {
      console.error('Stop monitoring error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black space-y-6">
      <Navbar />
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Camera Monitoring</h1>
        <p className="text-gray-400">Add and manage your security camera streams</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="bg-zinc-900 text-white rounded-lg shadow-md p-4">
            <StreamForm addStream={addStream} isLoading={isLoading} />
          </div>

          {streams.length > 0 && (
            <div className="mt-6 bg-zinc-900 text-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-2">Monitoring Status</h2>
              <div className="text-sm text-gray-400">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Active Cameras: {streams.filter((s) => s.isActive).length}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span>Inactive Cameras: {streams.filter((s) => !s.isActive).length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Camera Streams
              </h2>
              {isLoading && (
                <div className="flex justify-center items-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>

            {streams.length === 0 ? (
              <div className="text-center py-8">
                <Camera size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-gray-900 dark:text-white font-medium mb-1">No streams added yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Add your first stream using the form on the left
                </p>
              </div>
            ) : (
              <StreamList
                streams={streams}
                isLoading={isLoading}
                startStream={startStream}
                stopStream={stopStream}
                removeStream={removeStream}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
