import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Menu,
  X,
  Radar,
  ChevronDown,
  Home,
  BarChart,
  FileUp,
  LogOut,
  User,
  Camera,
  Redo,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const Navbar = () => {
  const [openMenus, setOpenMenus] = useState({ mobile: false, profile: false })
  const { isLoggedIn, handleLogout } = useAuth()

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }))
  }

  const closeAll = () => {
    setOpenMenus({ mobile: false, profile: false })
  }

  const navLinks = !isLoggedIn
    ? [
        { to: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Sign Up' },
      ]
    : [
        { to: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
        { to: '/dashboard', label: 'Dashboard', icon: <BarChart className="h-4 w-4 mr-2" /> },
        { to: '/upload-video', label: 'Upload', icon: <FileUp className="h-4 w-4 mr-2" /> },
        { to: '/monitoring', label: 'Live CCTV', icon: <Camera className="h-4 w-4 mr-2" /> },
        { to: '/contact', label: 'Contact Us', icon: <Camera className="h-4 w-4 mr-2" /> },
      ]

  const profileLinks = [
    { to: '/profile', label: 'Profile', icon: <User className="h-4 w-4 mr-2" /> },
    { to: '/change-password', label: 'Change Password', icon: <Redo className="h-4 w-4 mr-2" /> },
    { to: '/reset-password', label: 'Reset Password', icon: <LogOut className="h-4 w-4 mr-2" /> },
  ]

  const Dropdown = ({ isOpen, toggle, label, links, isMobile }) => (
    <div className={`relative ${isMobile ? 'px-3 py-2' : ''}`}>
      <button
        onClick={() => toggle(!isOpen)}
        className={`flex items-center space-x-1 ${
          isMobile
            ? 'text-white hover:bg-purple-500 w-full justify-between text-base'
            : 'text-gray-700 hover:text-blue-600 px-3 py-2 text-sm'
        } font-medium`}
      >
        <span>{label}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isMobile ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? 0 : -10 }}
            className={
              isMobile
                ? 'mt-2 pl-4 border-l-2 border-purple-400'
                : 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50'
            }
          >
            {links.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`flex items-center ${
                  isMobile
                    ? 'py-2 text-white hover:text-gray-200'
                    : 'px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeAll}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
  

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center font-bold text-lg text-gray-900">
            <Radar className="h-7 w-7 text-red-600 mr-2" />
            <span>SecureWatch</span>
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => toggleMenu('mobile')}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              {openMenus.mobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                <Dropdown
                  isOpen={openMenus.profile}
                  toggle={() => toggleMenu('profile')}
                  label="My Profile"
                  links={profileLinks}
                  isMobile={false}
                />
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2 inline" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {openMenus.mobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="block text-gray-700 hover:text-blue-600 text-base font-medium"
                  onClick={closeAll}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn && (
                <>
                  <Dropdown
                    isOpen={openMenus.profile}
                    toggle={() => toggleMenu('profile')}
                    label="My Profile"
                    links={profileLinks}
                    isMobile={true}
                  />
                  <button
                    onClick={() => {
                      handleLogout()
                      closeAll()
                    }}
                    className="w-full text-left text-red-600 hover:text-red-800 font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
