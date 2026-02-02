import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventAttendees from './pages/AdminEventAttendees';
import AdminOrganizerDetails from './pages/AdminOrganizerDetails';
import AdminUserDetails from './pages/AdminUserDetails';
import UserDashboard from './pages/dashboards/UserDashboard';
import OrganizerDashboard from './pages/dashboards/OrganizerDashboard';
import Analytics from './pages/dashboards/Analytics';
import Settings from './pages/dashboards/Settings';
import EventAttendees from './pages/dashboards/EventAttendees';
import Communication from './pages/dashboards/Communication';
import EditEvent from './pages/dashboards/EditEvent';
import BecomeOrganizer from './pages/BecomeOrganizer';
import Signup from './pages/Signup';
import EventDetail from './pages/EventDetail';
import CategoryPage from './pages/CategoryPage';
import PaymentPage from './pages/PaymentPage';
import Navbar from './components/navbar';
import Createevent from './pages/createEvent';
import Footer from './components/Footer';


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
        <Route path="/admin/events/:eventId/attendees" element={<AdminEventAttendees />} />
        <Route path="/admin/organizers/:organizerId/details" element={<AdminOrganizerDetails />} />
        <Route path="/admin/users/:userId/details" element={<AdminUserDetails />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/create-event" element={<Createevent />} />
        <Route path="/organizer/analytics" element={<Analytics />} />
        <Route path="/organizer/settings" element={<Settings />} />
        <Route path="/organizer/edit-event/:eventId" element={<EditEvent />} />
        <Route path="/organizer/events/:eventId/attendees" element={<EventAttendees />} />
        <Route path="/organizer/communication" element={<Communication />} />
        <Route path="/become-organizer" element={<BecomeOrganizer />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/events/:id' element={<EventDetail />} />
        <Route path='/create-event' element={<Createevent />} />
        <Route path='/category/:category' element={<CategoryPage />} />
        <Route path='/payment/:id' element={<PaymentPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
