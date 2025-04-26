import { Search, Filter, Download } from "lucide-react"

// Mock data for demonstration
const detectionData = [
  {
    id: 1,
    timestamp: "2023-06-15 01:23:45",
    type: "Person",
    confidence: 0.92,
    location: "Front Gate",
    status: "Alert Sent",
  },
  {
    id: 2,
    timestamp: "2023-06-15 01:45:12",
    type: "Weapon",
    confidence: 0.87,
    location: "Back Entrance",
    status: "Alert Sent",
  },
  {
    id: 3,
    timestamp: "2023-06-15 02:12:33",
    type: "Climbing",
    confidence: 0.78,
    location: "Side Wall",
    status: "Alert Sent",
  },
  {
    id: 4,
    timestamp: "2023-06-15 14:05:22",
    type: "Mask",
    confidence: 0.85,
    location: "Main Entrance",
    status: "Reviewed",
  },
  {
    id: 5,
    timestamp: "2023-06-15 15:33:10",
    type: "Tool",
    confidence: 0.81,
    location: "Storage Area",
    status: "Reviewed",
  },
  // Duplicate for more data
  {
    id: 6,
    timestamp: "2023-06-15 16:23:45",
    type: "Person",
    confidence: 0.9,
    location: "Front Gate",
    status: "Alert Sent",
  },
  {
    id: 7,
    timestamp: "2023-06-15 17:45:12",
    type: "Weapon",
    confidence: 0.89,
    location: "Back Entrance",
    status: "Alert Sent",
  },
  {
    id: 8,
    timestamp: "2023-06-15 18:12:33",
    type: "Climbing",
    confidence: 0.76,
    location: "Side Wall",
    status: "Alert Sent",
  },
  {
    id: 9,
    timestamp: "2023-06-15 19:05:22",
    type: "Mask",
    confidence: 0.83,
    location: "Main Entrance",
    status: "Reviewed",
  },
  {
    id: 10,
    timestamp: "2023-06-15 20:33:10",
    type: "Tool",
    confidence: 0.79,
    location: "Storage Area",
    status: "Reviewed",
  },
]

const DashboardDetections = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">All Detections</h3>
              <p className="text-sm text-gray-500">Search and filter all suspicious activity detections</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="search"
                  placeholder="Search detections..."
                  className="pl-8 w-full sm:w-64 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="h-4 w-4" />
              </button>
              <button className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Confidence</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {detectionData.map((detection) => (
                  <tr key={detection.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{detection.timestamp}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          detection.type === "Weapon"
                            ? "bg-red-100 text-red-800"
                            : detection.type === "Person"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {detection.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{detection.location}</td>
                    <td className="py-3 px-4">{(detection.confidence * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          detection.status === "Alert Sent"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {detection.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-sm text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">Showing 10 of 127 detections</div>
            <div className="flex gap-1">
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-500" disabled>
                Previous
              </button>
              <button className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardDetections
