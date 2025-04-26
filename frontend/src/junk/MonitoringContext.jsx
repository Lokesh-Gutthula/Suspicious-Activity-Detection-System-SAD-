import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { startMonitoring, stopMonitoring } from '../api';
import { createStream, deleteStream, getUserStreams } from '../api'; // 👈 New API helpers

const MonitoringContext = createContext(undefined);

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (context === undefined) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};

export const MonitoringProvider = ({ children }) => {
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    setIsLoading(true);
    try {
      const res = await getUserStreams();
      const loadedStreams = res.streams.map(stream => ({
        id: stream.id,
        name: stream.name,
        url: stream.url,
        isActive: stream.is_active,
      }));
      setStreams(loadedStreams);
    } catch (err) {
      console.error('Error loading streams:', err);
      toast.error('Failed to load streams');
    } finally {
      setIsLoading(false);
    }
  };

  const addStream = async (name, url) => {
    setIsLoading(true);
    try {
      const response = await createStream(name, url);
      const newStream = {
        id: response.stream_id,
        name,
        url,
        isActive: false
      };
      setStreams(prev => [...prev, newStream]);
      toast.success(`Stream "${name}" added`);
    } catch (error) {
      console.error('Add stream error:', error);
      toast.error('Failed to add stream');
    } finally {
      setIsLoading(false);
    }
  };

  const removeStream = async (id) => {
    setIsLoading(true);
    try {
      await deleteStream(id);
      setStreams(prev => prev.filter(s => s.id !== id));
      toast.success('Stream removed');
    } catch (error) {
      console.error('Delete stream error:', error);
      toast.error('Failed to remove stream');
    } finally {
      setIsLoading(false);
    }
  };

  const startStream = async (id) => {
    setIsLoading(true);
    try {
      const stream = streams.find(s => s.id === id);
      if (!stream) throw new Error('Stream not found');

      await startMonitoring(stream.name, stream.url); // backend will start thread by name/url

      setStreams(prev =>
        prev.map(s => (s.id === id ? { ...s, isActive: true } : s))
      );
      toast.success(`Monitoring started: ${stream.name}`);
    } catch (error) {
      console.error('Start monitoring error:', error);
      toast.error('Failed to start monitoring');
    } finally {
      setIsLoading(false);
    }
  };

  const stopStream = async (id) => {
    setIsLoading(true);
    try {
      const stream = streams.find(s => s.id === id);
      if (!stream) throw new Error('Stream not found');

      await stopMonitoring(stream.name); // backend stops thread via name

      setStreams(prev =>
        prev.map(s => (s.id === id ? { ...s, isActive: false } : s))
      );
      toast.success(`Monitoring stopped: ${stream.name}`);
    } catch (error) {
      console.error('Stop monitoring error:', error);
      toast.error('Failed to stop monitoring');
    } finally {
      setIsLoading(false);
    }
  };

  const activeStreams = streams.filter(s => s.isActive);

  return (
    <MonitoringContext.Provider
      value={{
        streams,
        activeStreams,
        isLoading,
        addStream,
        removeStream,
        startStream,
        stopStream,
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};
