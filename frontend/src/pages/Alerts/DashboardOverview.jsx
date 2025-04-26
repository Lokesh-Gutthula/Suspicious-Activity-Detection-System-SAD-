import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts"
  import { AlertTriangle, Camera, Clock } from "lucide-react"
  
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
  ]
  
  const activityByHour = [
    { hour: "00:00", count: 3 },
    { hour: "01:00", count: 5 },
    { hour: "02:00", count: 2 },
    { hour: "03:00", count: 1 },
    { hour: "04:00", count: 0 },
    { hour: "05:00", count: 0 },
    { hour: "06:00", count: 1 },
    { hour: "07:00", count: 2 },
    { hour: "08:00", count: 3 },
    { hour: "09:00", count: 4 },
    { hour: "10:00", count: 2 },
    { hour: "11:00", count: 3 },
    { hour: "12:00", count: 5 },
    { hour: "13:00", count: 4 },
    { hour: "14:00", count: 6 },
    { hour: "15:00", count: 8 },
    { hour: "16:00", count: 7 },
    { hour: "17:00", count: 5 },
    { hour: "18:00", count: 4 },
    { hour: "19:00", count: 3 },
    { hour: "20:00", count: 2 },
    { hour: "21:00", count: 4 },
    { hour: "22:00", count: 6 },
    { hour: "23:00", count: 4 },
  ]
  
  const detectionTypes = [
    { name: "Person", value: 42 },
    { name: "Weapon", value: 8 },
    { name: "Mask", value: 15 },
    { name: "Climbing", value: 5 },
    { name: "Tool", value: 12 },
    { name: "Other", value: 18 },
  ]
  
  const COLORS = ["#0088FE", "#FF8042", "#FFBB28", "#FF0000", "#00C49F", "#8884d8"]
  
  const DashboardOverview = () => {
    return (
      <div className="space-y-6">
        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <div className="p-4 pb-2">
              <div className="text-lg font-medium flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Critical Alerts
              </div>
            </div>
            <div className="p-4 pt-0">
              <div className="text-3xl font-bold text-red-600">3</div>
              <div className="text-sm text-gray-500">In the last 24 hours</div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 pb-2">
              <div className="text-lg font-medium flex items-center">
                <Camera className="h-5 w-5 text-gray-500 mr-2" />
                Active Cameras
              </div>
            </div>
            <div className="p-4 pt-0">
              <div className="text-3xl font-bold">8/10</div>
              <div className="text-sm text-gray-500">2 cameras offline</div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 pb-2">
              <div className="text-lg font-medium flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                Total Detections
              </div>
            </div>
            <div className="p-4 pt-0">
              <div className="text-3xl font-bold">127</div>
              <div className="text-sm text-gray-500">This week</div>
            </div>
          </div>
        </div>
  
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-medium">Activity by Hour</h3>
              <p className="text-sm text-gray-500">Suspicious activities detected in the last 24 hours</p>
            </div>
            <div className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
  
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-medium">Detection Types</h3>
              <p className="text-sm text-gray-500">Distribution of suspicious activities by type</p>
            </div>
            <div className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={detectionTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {detectionTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
  
        {/* Recent Detections */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4">
            <h3 className="text-lg font-medium">Recent Detections</h3>
            <p className="text-sm text-gray-500">Latest suspicious activities detected</p>
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
          </div>
        </div>
      </div>
    )
  }
  
  export default DashboardOverview
  