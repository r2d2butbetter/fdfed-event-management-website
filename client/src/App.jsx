import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Signup from './pages/Signup';
import EventDetail from './pages/EventDetail';
import Navbar from './components/navbar';
import Createevent from './pages/createEvent';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about-us' element={<AboutUs />} />
        <Route path='/contact-us' element={<ContactUs />} />
        <Route path='/login' element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path='/signup' element={<Signup />} />
        <Route path='/events/:id' element={<EventDetail />} />
        <Route path='/create-event' element={<Createevent />} />
      </Routes>
    </>
  );
}

export default App;
