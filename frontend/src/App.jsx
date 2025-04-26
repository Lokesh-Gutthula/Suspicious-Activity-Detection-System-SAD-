import React from 'react'
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile';
import ContactUs from './pages/ContactUs';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import Footer from './components/Footer';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import DashboardUpload from './pages/Dashboard/DashboardUpload';
import MonitoringPage from './pages/MonitoringPage';
import AlertsPage from './pages/AlertsPage';
import NotFoundPage from './pages/NotFoundPage';


const App = () => {

  return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path='/dashboard' element={ 
              <ProtectedRoute>
                <Dashboard />
                </ProtectedRoute>
              } />
            <Route path='/upload-video' element={ <DashboardUpload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path='/change-password' element={<ChangePassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />

            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path='/about' element={<About />} />
            <Route path='/footer' element={<Footer />} />
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </div>
    </>
  )
}

export default App;

