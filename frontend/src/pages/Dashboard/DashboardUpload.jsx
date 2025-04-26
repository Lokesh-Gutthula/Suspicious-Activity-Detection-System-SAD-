import { useState, useEffect } from "react";
import { FileUp, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import { ProcessingStatus } from "./ProcessingStatus";
import { DetectedFrames } from "./DetectedFrames";
import api from "../../api";

const DashboardUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingState, setProcessingState] = useState({ isProcessing: false, progress: 0 });
  const [detectedFrames, setDetectedFrames] = useState([]);
  const [error, setError] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoLabel, setVideoLabel] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file first");
      return;
    }

    if (!["video/mp4", "video/avi", "video/quicktime"].includes(selectedFile.type)) {
      setError("Please upload a valid video file (MP4, AVI, MOV)");
      return;
    }
    
    if (selectedFile.size > 2 * 1024 * 1024 * 1024) {
      setError("File size exceeds 2GB limit");
      return;
    }

    setError(null);
    setUploadProgress(0);
    setProcessingState({ isProcessing: false, progress: 0 });
    setDetectedFrames([]);
    setVideoId(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      console.log("Starting video upload...");
      const response = await api.post("/detection/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      console.log("Upload response:", response.data);
      setUploadProgress(100);
      
      // Extract the video ID and filename from response, handling both formats
      const { video_id, videoId, filename } = response.data;
      const actualVideoId = video_id || videoId;
      
      if (!actualVideoId) {
        throw new Error("No video ID returned from server");
      }
      
      setVideoId(actualVideoId);
      setVideoLabel(filename);
      setProcessingState({ isProcessing: true, progress: 0 });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload video. Please try again.");
      setUploadProgress(0);
      setProcessingState({ isProcessing: false, progress: 0 });
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!videoId || !processingState.isProcessing) return;

    console.log("Starting status polling for videoId:", videoId);
    
    const pollStatus = async () => {
      try {
        const response = await api.get(`/detection/status/${videoId}`);
        const { status, progress } = response.data;
        console.log("Status update:", status, progress);

        setProcessingState({ isProcessing: status === "processing" || status === "queued", progress });

        if (status === "completed") {
          console.log("Processing completed, fetching results");
          try {
            // Get the numeric ID part if the videoId contains an underscore
            const requestId = videoId.includes('_') ? videoId.split('_')[0] : videoId;
            const detectionResponse = await api.get(`/detection/${requestId}`);
            console.log("Detection results:", detectionResponse.data);
            
            if (detectionResponse.data && Array.isArray(detectionResponse.data.results)) {
              setDetectedFrames(detectionResponse.data.results);
              setProcessingState({ isProcessing: false, progress: 100 });
            } else {
              console.warn("No detection results found or invalid format");
              setDetectedFrames([]);
              setProcessingState({ isProcessing: false, progress: 100 });
            }
          } catch (fetchErr) {
            console.error("Error fetching detection results:", fetchErr);
            setError("Failed to fetch detection results.");
            setProcessingState({ isProcessing: false, progress: 0 });
            setIsUploading(false);
          }
        } else if (status === "failed") {
          console.error("Video processing failed");
          setError("Video processing failed. Please try again.");
          setProcessingState({ isProcessing: false, progress: 0 });
          setIsUploading(false);
        }
      } catch (err) {
        console.error("Status polling error:", err);
        setError("Error checking processing status.");
        setProcessingState({ isProcessing: false, progress: 0 });
        setIsUploading(false);
      }
    };

    const interval = setInterval(pollStatus, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [videoId, processingState.isProcessing]);

  // Reset the upload button when processing is completely done
  useEffect(() => {
    if (processingState.progress === 100 && !processingState.isProcessing) {
      setIsUploading(false);
    }
  }, [processingState]);

  return (
    <div>
      <Navbar />
      <div className="space-y-6 p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4">
            <h3 className="text-lg font-medium">Upload Video Footage</h3>
            <p className="text-sm text-gray-500">
              Upload recorded CCTV footage for analysis and suspicious activity detection
            </p>
          </div>
          <div className="p-4">
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center ${
                dragActive ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileUp className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Drag and drop video files</h3>
              <p className="text-gray-500 mb-4">Supports MP4, AVI, and MOV formats up to 2GB</p>
              <label className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer">
                Select Files
                <input
                  type="file"
                  className="hidden"
                  accept="video/mp4,video/avi,video/quicktime"
                  onChange={handleFileSelect}
                  disabled={isUploading || processingState.isProcessing}
                />
              </label>
            </div>

            {selectedFile && !isUploading && !processingState.isProcessing && (
              <div className="mt-4 text-center">
                <p className="text-gray-700">Selected File: {selectedFile.name}</p>
                <button
                  onClick={handleUpload}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Start Detection
                </button>
              </div>
            )}

            {videoLabel && (
              <div className="mt-4 text-center">
                <p className="text-gray-700">Processing Video: {videoLabel}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="text-red-500 h-5 w-5" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {(uploadProgress > 0 || processingState.isProcessing) && (
              <div className="mt-8">
                <ProcessingStatus
                  uploadProgress={uploadProgress}
                  processingState={processingState}
                />
              </div>
            )}

            {detectedFrames.length > 0 ? (
              <DetectedFrames frames={detectedFrames} />
            ) : (
              processingState.progress === 100 && !processingState.isProcessing && !error && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                  <p className="text-yellow-700">No suspicious activities detected in this video.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUpload;