import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import { useMonitoring } from '../junk/MonitoringContext';

const AlertsPage = () => {
  const { detections, refreshDetections, isLoading } = useMonitoring();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [filteredDetections, setFilteredDetections] = useState([]);

  const uniqueLabels = [...new Set(detections.map(d => d.labels))];

  useEffect(() => {
    refreshDetections();
  }, [refreshDetections]);

  useEffect(() => {
    let filtered = [...detections];

    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.labels.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(d.timestamp).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLabel) {
      filtered = filtered.filter(d => d.labels === selectedLabel);
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredDetections(filtered);
  }, [detections, searchQuery, selectedLabel]);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Alert History</h1>
        <p className="text-gray-400">View and manage all suspicious activity detections</p>
      </div>

      <div className="bg-zinc-900 rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by label or date"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All labels</option>
              {uniqueLabels.map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLabel('');
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            Clear Filters
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : filteredDetections.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="font-medium mb-1">No alerts found</h3>
            <p className="text-gray-400">
              {detections.length === 0
                ? "No suspicious activities have been detected yet"
                : "Try adjusting your search criteria"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Detection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-zinc-900 divide-y divide-gray-700">
                {filteredDetections.map((detection) => (
                  <tr key={detection.id} className="hover:bg-zinc-800">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <div className="h-10 w-10 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                        {detection.image_url && (
                          <img
                            src={`http://localhost:5000/serve/${detection.image_url}`}
                            alt={detection.labels}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{detection.labels}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {Math.round(detection.confidence_score * 100)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(detection.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/detection/${detection.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
