import { motion } from 'framer-motion';
import { Award, Users, Briefcase, GraduationCap, Target, BarChart as ChartBar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Students Placed' },
    { icon: Briefcase, value: '500+', label: 'Partner Companies' },
    { icon: Award, value: '95%', label: 'Placement Rate' },
    { icon: GraduationCap, value: '50+', label: 'Training Programs' },
  ];

  const services = [
    {
      icon: GraduationCap,
      title: 'Skill Development',
      description: 'Comprehensive training programs in various technologies and soft skills to prepare students for the industry.',
    },
    {
      icon: Target,
      title: 'Career Guidance',
      description: 'Personalized career counseling and guidance to help students choose the right career path.',
    },
    {
      icon: Briefcase,
      title: 'Job Placements',
      description: 'Strong industry connections to provide excellent job opportunities to our students.',
    },
    {
      icon: ChartBar,
      title: 'Performance Tracking',
      description: 'Regular assessment and tracking of student progress to ensure optimal learning outcomes.',
    },
  ];

  return (
    <div>
      <Navbar />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Shaping Careers, Building Futures
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              We are dedicated to bridging the gap between academia and industry by providing comprehensive placement training and career opportunities.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a comprehensive range of services to ensure our students are well-prepared for their professional journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-center mb-4">
                  <service.icon className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-center">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Training Programs Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Training Programs</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our industry-aligned training programs are designed to equip students with the skills needed in today's competitive job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              'Full Stack Development',
              'Data Science & Analytics',
              'Cloud Computing',
              'Artificial Intelligence',
              'DevOps & Automation',
              'Cyber Security',
            ].map((program, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white transform transition-transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold mb-2">{program}</h3>
                <p className="text-white opacity-90">
                  Comprehensive training with hands-on projects and industry expert sessions.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default About;