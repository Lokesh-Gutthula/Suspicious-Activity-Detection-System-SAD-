import React, { useState } from "react";
import { ZoomIn } from "lucide-react";

export const DetectedFrames = ({ frames }) => {
  const [selectedFrame, setSelectedFrame] = useState(null);

  // Group frames by label type for better organization
  const groupedFrames = frames.reduce((acc, frame) => {
    const label = frame.labels || "unknown";
    if (!acc[label]) acc[label] = [];
    acc[label].push(frame);
    return acc;
  }, {});

  const openModal = (frame) => {
    setSelectedFrame(frame);
  };

  const closeModal = () => {
    setSelectedFrame(null);
  };

  if (frames.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Detected Suspicious Activity</h3>
      
      {Object.entries(groupedFrames).map(([label, labelFrames]) => (
        <div key={label} className="mb-6">
          <h4 className="text-md font-medium mb-2 text-red-600 capitalize">{label} Detection</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {labelFrames.map((frame, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openModal(frame)}
              >
                <div className="relative">
                  <img
                    src={`http://localhost:5000/serve/processed_images/${frame.frame_path}`}
                    alt={`Suspicious activity: ${frame.labels}`}
                    className="w-full h-48 object-cover rounded-md mb-2"
                    onError={(e) => {
                      console.error(`Failed to load image: ${frame.frame_path}`);
                      e.target.src = "/placeholder-image.jpg"; // Fallback image
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {Math.round(frame.confidence * 100)}%
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white rounded p-1">
                    <ZoomIn size={16} />
                  </div>
                </div>
                <p className="text-sm truncate">
                  <strong>Time:</strong> {new Date(frame.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Image modal */}
      {selectedFrame && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-medium">
                {selectedFrame.labels || "Unknown"} - {new Date(selectedFrame.timestamp).toLocaleString()}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
              <img 
                src={`http://localhost:5000/serve/processed_images/${selectedFrame.frame_path}`} 
                alt={`Detected ${selectedFrame.labels}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="p-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">
                    <strong>Frame Name:</strong> {selectedFrame.frame_name || "N/A"}
                  </p>
                  <p className="text-sm">
                    <strong>Confidence:</strong> {Math.round(selectedFrame.confidence * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm">
                    <strong>Timestamp:</strong> {new Date(selectedFrame.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Type:</strong> {selectedFrame.labels || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};