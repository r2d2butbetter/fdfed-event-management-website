// import React, { useEffect, useState } from "react";
// import "../css/admin.css";
// import Chart from "chart.js/auto";
// import profilePic from "../assets/images/proflepic.jpeg";

// function AdminDashboard() {
//   const [stats, setStats] = useState({
//     userCount: 0,
//     eventCount: 0,
//     organizerCount: 0,
//     verifiedOrganizerCount: 0,
//   });

//   const [recentEvents, setRecentEvents] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [organizers, setOrganizers] = useState([]);
//   const [activeSection, setActiveSection] = useState("dashboard");
//   const [searchTerms, setSearchTerms] = useState({
//     users: "",
//     events: "",
//     organizers: "",
//   });
//   const [selectedOrganizer, setSelectedOrganizer] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const API = "http://localhost:3000/admin";

//   // Fetch Dashboard Data
//   useEffect(() => {
//     fetch(`${API}/dashboard`, { credentials: "include" })
//       .then((res) => res.json())
//       .then((result) => {
//         if (result.success) {
//           setStats(result.data.statistics);
//           setRecentEvents(result.data.recentEvents);
//         }
//       });

//     fetch(`${API}/users`, { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => setUsers(data));

//     fetch(`${API}/events`, { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => setEvents(data));

//     fetch(`${API}/organizers`, { credentials: "include" })
//       .then((res) => res.json())
//       .then((data) => setOrganizers(data));
//   }, []);

//   // Load Charts
//   useEffect(() => {
//     if (activeSection === "dashboard") {
//       loadMonthlyEventsChart();
//       loadEventCategoriesChart();
//       loadRevenueChart();
//       loadOrganizerVerificationChart();
//     }
//   }, [activeSection, stats]);

//   // Chart Functions
//   const loadMonthlyEventsChart = () => {
//     fetch(`${API}/chart/monthly-events`, { credentials: 'include' })
//       .then((response) => response.json())
//       .then((data) => {
//         const ctx = document.getElementById("monthlyEventsChart");
//         if (!ctx) return;

//         if (window.monthlyEventsChartInstance) {
//           window.monthlyEventsChartInstance.destroy();
//         }

//         const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 300);
//         gradient.addColorStop(0, "rgba(147, 83, 211, 0.8)");
//         gradient.addColorStop(1, "rgba(147, 83, 211, 0.2)");

//         window.monthlyEventsChartInstance = new Chart(ctx, {
//           type: "line",
//           data: {
//             labels: data.map((item) => `${item.month} ${item.year}`),
//             datasets: [
//               {
//                 label: "Events Created",
//                 data: data.map((item) => item.count),
//                 backgroundColor: gradient,
//                 borderColor: "rgba(147, 83, 211, 1)",
//                 borderWidth: 2,
//                 pointBackgroundColor: "#fff",
//                 pointBorderColor: "rgba(147, 83, 211, 1)",
//                 pointRadius: 5,
//                 tension: 0.3,
//                 fill: true,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: { display: true, labels: { color: "#fff" } },
//               tooltip: {
//                 backgroundColor: "rgba(0, 0, 0, 0.8)",
//                 titleColor: "#fff",
//                 bodyColor: "#fff",
//               },
//             },
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 grid: { color: "rgba(255, 255, 255, 0.1)" },
//                 ticks: { color: "#fff" },
//               },
//               x: {
//                 grid: { color: "rgba(255, 255, 255, 0.1)" },
//                 ticks: { color: "#fff" },
//               },
//             },
//           },
//         });
//       })
//       .catch((error) => console.error("Error loading monthly events chart:", error));
//   };

//   const loadEventCategoriesChart = () => {
//     fetch(`${API}/chart/event-categories`, { credentials: 'include' })
//       .then((response) => response.json())
//       .then((data) => {
//         const ctx = document.getElementById("eventCategoriesChart");
//         if (!ctx) return;

//         if (window.eventCategoriesChartInstance) {
//           window.eventCategoriesChartInstance.destroy();
//         }

//         const colors = [
//           "#9353D3",
//           "#f43f5e",
//           "#643d88",
//           "#10b981",
//           "#f59e0b",
//           "#ef4444",
//           "#3b82f6",
//           "#a855f7",
//           "#6366f1",
//           "#ec4899",
//         ];

//         window.eventCategoriesChartInstance = new Chart(ctx, {
//           type: "doughnut",
//           data: {
//             labels: data.map((item) => item.category),
//             datasets: [
//               {
//                 label: "Number of Events",
//                 data: data.map((item) => item.count),
//                 backgroundColor: data.map(
//                   (_, index) => colors[index % colors.length]
//                 ),
//                 borderWidth: 2,
//                 borderColor: "#121212",
//                 hoverOffset: 10,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             cutout: "60%",
//             plugins: {
//               legend: {
//                 display: true,
//                 position: "right",
//                 labels: { color: "#fff" },
//               },
//               tooltip: {
//                 backgroundColor: "rgba(0, 0, 0, 0.8)",
//                 titleColor: "#fff",
//                 bodyColor: "#fff",
//               },
//             },
//           },
//         });
//       })
//       .catch((error) => console.error("Error loading event categories chart:", error));
//   };

//   const loadRevenueChart = () => {
//     fetch(`${API}/chart/revenue-analysis`, { credentials: 'include' })
//       .then((response) => response.json())
//       .then((data) => {
//         const ctx = document.getElementById("revenueChart");
//         if (!ctx) return;

//         if (window.revenueChartInstance) {
//           window.revenueChartInstance.destroy();
//         }

//         const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 300);
//         gradient.addColorStop(0, "rgba(244, 63, 94, 0.8)");
//         gradient.addColorStop(1, "rgba(244, 63, 94, 0.2)");

//         window.revenueChartInstance = new Chart(ctx, {
//           type: "bar",
//           data: {
//             labels: data.map((item) => `${item.month} ${item.year}`),
//             datasets: [
//               {
//                 label: "Revenue ($)",
//                 data: data.map((item) => item.revenue),
//                 backgroundColor: gradient,
//                 borderColor: "rgba(244, 63, 94, 1)",
//                 borderWidth: 1,
//                 borderRadius: 5,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 ticks: { color: "#fff", callback: (value) => "$" + value },
//               },
//               x: { ticks: { color: "#fff" } },
//             },
//           },
//         });
//       })
//       .catch((error) => console.error("Error loading revenue chart:", error));
//   };

//   const loadOrganizerVerificationChart = () => {
//     fetch(`${API}/chart/organizer-verification`, { credentials: 'include' })
//       .then((response) => response.json())
//       .then((data) => {
//         const ctx = document.getElementById("organizerVerificationChart");
//         if (!ctx) return;

