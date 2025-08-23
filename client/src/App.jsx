import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import './App.css';

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about-us">About Us</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about-us' element={<AboutUs />} />
      </Routes>
    </>
  );
}

export default App;
