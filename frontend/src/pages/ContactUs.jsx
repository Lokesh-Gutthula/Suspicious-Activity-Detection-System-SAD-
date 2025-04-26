import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const ContactUs = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent successfully');
  };

  const addresses = [
    {
      title: 'Main Office',
      address: '123 Tech Street, Silicon Valley, CA 94025',
      phone: '+1 (555) 123-4567',
      email: 'info@placeme.com',
    },
    {
      title: 'Training Center',
      address: '456 Learning Avenue, Knowledge Park, CA 94026',
      phone: '+1 (555) 987-6543',
      email: 'training@placeme.com',
    },
  ];

  return (
    <div>
      <Navbar />

    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Cards */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Locations</h2>
            {addresses.map((address, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{address.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-purple-600 mt-1 mr-3" />
                    <span className="text-gray-600">{address.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-600">{address.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-600">{address.email}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ContactUs Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  required
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default ContactUs;