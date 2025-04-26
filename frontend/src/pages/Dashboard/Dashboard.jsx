import React, { useEffect, useState } from "react";
import api from "../../api";
import { DetectedFrames } from "./DetectedFrames";
import Navbar from "../../components/Navbar";

export const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    try {
      const res = await api.get("dashboard/videos");
      setVideos(res.data.videos);
    } catch (err) {
      console.error("Failed to load videos", err);
    }
  };

  const fetchDetections = async (videoId) => {
    setLoading(true);
    try {
      const res = await api.get(`detection/${videoId}`);
      setFrames(res.data.results || []);
    } catch (err) {
      console.error("Failed to fetch detections", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div>
      <Navbar />
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Your Processed Videos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`border p-4 rounded-lg cursor-pointer hover:shadow-md ${
              selectedVideo === video.id ? "border-blue-500" : ""
            }`}
            onClick={() => {
              setSelectedVideo(video.id);
              fetchDetections(video.id);
            }}
          >
            <h3 className="text-md font-medium truncate">{video.filename}</h3>
            <p className="text-sm text-gray-500">
              Uploaded: {new Date(video.upload_time).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Detections: {video.detections}
            </p>
          </div>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading detections...</p>}

      {!loading && frames.length > 0 && (
        <DetectedFrames frames={frames} />
      )}
    </div>
</div>
  );
};

// import React, { useState, useEffect } from "react"
// import {
//   BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
//   CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from "recharts"
// import {
//   AlertTriangle, Camera, Clock, RefreshCw, Settings
// } from "lucide-react"
// import Navbar from "../../components/Navbar"

// const detectionData = [
//   { id: 1, timestamp: "2023-06-15 01:23:45", type: "Person", confidence: 0.92, location: "Front Gate", status: "Alert Sent" },
//   { id: 2, timestamp: "2023-06-15 01:45:12", type: "Weapon", confidence: 0.87, location: "Back Entrance", status: "Alert Sent" },
//   { id: 3, timestamp: "2023-06-15 02:12:33", type: "Climbing", confidence: 0.78, location: "Side Wall", status: "Alert Sent" },
//   { id: 4, timestamp: "2023-06-15 14:05:22", type: "Mask", confidence: 0.85, location: "Main Entrance", status: "Reviewed" },
//   { id: 5, timestamp: "2023-06-15 15:33:10", type: "Tool", confidence: 0.81, location: "Storage Area", status: "Reviewed" },
// ]

// const activityByHour = [
//   { hour: "00:00", count: 3 }, { hour: "01:00", count: 5 }, { hour: "02:00", count: 2 }, { hour: "03:00", count: 1 },
//   { hour: "04:00", count: 0 }, { hour: "05:00", count: 0 }, { hour: "06:00", count: 1 }, { hour: "07:00", count: 2 },
//   { hour: "08:00", count: 3 }, { hour: "09:00", count: 4 }, { hour: "10:00", count: 2 }, { hour: "11:00", count: 3 },
//   { hour: "12:00", count: 5 }, { hour: "13:00", count: 4 }, { hour: "14:00", count: 6 }, { hour: "15:00", count: 8 },
//   { hour: "16:00", count: 7 }, { hour: "17:00", count: 5 }, { hour: "18:00", count: 4 }, { hour: "19:00", count: 3 },
//   { hour: "20:00", count: 2 }, { hour: "21:00", count: 4 }, { hour: "22:00", count: 6 }, { hour: "23:00", count: 4 },
// ]

// const detectionTypes = [
//   { name: "Person", value: 42 }, { name: "Weapon", value: 8 }, { name: "Mask", value: 15 },
//   { name: "Climbing", value: 5 }, { name: "Tool", value: 12 }, { name: "Other", value: 18 },
// ]

// const COLORS = ["#0088FE", "#FF8042", "#FFBB28", "#FF0000", "#00C49F", "#8884d8"]

// const tabs = ["overview", "detections", "cameras", "upload"]

// const TabButton = ({ label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     className={`px-4 py-2 rounded-md text-sm font-medium ${active ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
//   >
//     {label}
//   </button>
// )

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState("overview")
//   const [detections, setDetections] = useState([])