//         if (window.organizerVerificationChartInstance) {
//           window.organizerVerificationChartInstance.destroy();
//         }

//         const colors = ["#10b981", "#f59e0b"];

//         window.organizerVerificationChartInstance = new Chart(ctx, {
//           type: "pie",
//           data: {
//             labels: data.map((item) => item.status),
//             datasets: [
//               {
//                 label: "Number of Organizers",
//                 data: data.map((item) => item.count),
//                 backgroundColor: colors,
//                 borderColor: "#121212",
//                 borderWidth: 2,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 display: true,
//                 position: "top",
//                 labels: { color: "#fff" },
//               },
//             },
//           },
//         });
//       })
//       .catch((error) =>
//         console.error("Error loading organizer verification chart:", error)
//       );
//   };

//   // Handler functions for CRUD operations
//   const handleDeleteUser = async (userId) => {
//     if (!confirm('Are you sure you want to delete this user?')) return;

//     try {
//       const response = await fetch(`${API}/users/${userId}`, {
//         method: 'DELETE',
//         credentials: 'include',
//       });
//       const data = await response.json();

//       if (response.ok) {
//         alert(data.message || 'User deleted successfully');
//         // Refresh users list
//         const usersResponse = await fetch(`${API}/users`, { credentials: "include" });
//         const usersData = await usersResponse.json();
//         setUsers(usersData);
//       } else {
//         alert(data.message || 'Failed to delete user');
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       alert('Error deleting user');
//     }
//   };

//   const handleDeleteEvent = async (eventId) => {
//     if (!confirm('Are you sure you want to delete this event?')) return;

//     try {
//       const response = await fetch(`http://localhost:3000/events/${eventId}`, {
//         method: 'DELETE',
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//       });

//       // Try to parse JSON response
//       let data;
//       const contentType = response.headers.get('content-type');
//       if (contentType && contentType.includes('application/json')) {
//         data = await response.json();
//       } else {
//         // If response is not JSON, it might be HTML (error page)
//         const text = await response.text();
//         console.error('Non-JSON response:', text);
//         alert('Error: Server returned an unexpected response. Please make sure you are logged in.');
//         return;
//       }

//       if (response.ok && data.success) {
//         alert('Event deleted successfully');
//         // Refresh events list
//         const eventsResponse = await fetch(`${API}/events`, { credentials: "include" });
//         const eventsData = await eventsResponse.json();
//         setEvents(eventsData);
//       } else {
//         alert(data.message || 'Failed to delete event');
//       }
//     } catch (error) {
//       console.error('Error deleting event:', error);
//       alert('Error deleting event: ' + error.message);
//     }
//   };

//   const handleViewOrganizer = async (organizerId) => {
//     try {
//       const response = await fetch(`${API}/organizers/${organizerId}`, {
//         credentials: 'include',
//       });
//       const data = await response.json();

//       if (response.ok) {
//         setSelectedOrganizer(data);
//         setShowModal(true);
//       } else {
//         alert('Failed to load organizer details');
//       }
//     } catch (error) {
//       console.error('Error fetching organizer:', error);
//       alert('Error loading organizer details');
//     }
//   };

//   const handleVerifyOrganizer = async () => {
//     if (!selectedOrganizer) return;

//     try {
//       const response = await fetch(`${API}/organizers/${selectedOrganizer._id}/verify`, {
//         method: 'PUT',
//         credentials: 'include',
//       });
//       const data = await response.json();

//       if (response.ok) {
//         alert(data.message || 'Organizer verified successfully');
//         setShowModal(false);
//         // Refresh organizers list
//         const organizersResponse = await fetch(`${API}/organizers`, { credentials: "include" });
//         const organizersData = await organizersResponse.json();
//         setOrganizers(organizersData);
//       } else {
//         alert(data.message || 'Failed to verify organizer');
//       }
//     } catch (error) {
//       console.error('Error verifying organizer:', error);
//       alert('Error verifying organizer');
//     }
//   };

//   const handleRejectOrganizer = async () => {
//     if (!selectedOrganizer) return;

//     try {
//       const response = await fetch(`${API}/organizers/${selectedOrganizer._id}/reject`, {
//         method: 'PUT',
//         credentials: 'include',
//       });
//       const data = await response.json();

//       if (response.ok) {
//         alert(data.message || 'Organizer rejected');
//         setShowModal(false);
//         // Refresh organizers list
//         const organizersResponse = await fetch(`${API}/organizers`, { credentials: "include" });
//         const organizersData = await organizersResponse.json();
//         setOrganizers(organizersData);
//       } else {
//         alert(data.message || 'Failed to reject organizer');
//       }
//     } catch (error) {
//       console.error('Error rejecting organizer:', error);
//       alert('Error rejecting organizer');
//     }
//   };

//   // Filter functions for search
//   const filteredUsers = users.filter(user => {
//     if (!searchTerms.users) return true;
//     const term = searchTerms.users.toLowerCase();
//     return (
//       user.name?.toLowerCase().includes(term) ||
//       user.email?.toLowerCase().includes(term)
//     );
//   });

//   const filteredEvents = events.filter(event => {
//     if (!searchTerms.events) return true;
//     const term = searchTerms.events.toLowerCase();
//     return (
//       event.title?.toLowerCase().includes(term) ||
//       event.organizerId?.businessName?.toLowerCase().includes(term)
//     );
//   });

//   const filteredOrganizers = organizers.filter(org => {
//     if (!searchTerms.organizers) return true;
//     const term = searchTerms.organizers.toLowerCase();
//     return (
//       org.organizationName?.toLowerCase().includes(term) ||
//       org.contactPerson?.toLowerCase().includes(term) ||
//       org.contactNumber?.toLowerCase().includes(term)
//     );
//   });


//   return (
//     <>
//       {/* Include Navbar */}
//       <div dangerouslySetInnerHTML={{ __html: window.navbarHTML }} />

//       <div className="dashboard-container">
//         <div className="gradient-blob blob-1"></div>
//         <div className="gradient-blob blob-2"></div>
//         <div className="gradient-blob blob-3"></div>

//         <div className="dashboard-content">
//           {/* Sidebar */}
//           <div className="sidebar">
//             <div className="user-info">
//               <div className="profile-image">
//                 <img src={profilePic} alt="Admin Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
//               </div>
//               <h3>Admin Panel</h3>
//               <p>System Administrator</p>
//             </div>

//             <nav className="sidebar-nav">
//               <ul>
//                 <li
//                   className={activeSection === "dashboard" ? "active" : ""}
//                   onClick={() => setActiveSection("dashboard")}
//                 >
//                   <i className="fas fa-chart-line"></i> Dashboard
//                 </li>

