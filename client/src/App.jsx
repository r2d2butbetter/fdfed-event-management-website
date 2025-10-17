import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about-us">About Us</Link> | <Link to="/contact-us">Contact Us</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about-us' element={<AboutUs />} />
        <Route path='/contact-us' element={<ContactUs />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
