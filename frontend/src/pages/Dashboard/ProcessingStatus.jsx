import React from "react";
import { Loader2 } from "lucide-react";

export const ProcessingStatus = ({ uploadProgress, processingState }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white">
            <span>Uploading Video</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {processingState.isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2 text-white">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span>Processing Video ({processingState.progress}%)</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-300"
              style={{ width: `${processingState.progress}%` }}
            />
          </div>
        </div>
      )}

      {!processingState.isProcessing && processingState.progress === 100 && (
        <div className="text-center text-white">
          <span>Processing Complete</span>
        </div>
      )}
    </div>
  );
};