//                 <li
//                   className={activeSection === "users" ? "active" : ""}
//                   onClick={() => setActiveSection("users")}
//                 >
//                   <i className="fas fa-users"></i> Users
//                 </li>

//                 <li
//                   className={activeSection === "events" ? "active" : ""}
//                   onClick={() => setActiveSection("events")}
//                 >
//                   <i className="fas fa-calendar-alt"></i> Events
//                 </li>

//                 <li
//                   className={activeSection === "organizers" ? "active" : ""}
//                   onClick={() => setActiveSection("organizers")}
//                 >
//                   <i className="fas fa-user-tie"></i> Organizers
//                 </li>

//                 <li>
//                   <i className="fas fa-sign-out-alt"></i>
//                   <a href="/logout">Logout</a>
//                 </li>
//               </ul>
//             </nav>
//           </div>

//           {/* MAIN CONTENT */}
//           <div className="main-content">
//             {/* ------------------- DASHBOARD SECTION ------------------- */}
//             <section
//               id="dashboard"
//               className={`dashboard-section ${activeSection === "dashboard" ? "active" : ""
//                 }`}
//             >
//               <div className="section-header">
//                 <h2>Dashboard Overview</h2>
//               </div>

//               <div className="stats-container">
//                 <div className="stat-card">
//                   <h3>Total Users</h3>
//                   <div className="stat-value">{stats.userCount}</div>
//                 </div>

//                 <div className="stat-card">
//                   <h3>Total Events</h3>
//                   <div className="stat-value">{stats.eventCount}</div>
//                 </div>

//                 <div className="stat-card">
//                   <h3>Verified Organizers</h3>
//                   <div className="stat-value">{stats.verifiedOrganizerCount}</div>
//                 </div>

//                 <div className="stat-card">
//                   <h3>Total Organizers</h3>
//                   <div className="stat-value">{stats.organizerCount}</div>
//                 </div>
//               </div>

//               {/* CHARTS */}
//               <div className="table-container">
//                 <h3>Monthly Event Statistics</h3>
//                 <div className="chart-container">
//                   <canvas id="monthlyEventsChart"></canvas>
//                 </div>
//               </div>

//               <div className="table-container">
//                 <h3>Organizer Verification Status</h3>
//                 <div className="chart-container">
//                   <canvas id="organizerVerificationChart"></canvas>
//                 </div>
//               </div>

//               <div className="stats-container">
//                 <div className="table-container">
//                   <h3>Event Categories</h3>
//                   <div className="chart-container">
//                     <canvas id="eventCategoriesChart"></canvas>
//                   </div>
//                 </div>

//                 <div className="table-container">
//                   <h3>Revenue Analysis</h3>
//                   <div className="chart-container">
//                     <canvas id="revenueChart"></canvas>
//                   </div>
//                 </div>
//               </div>

//               {/* Recent Events */}
//               <div className="table-container">
//                 <div className="section-header">
//                   <h2>Recent Events</h2>
//                 </div>

//                 <table className="admin-table">
//                   <thead>
//                     <tr>
//                       <th>Event Name</th>
//                       <th>Organizer</th>
//                       <th>Date</th>
//                       <th>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {recentEvents.length > 0 ? (
//                       recentEvents.map((event) => (
//                         <tr key={event._id}>
//                           <td>{event.title}</td>
//                           <td>{event.organizer ? event.organizer.businessName : "Unknown"}</td>

//                           <td>
//                             {new Date(event.startDateTime).toLocaleDateString()}
//                           </td>
//                           <td>
//                             <span
//                               className={`status-badge ${event.status === "start_selling"
//                                 ? "status-verified"
//                                 : "status-pending"
//                                 }`}
//                             >
//                               {event.status === "start_selling"
//                                 ? "Active"
//                                 : "Pending"}
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="4" style={{ textAlign: "center" }}>
//                           No events found
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </section>

//             {/* ------------------- USERS SECTION ------------------- */}
//             <section
//               id="users"
//               className={`dashboard-section ${activeSection === "users" ? "active" : ""
//                 }`}
//             >
//               <div className="section-header">
//                 <h2>All Users</h2>
//                 <div className="search-box">
//                   <input
//                     id="user-search"
//                     type="text"
//                     placeholder="Search users..."
//                     value={searchTerms.users}
//                     onChange={(e) => setSearchTerms({ ...searchTerms, users: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="table-container">
//                 <table className="admin-table">
//                   <thead>
//                     <tr>
//                       <th>User ID</th>
//                       <th>Name</th>
//                       <th>Email</th>
//                       <th>Role</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredUsers.map((u) => (
//                       <tr key={u._id}>
//                         <td>{u._id}</td>
//                         <td>{u.name}</td>
//                         <td>{u.email}</td>
//                         <td>{u.role || "User"}</td>
//                         <td>
//                           <button
//                             className="btn btn-danger"
//                             onClick={() => handleDeleteUser(u._id)}
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </section>

//             {/* ------------------- EVENTS SECTION ------------------- */}
//             <section
//               id="events"
//               className={`dashboard-section ${activeSection === "events" ? "active" : ""
//                 }`}
//             >
//               <div className="section-header">
//                 <h2>All Events</h2>
//                 <div className="search-box">
//                   <input
//                     id="event-search"
//                     type="text"
//                     placeholder="Search events..."
//                     value={searchTerms.events}
//                     onChange={(e) => setSearchTerms({ ...searchTerms, events: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="table-container">
//                 <table className="admin-table">
//                   <thead>
//                     <tr>
//                       <th>Event ID</th>
//                       <th>Event Name</th>
//                       <th>Organizer</th>
//                       <th>Date</th>
//                       <th>Location</th>
//                       <th>Status</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredEvents.map((e) => (
//                       <tr key={e._id}>
//                         <td>{e._id}</td>
//                         <td>{e.title}</td>
//                         <td>{e.organizerId ? e.organizerId.businessName : "Unknown"}</td>
//                         <td>{new Date(e.startDateTime).toLocaleDateString()}</td>
//                         <td>{e.venue}</td>
//                         <td>
//                           <span
//                             className={`status-badge ${e.status === "active"
//                               ? "status-verified"
//                               : "status-pending"
//                               }`}
//                           >
//                             {e.status}
//                           </span>
//                         </td>
//                         <td>
//                           <button
//                             className="btn btn-secondary"
//                             onClick={() => window.location.href = `/events/${e._id}`}
//                           >
//                             View
//                           </button>
//                           <button
//                             className="btn btn-danger"
//                             onClick={() => handleDeleteEvent(e._id)}
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </section>