//   useEffect(() => {
//     if (activeTab === "detections") {
//       // Replace this with your API endpoint if needed
//       // Example: fetch("/api/detections")
//       setDetections(detectionData)
//     }
//   }, [activeTab])

//   return (
//     <div>
//       <Navbar />
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <header className="mb-8">
//           <h1 className="text-3xl font-bold">Surveillance Dashboard</h1>
//           <p className="text-gray-500">Monitor and analyze suspicious activities</p>
//         </header>

//         <div className="flex justify-between items-center mb-6">
//           <div className="space-x-2">
//             {tabs.map(tab => (
//               <TabButton
//                 key={tab}
//                 label={tab.charAt(0).toUpperCase() + tab.slice(1)}
//                 active={activeTab === tab}
//                 onClick={() => setActiveTab(tab)}
//               />
//             ))}
//           </div>
//           <div className="flex gap-2">
//             <button className="flex items-center px-3 py-1 border rounded text-sm text-gray-700 bg-white">
//               <RefreshCw className="h-4 w-4 mr-2" /> Refresh
//             </button>
//             <button className="flex items-center px-3 py-1 border rounded text-sm text-gray-700 bg-white">
//               <Settings className="h-4 w-4 mr-2" /> Settings
//             </button>
//           </div>
//         </div>

//         {/* Overview Tab */}
//         {activeTab === "overview" && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-red-50 border border-red-200 p-4 rounded">
//                 <div className="flex items-center mb-2">
//                   <AlertTriangle className="text-red-500 mr-2" />
//                   <h3 className="font-semibold text-lg">Critical Alerts</h3>
//                 </div>
//                 <p className="text-3xl font-bold text-red-600">3</p>
//                 <p className="text-sm text-gray-500">In the last 24 hours</p>
//               </div>
//               <div className="bg-white p-4 border rounded">
//                 <div className="flex items-center mb-2">
//                   <Camera className="text-gray-500 mr-2" />
//                   <h3 className="font-semibold text-lg">Active Cameras</h3>
//                 </div>
//                 <p className="text-3xl font-bold">8/10</p>
//                 <p className="text-sm text-gray-500">2 cameras offline</p>
//               </div>
//               <div className="bg-white p-4 border rounded">
//                 <div className="flex items-center mb-2">
//                   <Clock className="text-gray-500 mr-2" />
//                   <h3 className="font-semibold text-lg">Total Detections</h3>
//                 </div>
//                 <p className="text-3xl font-bold">127</p>
//                 <p className="text-sm text-gray-500">This week</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white p-4 border rounded">
//                 <h3 className="text-lg font-semibold mb-2">Activity by Hour</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={activityByHour}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="hour" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#8884d8" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="bg-white p-4 border rounded">
//                 <h3 className="text-lg font-semibold mb-2">Detection Types</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={detectionTypes}
//                       cx="50%" cy="50%"
//                       labelLine={false}
//                       outerRadius={100}
//                       dataKey="value"
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                     >
//                       {detectionTypes.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Detections Tab */}
//         {activeTab === "detections" && (
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold">Detections</h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {detections.map((detection) => (
//                 <div key={detection.id} className="bg-white border rounded p-4 shadow-sm">
//                   <div className="mb-2">
//                     <span className="text-sm font-semibold text-gray-700">{detection.type}</span>
//                     <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
//                       {Math.round(detection.confidence * 100)}% Confidence
//                     </span>
//                   </div>
//                   <div className="text-sm text-gray-600 space-y-1">
//                     <p><strong>Location:</strong> {detection.location}</p>
//                     <p><strong>Time:</strong> {detection.timestamp}</p>
//                     <p>
//                       <strong>Status:</strong>{" "}
//                       <span className={`font-medium ${detection.status === "Alert Sent" ? "text-red-500" : "text-green-600"}`}>
//                         {detection.status}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Future: cameras, upload, etc. */}
//       </div>
//     </div>
//     </div>
//   )
// }

export default Dashboard;
