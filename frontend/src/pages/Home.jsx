import { Link } from "react-router-dom";
import { ArrowRight, Bell, Camera, Clock, Shield, Upload, User } from 'lucide-react';
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">AI-Powered CCTV Surveillance System</h1>
            <p className="text-xl mb-8">Detect suspicious activities in real-time with advanced AI technology</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-green-700"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Camera className="h-10 w-10 text-red-600" />}
              title="Live CCTV Monitoring"
              description="Connect to your existing CCTV cameras for real-time monitoring and analysis."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-red-600" />}
              title="Suspicious Activity Detection"
              description="Detect weapons, masked individuals, climbing, and other suspicious behaviors."
            />
            <FeatureCard
              icon={<Bell className="h-10 w-10 text-red-600" />}
              title="Instant Alerts"
              description="Receive immediate notifications via email and SMS when suspicious activities are detected."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-red-600" />}
              title="Night Time Monitoring"
              description="Enhanced vigilance during night hours (11PM-5AM) with special alert conditions."
            />
            <FeatureCard
              icon={<Upload className="h-10 w-10 text-red-600" />}
              title="Video Upload Analysis"
              description="Upload and analyze existing footage to identify suspicious activities retroactively."
            />
            <FeatureCard
              icon={<User className="h-10 w-10 text-red-600" />}
              title="Secure Access"
              description="Multi-factor authentication ensures only authorized personnel can access the system."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-blue-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-red-200"></div>

              {/* Steps */}
              <TimelineStep
                number={1}
                title="Connect Your Cameras"
                description="Integrate your existing CCTV system or upload recorded footage for analysis."
              />
              <TimelineStep
                number={2}
                title="AI-Powered Analysis"
                description="Our YOLOv8 model analyzes the video feed to detect suspicious objects and behaviors."
              />
              <TimelineStep
                number={3}
                title="Instant Notifications"
                description="Receive alerts with images and timestamps when suspicious activities are detected."
              />
              <TimelineStep
                number={4}
                title="Review & Take Action"
                description="Access the dashboard to review detected events and take appropriate action."
                isLast={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Enhance Your Security?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start monitoring your premises with our advanced AI surveillance system today.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-100"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const TimelineStep = ({ number, title, description, isLast = false }) => {
  return (
    <div className={`flex items-start ${isLast ? "" : "mb-16"}`}>
      <div className="flex-1 text-right pr-8">
        {number % 2 === 1 ? (
          <>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </>
        ) : (
          <div className="h-12"></div>
        )}
      </div>
      <div className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white font-bold">
        {number}
      </div>
      <div className="flex-1 pl-8">
        {number % 2 === 0 ? (
          <>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </>
        ) : (
          <div className="h-12"></div>
        )}
      </div>
    </div>
  );
};

export default Home;