//             {/* ------------------- ORGANIZERS SECTION ------------------- */}
//             <section
//               id="organizers"
//               className={`dashboard-section ${activeSection === "organizers" ? "active" : ""
//                 }`}
//             >
//               <div className="section-header">
//                 <h2>Organizers Management</h2>
//                 <div className="search-box">
//                   <input
//                     id="organizer-search"
//                     type="text"
//                     placeholder="Search organizers..."
//                     value={searchTerms.organizers}
//                     onChange={(e) => setSearchTerms({ ...searchTerms, organizers: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="table-container">
//                 <table className="admin-table">
//                   <thead>
//                     <tr>
//                       <th>ID</th>
//                       <th>Organization Name</th>
//                       <th>Contact Person</th>
//                       <th>Contact Number</th>
//                       <th>Status</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredOrganizers.map((o) => (
//                       <tr key={o._id}>
//                         <td>{o._id}</td>
//                         <td>{o.organizationName}</td>
//                         <td>{o.contactPerson}</td>
//                         <td>{o.contactNumber}</td>
//                         <td>
//                           <span className={`status-badge ${o.verified ? "status-verified" : "status-pending"}`}>
//                             {o.verified ? "Verified" : "Pending"}
//                           </span>
//                         </td>
//                         <td>
//                           <button
//                             className="btn btn-secondary"
//                             onClick={() => handleViewOrganizer(o._id)}
//                           >
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </section>
//           </div>
//         </div>
//       </div>

//       {/* Organizer Modal */}
//       {showModal && selectedOrganizer && (
//         <div className="modal" style={{ display: 'block' }}>
//           <div className="modal-content">
//             <div className="modal-header">
//               <h3>Organizer Details</h3>
//               <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
//             </div>

//             <div className="organizer-details">
//               <dl>
//                 <dt>Organization Name</dt>
//                 <dd>{selectedOrganizer.organizationName || 'N/A'}</dd>

//                 <dt>Contact Person</dt>
//                 <dd>{selectedOrganizer.contactPerson || 'N/A'}</dd>

//                 <dt>Contact Number</dt>
//                 <dd>{selectedOrganizer.contactNumber || 'N/A'}</dd>

//                 <dt>Email</dt>
//                 <dd>{selectedOrganizer.userId?.email || selectedOrganizer.email || 'N/A'}</dd>

//                 <dt>Description</dt>
//                 <dd>{selectedOrganizer.description || 'N/A'}</dd>

//                 <dt>Verification Status</dt>
//                 <dd>
//                   <span className={`status-badge ${selectedOrganizer.verified ? 'status-verified' : 'status-pending'}`}>
//                     {selectedOrganizer.verified ? 'Verified' : 'Pending'}
//                   </span>
//                 </dd>
//               </dl>
//             </div>

//             <div className="modal-actions">
//               {!selectedOrganizer.verified && (
//                 <button
//                   className="btn btn-success"
//                   onClick={handleVerifyOrganizer}
//                 >
//                   Verify Organizer
//                 </button>
//               )}
//               {selectedOrganizer.verified && (
//                 <button
//                   className="btn btn-danger"
//                   onClick={handleRejectOrganizer}
//                 >
//                   Revoke Verification
//                 </button>
//               )}
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setShowModal(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default AdminDashboard;




import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, TextField, Button, Box, Grid, Paper, Typography, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility, Delete as DeleteIcon, Dashboard as DashboardIcon, People as PeopleIcon, Event as EventIcon, BusinessCenter as OrganizerIcon, LogoutRounded, Settings as SettingsIcon } from '@mui/icons-material';
import muiAdminTheme from '../styles/muiAdminTheme';

function AdminDashboard() {
  // State Management
  const [stats, setStats] = useState({
    userCount: 0,
    eventCount: 0,
    organizerCount: 0,
    verifiedOrganizerCount: 0,
    totalRevenue: 0,
    thisMonth: {
      users: 0,
      events: 0,
      registrations: 0
    }
  });

  const [recentEvents, setRecentEvents] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerms, setSearchTerms] = useState({
    users: "",
    events: "",
    organizers: "",
  });
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [accountSettings, setAccountSettings] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Chart refs: canvas DOM refs + Chart instance refs
  const monthlyEventsCanvasRef = useRef(null);
  const monthlyEventsChartRef = useRef(null);
  const eventCategoriesCanvasRef = useRef(null);
  const eventCategoriesChartRef = useRef(null);
  const revenueCanvasRef = useRef(null);
  const revenueChartRef = useRef(null);
  const organizerVerificationCanvasRef = useRef(null);
  const organizerVerificationChartRef = useRef(null);

  const API = "http://localhost:3000/admin";

  // Fetch Dashboard Data
  useEffect(() => {
    fetch(`${API}/dashboard`, { credentials: "include" })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          console.log('Dashboard API response:', result.data.statistics);
          // Don't overwrite totalRevenue with 0 from dashboard, keep the one from revenue API
          const { totalRevenue, ...otherStats } = result.data.statistics;
          setStats(prev => ({ ...prev, ...otherStats }));
          setRecentEvents(result.data.recentEvents || []);
        }
      })
      .catch(err => console.error('Dashboard fetch error:', err));

    // Fetch revenue data to populate total revenue stat
    fetch(`${API}/chart/revenue-analysis`, { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => {
        console.log('Revenue data for stat:', data);
        const totalRevenueFromChart = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
        console.log('Total revenue stat updated:', totalRevenueFromChart);
        setStats(prev => ({ ...prev, totalRevenue: totalRevenueFromChart }));
      })
      .catch(err => console.error('Revenue fetch error:', err));

    fetch(`${API}/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch(`${API}/events`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        // Get top 10 events by title (since registration count not available from API)
        const topEvents = [...data].slice(0, 10);
        setTopEvents(topEvents);
      });

    fetch(`${API}/organizers`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOrganizers(data));
  }, []);

  // Load Charts
  useEffect(() => {
    if (activeSection === "dashboard") {
      // Small delay to ensure canvas refs are mounted
      setTimeout(() => {
        loadMonthlyEventsChart();
        loadEventCategoriesChart();
        loadRevenueChart();
        loadOrganizerVerificationChart();
      }, 100);
    }
  }, [activeSection]);

  // Chart Functions
  const loadMonthlyEventsChart = () => {
    console.log('Starting loadMonthlyEventsChart...');
    fetch(`${API}/chart/monthly-events`, { credentials: 'include' })
      .then((response) => {
        console.log('Monthly events API response:', response.status);
        return response.json();
      })
      .then((data) => {
        console.log('Monthly events chart data:', data);
        const canvas = monthlyEventsCanvasRef.current;
        if (!canvas) {
          console.error('Monthly events canvas ref not found');
          return;
        }

        if (monthlyEventsChartRef.current) {
          monthlyEventsChartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(147, 83, 211, 0.8)");
        gradient.addColorStop(1, "rgba(147, 83, 211, 0.2)");

        monthlyEventsChartRef.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.map((item) => `${item.month} ${item.year}`),
            datasets: [
              {
                label: "Events Created",
                data: data.map((item) => item.count),
                backgroundColor: gradient,
                borderColor: "rgba(147, 83, 211, 1)",
                borderWidth: 2,
                pointBackgroundColor: "#fff",
                pointBorderColor: "rgba(147, 83, 211, 1)",
                pointRadius: 5,
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, labels: { color: "#374151", font: { size: 12, weight: 600 } } },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: "rgba(209, 213, 219, 0.5)" },
                ticks: { color: "#6b7280", font: { size: 11 } },
              },
              x: {
                grid: { color: "rgba(209, 213, 219, 0.5)" },
                ticks: { color: "#6b7280", font: { size: 11 } },
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error loading monthly events chart:", error));
  };

  const loadEventCategoriesChart = () => {
    console.log('Starting loadEventCategoriesChart...');
    fetch(`${API}/chart/event-categories`, { credentials: 'include' })
      .then((response) => {
        console.log('Event categories API response:', response.status);
        return response.json();
      })
      .then((data) => {
        console.log('Event categories chart data:', data);
        const canvas = eventCategoriesCanvasRef.current;
        if (!canvas) {
          console.error('Event categories canvas ref not found');
          return;
        }

        if (eventCategoriesChartRef.current) {
          eventCategoriesChartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        const colors = [
          "#9353D3",
          "#f43f5e",
          "#643d88",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#3b82f6",
          "#a855f7",
          "#6366f1",
          "#ec4899",
        ];

        eventCategoriesChartRef.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: data.map((item) => item.category),
            datasets: [
              {
                label: "Number of Events",
                data: data.map((item) => item.count),
                backgroundColor: data.map(
                  (_, index) => colors[index % colors.length]
                ),
                borderWidth: 2,
                borderColor: "#121212",
                hoverOffset: 10,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "60%",
            plugins: {
              legend: {
                display: true,
                position: "right",
                labels: { color: "#374151", font: { size: 12, weight: 500 } },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error loading event categories chart:", error));
  };

  const loadRevenueChart = () => {
    console.log('Starting loadRevenueChart...');
    fetch(`${API}/chart/revenue-analysis`, { credentials: 'include' })
      .then((response) => {
        console.log('Revenue API response:', response.status);
        return response.json();
      })
      .then((data) => {
        console.log('Revenue chart data:', data);
        const canvas = revenueCanvasRef.current;
        if (!canvas) {
          console.error('Revenue canvas ref not found');
          return;
        }

        if (revenueChartRef.current) {
          revenueChartRef.current.destroy();
        }

        // Calculate total revenue from chart data
        const totalRevenueFromChart = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
        console.log('Total revenue calculated:', totalRevenueFromChart);
        setStats(prev => ({ ...prev, totalRevenue: totalRevenueFromChart }));

        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(244, 63, 94, 0.8)");
        gradient.addColorStop(1, "rgba(244, 63, 94, 0.2)");

        revenueChartRef.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.map((item) => `${item.month} ${item.year}`),
            datasets: [
              {
                label: "Revenue ($)",
                data: data.map((item) => item.revenue),
                backgroundColor: gradient,
                borderColor: "rgba(244, 63, 94, 1)",
                borderWidth: 1,
                borderRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: "rgba(209, 213, 219, 0.5)" },
                ticks: { color: "#6b7280", font: { size: 11 }, callback: (value) => "$" + value },
              },
              x: {
                grid: { color: "rgba(209, 213, 219, 0.5)" },
                ticks: { color: "#6b7280", font: { size: 11 } }
              },
            },
            plugins: {
              legend: { display: true, labels: { color: "#374151", font: { size: 12, weight: 600 } } },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error loading revenue chart:", error));
  };

  const loadOrganizerVerificationChart = () => {
    console.log('Starting loadOrganizerVerificationChart...');
    fetch(`${API}/chart/organizer-verification`, { credentials: 'include' })
      .then((response) => {
        console.log('Organizer verification API response:', response.status);
        return response.json();
      })
      .then((data) => {
        console.log('Organizer verification chart data:', data);
        const canvas = organizerVerificationCanvasRef.current;
        if (!canvas) {
          console.error('Organizer verification canvas ref not found');
          return;
        }

        if (organizerVerificationChartRef.current) {
          organizerVerificationChartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        const colors = ["#10b981", "#f59e0b"];

        organizerVerificationChartRef.current = new Chart(ctx, {
          type: "pie",
          data: {
            labels: data.map((item) => item.status),
            datasets: [
              {
                label: "Number of Organizers",
                data: data.map((item) => item.count),
                backgroundColor: colors,
                borderColor: "#121212",
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: { color: "#374151", font: { size: 12, weight: 500 } },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
              },
            },
          },
        });
      })
      .catch((error) =>
        console.error("Error loading organizer verification chart:", error)
      );
  };

  // Handler functions for CRUD operations
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'User deleted successfully');
        // Refresh users list
        const usersResponse = await fetch(`${API}/users`, { credentials: "include" });
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // Try to parse JSON response
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If response is not JSON, it might be HTML (error page)
        const text = await response.text();
        console.error('Non-JSON response:', text);
        alert('Error: Server returned an unexpected response. Please make sure you are logged in.');
        return;
      }

      if (response.ok && data.success) {
        alert('Event deleted successfully');
        // Refresh events list
        const eventsResponse = await fetch(`${API}/events`, { credentials: "include" });
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      } else {
        alert(data.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event: ' + error.message);
    }
  };

  const handleViewOrganizer = async (organizerId) => {
    try {
      console.log('Fetching organizer:', organizerId);
      const response = await fetch(`${API}/organizers/${organizerId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Failed to load organizer: ${errorData.message || response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log('Organizer data:', data);
      setSelectedOrganizer(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching organizer:', error);
      alert(`Error loading organizer details: ${error.message}`);
    }
  };

  const handleVerifyOrganizer = async () => {
    if (!selectedOrganizer) return;

    try {
      const response = await fetch(`${API}/organizers/${selectedOrganizer._id}/verify`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Organizer verified successfully');
        setShowModal(false);
        // Refresh organizers list
        const organizersResponse = await fetch(`${API}/organizers`, { credentials: "include" });
        const organizersData = await organizersResponse.json();
        setOrganizers(organizersData);
      } else {
        alert(data.message || 'Failed to verify organizer');
      }
    } catch (error) {
      console.error('Error verifying organizer:', error);
      alert('Error verifying organizer');
    }
  };

  const handleRejectOrganizer = async () => {
    if (!selectedOrganizer) return;

    try {
      const response = await fetch(`${API}/organizers/${selectedOrganizer._id}/reject`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Organizer rejected');
        setShowModal(false);
        // Refresh organizers list
        const organizersResponse = await fetch(`${API}/organizers`, { credentials: "include" });
        const organizersData = await organizersResponse.json();
        setOrganizers(organizersData);
      } else {
        alert(data.message || 'Failed to reject organizer');
      }
    } catch (error) {
      console.error('Error rejecting organizer:', error);
      alert('Error rejecting organizer');
    }
  };

  const handleUpdateAccountSettings = async () => {
    if (accountSettings.newPassword && accountSettings.newPassword !== accountSettings.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/auth/update-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountSettings.email,
          currentPassword: accountSettings.currentPassword,
          newPassword: accountSettings.newPassword || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Account settings updated successfully');
        setShowAccountSettingsModal(false);
        setAccountSettings({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.message || 'Failed to update account settings');
      }
    } catch (error) {
      console.error('Error updating account settings:', error);
      alert('Error updating account settings: ' + error.message);
    }
  };

  // Filter functions for search
  const filteredUsers = users.filter(user => {
    if (!searchTerms.users) return true;
    const term = searchTerms.users.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  });

  const filteredEvents = events.filter(event => {
    if (!searchTerms.events) return true;
    const term = searchTerms.events.toLowerCase();
    return (
      event.title?.toLowerCase().includes(term) ||
      event.venue?.toLowerCase().includes(term) ||
      event.status?.toLowerCase().includes(term)
    );
  });

  const filteredOrganizers = organizers.filter(org => {
    if (!searchTerms.organizers) return true;
    const term = searchTerms.organizers.toLowerCase();
    return org.organizationName?.toLowerCase().includes(term);
  });


  return (
    <ThemeProvider theme={muiAdminTheme}>
      <CssBaseline />
      <>
        {/* Include Navbar */}
        <div dangerouslySetInnerHTML={{ __html: window.navbarHTML }} />

        <div className="dashboard-container">
          <div className="gradient-blob blob-1"></div>
          <div className="gradient-blob blob-2"></div>
          <div className="gradient-blob blob-3"></div>

          <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: 'calc(100vh - 80px)', bgcolor: 'background.default' }}>
            {/* Sidebar */}
            <Box sx={{ width: 260, p: 3 }}>
              <Paper elevation={2} sx={{ p: 2.5, background: 'linear-gradient(180deg, rgba(147, 83, 211, 0.1) 0%, rgba(100, 61, 136, 0.05) 100%)', border: '1px solid rgba(147, 83, 211, 0.2)', backdropFilter: 'blur(10px)' }}>
                <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                  <Avatar src="client\src\assets\images\proflepic.jpeg" sx={{ width: 80, height: 80, border: '3px solid', borderColor: 'primary.main', boxShadow: '0 0 20px rgba(147, 83, 211, 0.4)' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #9353D3, #b06cff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Panel</Typography>
                  <Typography variant="body2" color="text.secondary">System Administrator</Typography>
                </Stack>

                <Stack spacing={1.2} sx={{ mb: 2 }}>
                  <Button
                    startIcon={<DashboardIcon />}
                    variant={activeSection === 'dashboard' ? 'contained' : 'text'}
                    color="primary"
                    onClick={() => setActiveSection('dashboard')}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    startIcon={<PeopleIcon />}
                    variant={activeSection === 'users' ? 'contained' : 'text'}
                    color="primary"
                    onClick={() => setActiveSection('users')}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Users
                  </Button>
                  <Button
                    startIcon={<EventIcon />}
                    variant={activeSection === 'events' ? 'contained' : 'text'}
                    color="primary"
                    onClick={() => setActiveSection('events')}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Events
                  </Button>
                  <Button
                    startIcon={<OrganizerIcon />}
                    variant={activeSection === 'organizers' ? 'contained' : 'text'}
                    color="primary"
                    onClick={() => setActiveSection('organizers')}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Organizers
                  </Button>
                </Stack>

                <Stack spacing={1.2} sx={{ mb: 2, borderTop: '1px solid rgba(147, 83, 211, 0.2)', pt: 2 }}>
                  <Button
                    startIcon={<SettingsIcon />}
                    variant={activeSection === 'accountSettings' ? 'contained' : 'text'}
                    color="primary"
                    onClick={() => setActiveSection('accountSettings')}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Account Settings
                  </Button>
                </Stack>

                <Button
                  component="a"
                  href="/logout?redirect=/"
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutRounded />}
                  fullWidth
                  sx={{ mt: 2, justifyContent: 'flex-start', borderColor: 'rgba(239, 68, 68, 0.3)', '&:hover': { borderColor: 'error.main', bgcolor: 'rgba(239, 68, 68, 0.05)' } }}
                >
                  Logout
                </Button>
              </Paper>
            </Box>

            {/* MAIN CONTENT */}
            <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
              {/* ------------------- DASHBOARD SECTION ------------------- */}
              <Box
                component="section"
                id="dashboard"
                sx={{ display: activeSection === "dashboard" ? "block" : "none" }}
              >
                {/* Section Header */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Dashboard Overview</Typography>
                  <Typography variant="body2" color="text.secondary">Monitor your platform's key metrics and performance indicators in real-time</Typography>
                </Box>

                {/* SECTION 1: CORE PLATFORM METRICS */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#9353D3' }}>Core Platform Metrics</Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)', border: '1.5px solid rgba(16, 185, 129, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(16, 185, 129, 0.5)' } }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600, fontSize: '0.9rem' }}>👥 Total Users</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', mb: 1.5, letterSpacing: '-0.5px' }}>{stats.userCount}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>Active registered users on the platform</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)', border: '1.5px solid rgba(59, 130, 246, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(59, 130, 246, 0.5)' } }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600, fontSize: '0.9rem' }}>💰 Total Revenue</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#3b82f6', mb: 1.5, letterSpacing: '-0.5px' }}>${(stats.totalRevenue || 0).toLocaleString()}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>Total earnings from all events and transactions</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)', border: '1.5px solid rgba(245, 158, 11, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(245, 158, 11, 0.5)' } }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600, fontSize: '0.9rem' }}>🏢 Total Organizers</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1.5, letterSpacing: '-0.5px' }}>{stats.organizerCount}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>Registered event organizers and business partners</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(6, 182, 212, 0.02) 100%)', border: '1.5px solid rgba(6, 182, 212, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(6, 182, 212, 0.5)' } }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600, fontSize: '0.9rem' }}>✅ Verified Organizers</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#06b6d4', mb: 1.5, letterSpacing: '-0.5px' }}>{stats.verifiedOrganizerCount}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>Organizers who have completed verification</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* SECTION 2: EVENTS & REGISTRATIONS */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#9353D3' }}>Events & Registrations</Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(147, 83, 211, 0.08) 0%, rgba(147, 83, 211, 0.02) 100%)', border: '1.5px solid rgba(147, 83, 211, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(147, 83, 211, 0.5)' } }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600, fontSize: '0.9rem' }}>📅 Total Events</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#9353D3', mb: 1.5, letterSpacing: '-0.5px' }}>{stats.eventCount}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>All events created on the platform</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)', border: '1.5px solid rgba(34, 197, 94, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(34, 197, 94, 0.5)' } }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600, fontSize: '0.9rem' }}>📌 Monthly Events</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#22c55e', mb: 1.5, letterSpacing: '-0.5px' }}>{stats.thisMonth?.events || 0}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>Events created this month</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%)', border: '1.5px solid rgba(168, 85, 247, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(168, 85, 247, 0.5)' } }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontWeight: 600, fontSize: '0.9rem' }}>🎟️ Monthly Registrations</Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, color: '#a855f7', mb: 1.5, letterSpacing: '-0.5px' }}>{stats.thisMonth?.registrations || 0}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>User registrations this month</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* SECTION 3: QUALITY METRICS */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#9353D3' }}>Quality & Performance Metrics</Typography>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 4, background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)', border: '1.5px solid rgba(249, 115, 22, 0.3)', borderRadius: 2.5, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(249, 115, 22, 0.5)' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography sx={{ fontSize: '2.5rem' }}>📊</Typography>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem' }}>Verification Rate</Typography>
                            <Typography variant="caption" color="text.secondary">Percentage of organizers verified</Typography>
                          </Box>
                        </Box>
                        <Typography variant="h2" sx={{ fontWeight: 800, color: '#f97316', mb: 1.5, letterSpacing: '-1px' }}>{stats.organizerCount > 0 ? ((stats.verifiedOrganizerCount / stats.organizerCount) * 100).toFixed(1) : 0}%</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {stats.verifiedOrganizerCount} out of {stats.organizerCount} organizers have completed verification
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* CHARTS */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#9353D3' }}>Statistics & Analytics</Typography>
                  <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(147, 83, 211, 0.08) 0%, rgba(147, 83, 211, 0.02) 100%)', border: '1.5px solid rgba(147, 83, 211, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', minHeight: 500, transition: 'all 0.3s', '&:hover': { boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(147, 83, 211, 0.5)' } }}>
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Typography sx={{ fontSize: '1.5rem' }}>📈</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Monthly Event Statistics</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Track events created each month</Typography>
                        </Box>
                        <Box sx={{ position: 'relative', height: 400, flex: 1 }}>
                          <canvas ref={monthlyEventsCanvasRef}></canvas>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(147, 83, 211, 0.08) 0%, rgba(147, 83, 211, 0.02) 100%)', border: '1.5px solid rgba(147, 83, 211, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', minHeight: 500, transition: 'all 0.3s', '&:hover': { boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(147, 83, 211, 0.5)' } }}>
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Typography sx={{ fontSize: '1.5rem' }}>🔐</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Organizer Verification</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Verified vs pending organizers</Typography>
                        </Box>
                        <Box sx={{ position: 'relative', height: 400, flex: 1 }}>
                          <canvas ref={organizerVerificationCanvasRef}></canvas>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(147, 83, 211, 0.08) 0%, rgba(147, 83, 211, 0.02) 100%)', border: '1.5px solid rgba(147, 83, 211, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', minHeight: 500, transition: 'all 0.3s', '&:hover': { boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(147, 83, 211, 0.5)' } }}>
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Typography sx={{ fontSize: '1.5rem' }}>🏷️</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Event Categories</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Distribution by category</Typography>
                        </Box>
                        <Box sx={{ position: 'relative', height: 400, flex: 1 }}>
                          <canvas ref={eventCategoriesCanvasRef}></canvas>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 3.5, background: 'linear-gradient(135deg, rgba(147, 83, 211, 0.08) 0%, rgba(147, 83, 211, 0.02) 100%)', border: '1.5px solid rgba(147, 83, 211, 0.3)', borderRadius: 2.5, display: 'flex', flexDirection: 'column', minHeight: 500, transition: 'all 0.3s', '&:hover': { boxShadow: '0 16px 32px rgba(147, 83, 211, 0.12)', borderColor: 'rgba(147, 83, 211, 0.5)' } }}>
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Typography sx={{ fontSize: '1.5rem' }}>💵</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Revenue Analysis</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">Monthly revenue trends</Typography>
                        </Box>
                        <Box sx={{ position: 'relative', height: 400, flex: 1 }}>
                          <canvas ref={revenueCanvasRef}></canvas>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                {/* Recent Events */}
                <Paper sx={{ p: 3, mb: 3, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Events</Typography>
                    <Chip label="Latest" color="primary" size="small" />
                  </Box>
                  <TableContainer sx={{ overflow: 'visible' }}>
                    <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(147, 83, 211, 0.1)' }}>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Event Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentEvents.length > 0 ? recentEvents.map((event) => (
                          <TableRow key={event._id} hover sx={{ '&:hover': { bgcolor: 'rgba(147, 83, 211, 0.08)' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{event.title}</TableCell>
                            <TableCell>{new Date(event.startDateTime).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  event.status === 'completed' || new Date(event.startDateTime) < new Date() ? 'Completed' :
                                    (event.status === 'start_selling' || event.status === 'active' ? 'Active' : 'Pending')
                                }
                                color={
                                  event.status === 'completed' || new Date(event.startDateTime) < new Date() ? 'default' :
                                    (event.status === 'start_selling' || event.status === 'active' ? 'success' : 'warning')
                                }
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 3 }}>No events found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                {/* Top 10 Events by Registrations */}
                <Paper sx={{ p: 3, mb: 3, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Top 10 Events by Registrations</Typography>
                    <Chip label="Popular" color="secondary" size="small" />
                  </Box>
                  <TableContainer sx={{ overflow: 'visible' }}>
                    <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(147, 83, 211, 0.1)' }}>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Event Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }} align="center">Registrations</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topEvents.length > 0 ? topEvents.map((event, index) => (
                          <TableRow key={event._id} hover sx={{ '&:hover': { bgcolor: 'rgba(147, 83, 211, 0.08)' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label={index + 1} size="small" variant="filled" color={index < 3 ? 'warning' : 'default'} />
                                {event.title}
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'success.main' }}>{event.registrationCount || 0}</TableCell>
                            <TableCell>{new Date(event.startDateTime).toLocaleDateString()}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 3 }}>No events found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              {/* ------------------- USERS SECTION ------------------- */}
              <Box
                component="section"
                id="users"
                sx={{ display: activeSection === "users" ? "block" : "none" }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>All Users</Typography>
                  <TextField
                    placeholder="Search users..."
                    variant="outlined"
                    size="small"
                    value={searchTerms.users}
                    onChange={(e) => setSearchTerms({ ...searchTerms, users: e.target.value })}
                    sx={{ width: '320px', mb: 3 }}
                  />
                </Box>

                <Paper sx={{ p: 3, overflow: 'hidden' }}>
                  <TableContainer sx={{ overflow: 'visible' }}>
                    <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(147, 83, 211, 0.1)' }}>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>User ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Role</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u._id} hover sx={{ '&:hover': { bgcolor: 'rgba(147, 83, 211, 0.08)' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{u._id}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              <Chip
                                label={u.role || 'User'}
                                color={u.role === 'admin' ? 'error' : u.role === 'organizer' ? 'warning' : 'info'}
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton color="error" size="small" onClick={() => handleDeleteUser(u._id)} sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.15)', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              {/* ------------------- EVENTS SECTION ------------------- */}
              <Box
                component="section"
                id="events"
                sx={{ display: activeSection === "events" ? "block" : "none" }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>All Events</Typography>
                  <TextField
                    placeholder="Search events..."
                    variant="outlined"
                    size="small"
                    value={searchTerms.events}
                    onChange={(e) => setSearchTerms({ ...searchTerms, events: e.target.value })}
                    sx={{ width: '320px', mb: 3 }}
                  />
                </Box>

                <Paper sx={{ p: 3, overflow: 'hidden' }}>
                  <TableContainer sx={{ overflow: 'visible' }}>
                    <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(147, 83, 211, 0.1)' }}>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Event ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Event Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredEvents.map((e) => (
                          <TableRow key={e._id} hover sx={{ '&:hover': { bgcolor: 'rgba(147, 83, 211, 0.08)' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{e._id}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{e.title}</TableCell>
                            <TableCell>{new Date(e.startDateTime).toLocaleDateString()}</TableCell>
                            <TableCell>{e.venue}</TableCell>
                            <TableCell>
                              <Chip
                                label={e.status}
                                color={e.status === 'active' ? 'success' : 'warning'}
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary" onClick={() => window.location.href = `/events/${e._id}`} sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.15)' } }}>
                                <Visibility />
                              </IconButton>
                              <IconButton color="error" size="small" onClick={() => handleDeleteEvent(e._id)} sx={{ transition: 'all 0.2s', '&:hover': { transform: 'scale(1.15)', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              {/* ------------------- ORGANIZERS SECTION ------------------- */}
              <Box
                component="section"
                id="organizers"
                sx={{ display: activeSection === "organizers" ? "block" : "none" }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Organizers Management</Typography>
                  <TextField
                    placeholder="Search organizers..."
                    variant="outlined"
                    size="small"
                    value={searchTerms.organizers}
                    onChange={(e) => setSearchTerms({ ...searchTerms, organizers: e.target.value })}
                    sx={{ width: '320px', mb: 3 }}
                  />
                </Box>

                <Paper sx={{ p: 3, overflow: 'hidden' }}>
                  <TableContainer sx={{ overflow: 'visible' }}>
                    <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(147, 83, 211, 0.1)' }}>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Organization Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrganizers.map((o) => (
                          <TableRow key={o._id} hover sx={{ '&:hover': { bgcolor: 'rgba(147, 83, 211, 0.08)' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{o._id}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{o.organizationName}</TableCell>
                            <TableCell>
                              <Chip
                                label={o.verified ? 'Verified' : 'Pending'}
                                color={o.verified ? 'success' : 'warning'}
                                size="small"
                                variant="filled"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleViewOrganizer(o._id)}
                                sx={{ transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(147, 83, 211, 0.3)' } }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>

              {/* ------------------- ACCOUNT SETTINGS SECTION ------------------- */}
              <Box
                component="section"
                id="accountSettings"
                sx={{ display: activeSection === "accountSettings" ? "block" : "none" }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Account Settings</Typography>
                </Box>

                <Paper sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Update Email Address</Typography>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email Address"
                        placeholder="Enter your email"
                        value={accountSettings.email}
                        onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ borderTop: '1px solid rgba(147, 83, 211, 0.2)', pt: 3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Change Password</Typography>

                      <Stack spacing={2}>
                        <TextField
                          fullWidth
                          type="password"
                          label="Current Password"
                          placeholder="Enter your current password"
                          value={accountSettings.currentPassword}
                          onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
                          size="small"
                          variant="outlined"
                        />

                        <TextField
                          fullWidth
                          type="password"
                          label="New Password"
                          placeholder="Enter new password"
                          value={accountSettings.newPassword}
                          onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
                          size="small"
                          variant="outlined"
                        />

                        <TextField
                          fullWidth
                          type="password"
                          label="Confirm New Password"
                          placeholder="Confirm new password"
                          value={accountSettings.confirmPassword}
                          onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpdateAccountSettings}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setAccountSettings({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' })}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Clear
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            </Box>
          </Box>
        </div>

        {/* Organizer Modal */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, bgcolor: 'rgba(147, 83, 211, 0.1)', borderBottom: '1px solid rgba(147, 83, 211, 0.2)' }}>
            Organizer Details
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedOrganizer && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Organization Name</Typography>
                  <Typography variant="body2">{selectedOrganizer.organizationName || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Email</Typography>
                  <Typography variant="body2">{selectedOrganizer.userId?.email || selectedOrganizer.email || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Description</Typography>
                  <Typography variant="body2">{selectedOrganizer.description || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Verification Status</Typography>
                  <Chip
                    label={selectedOrganizer.verified ? 'Verified' : 'Pending'}
                    color={selectedOrganizer.verified ? 'success' : 'warning'}
                    size="small"
                    variant="filled"
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(147, 83, 211, 0.2)' }}>
            {selectedOrganizer && !selectedOrganizer.verified && (
              <Button
                variant="contained"
                color="success"
                onClick={handleVerifyOrganizer}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Verify Organizer
              </Button>
            )}
            {selectedOrganizer && selectedOrganizer.verified && (
              <Button
                variant="contained"
                color="error"
                onClick={handleRejectOrganizer}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Revoke Verification
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={() => setShowModal(false)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </ThemeProvider>
  );
}

export default AdminDashboard;

