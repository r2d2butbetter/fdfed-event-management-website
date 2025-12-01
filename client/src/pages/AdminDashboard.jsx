import React, { useEffect, useState } from "react";
import "../css/admin.css";
import Chart from "chart.js/auto";

function AdminDashboard() {
  const [stats, setStats] = useState({
    userCount: 0,
    eventCount: 0,
    organizerCount: 0,
    verifiedOrganizerCount: 0,
  });

  const [recentEvents, setRecentEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerms, setSearchTerms] = useState({
    users: "",
    events: "",
    organizers: "",
  });

  const API = "http://localhost:3000/admin";

  // Fetch Dashboard Data
  useEffect(() => {
    fetch(`${API}/dashboard`, { credentials: "include" })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStats(result.data.statistics);
          setRecentEvents(result.data.recentEvents);
        }
      });

    fetch(`${API}/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setUsers(data));

    fetch(`${API}/events`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setEvents(data));

    fetch(`${API}/organizers`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOrganizers(data));
  }, []);

  // Load Charts
  useEffect(() => {
    if (activeSection === "dashboard") {
      loadMonthlyEventsChart();
      loadEventCategoriesChart();
      loadRevenueChart();
      loadOrganizerVerificationChart();
    }
  }, [activeSection, stats]);

  // Chart Functions
  const loadMonthlyEventsChart = () => {
    fetch(`${API}/chart/monthly-events`)
      .then((response) => response.json())
      .then((data) => {
        const ctx = document.getElementById("monthlyEventsChart");
        if (!ctx) return;

        if (window.monthlyEventsChartInstance) {
          window.monthlyEventsChartInstance.destroy();
        }

        const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(147, 83, 211, 0.8)");
        gradient.addColorStop(1, "rgba(147, 83, 211, 0.2)");

        window.monthlyEventsChartInstance = new Chart(ctx, {
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
              legend: { display: true, labels: { color: "#fff" } },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "#fff" },
              },
              x: {
                grid: { color: "rgba(255, 255, 255, 0.1)" },
                ticks: { color: "#fff" },
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error loading monthly events chart:", error));
  };

  const loadEventCategoriesChart = () => {
    fetch(`${API}/chart/event-categories`)
      .then((response) => response.json())
      .then((data) => {
        const ctx = document.getElementById("eventCategoriesChart");
        if (!ctx) return;

        if (window.eventCategoriesChartInstance) {
          window.eventCategoriesChartInstance.destroy();
        }

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

        window.eventCategoriesChartInstance = new Chart(ctx, {
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
                labels: { color: "#fff" },
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
    fetch(`${API}/chart/revenue-analysis`)
      .then((response) => response.json())
      .then((data) => {
        const ctx = document.getElementById("revenueChart");
        if (!ctx) return;

        if (window.revenueChartInstance) {
          window.revenueChartInstance.destroy();
        }

        const gradient = ctx.getContext("2d").createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(244, 63, 94, 0.8)");
        gradient.addColorStop(1, "rgba(244, 63, 94, 0.2)");

        window.revenueChartInstance = new Chart(ctx, {
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
                ticks: { color: "#fff", callback: (value) => "$" + value },
              },
              x: { ticks: { color: "#fff" } },
            },
          },
        });
      })
      .catch((error) => console.error("Error loading revenue chart:", error));
  };

  const loadOrganizerVerificationChart = () => {
    fetch(`${API}/chart/organizer-verification`)
      .then((response) => response.json())
      .then((data) => {
        const ctx = document.getElementById("organizerVerificationChart");
        if (!ctx) return;

        if (window.organizerVerificationChartInstance) {
          window.organizerVerificationChartInstance.destroy();
        }

        const colors = ["#10b981", "#f59e0b"];

        window.organizerVerificationChartInstance = new Chart(ctx, {
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
                labels: { color: "#fff" },
              },
            },
          },
        });
      })
      .catch((error) =>
        console.error("Error loading organizer verification chart:", error)
      );
  };

  // Search functionality
    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#users table tbody tr');
            
            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || email.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    const eventSearchInput = document.getElementById('event-search');
    if (eventSearchInput) {
        eventSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#events table tbody tr');
            
            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const organizer = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || organizer.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    const organizerSearchInput = document.getElementById('organizer-search');
    if (organizerSearchInput) {
        organizerSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#organizers table tbody tr');
            
            rows.forEach(row => {
                const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const contact = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || contact.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    function addUserEventListeners() {
        // Edit user
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                // Implement edit user functionality
                alert(`Edit user with ID: ${userId}`);
            });
        });
        
        // Delete user
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this user?')) {
                    fetch(`/admin/users/${userId}`, {
                        method: 'DELETE',
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        fetchUsers();
                    })
                    .catch(error => console.error('Error deleting user:', error));
                }
            });
        });
    }
  


  return (
    <>
      {/* Include Navbar */}
      <div dangerouslySetInnerHTML={{ __html: window.navbarHTML}} />

      <div className="dashboard-container">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>

        <div className="dashboard-content">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="user-info">
              <div className="profile-image">
                <img src="./guest.png" alt="Admin" />
              </div>
              <h3>Admin Panel</h3>
              <p>System Administrator</p>
            </div>

            <nav className="sidebar-nav">
              <ul>
                <li
                  className={activeSection === "dashboard" ? "active" : ""}
                  onClick={() => setActiveSection("dashboard")}
                >
                  <i className="fas fa-chart-line"></i> Dashboard
                </li>

                <li
                  className={activeSection === "users" ? "active" : ""}
                  onClick={() => setActiveSection("users")}
                >
                  <i className="fas fa-users"></i> Users
                </li>

                <li
                  className={activeSection === "events" ? "active" : ""}
                  onClick={() => setActiveSection("events")}
                >
                  <i className="fas fa-calendar-alt"></i> Events
                </li>

                <li
                  className={activeSection === "organizers" ? "active" : ""}
                  onClick={() => setActiveSection("organizers")}
                >
                  <i className="fas fa-user-tie"></i> Organizers
                </li>

                <li>
                  <i className="fas fa-sign-out-alt"></i>
                  <a href="/logout">Logout</a>
                </li>
              </ul>
            </nav>
          </div>

          {/* MAIN CONTENT */}
          <div className="main-content">
            {/* ------------------- DASHBOARD SECTION ------------------- */}
            <section
              id="dashboard"
              className={`dashboard-section ${
                activeSection === "dashboard" ? "active" : ""
              }`}
            >
              <div className="section-header">
                <h2>Dashboard Overview</h2>
              </div>

              <div className="stats-container">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <div className="stat-value">{stats.userCount}</div>
                </div>

                <div className="stat-card">
                  <h3>Total Events</h3>
                  <div className="stat-value">{stats.eventCount}</div>
                </div>

                <div className="stat-card">
                  <h3>Verified Organizers</h3>
                  <div className="stat-value">{stats.verifiedOrganizerCount}</div>
                </div>

                <div className="stat-card">
                  <h3>Total Organizers</h3>
                  <div className="stat-value">{stats.organizerCount}</div>
                </div>
              </div>

              {/* CHARTS */}
              <div className="table-container">
                <h3>Monthly Event Statistics</h3>
                <div className="chart-container">
                  <canvas id="monthlyEventsChart"></canvas>
                </div>
              </div>

              <div className="table-container">
                <h3>Organizer Verification Status</h3>
                <div className="chart-container">
                  <canvas id="organizerVerificationChart"></canvas>
                </div>
              </div>

              <div className="stats-container">
                <div className="table-container">
                  <h3>Event Categories</h3>
                  <div className="chart-container">
                    <canvas id="eventCategoriesChart"></canvas>
                  </div>
                </div>

                <div className="table-container">
                  <h3>Revenue Analysis</h3>
                  <div className="chart-container">
                    <canvas id="revenueChart"></canvas>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="table-container">
                <div className="section-header">
                  <h2>Recent Events</h2>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Organizer</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <tr key={event._id}>
                          <td>{event.title}</td>
                          <td>{event.organizer ? event.organizer.businessName : "Unknown"}</td>

                          <td>
                            {new Date(event.startDateTime).toLocaleDateString()}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                event.status === "start_selling"
                                  ? "status-verified"
                                  : "status-pending"
                              }`}
                            >
                              {event.status === "start_selling"
                                ? "Active"
                                : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center" }}>
                          No events found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ------------------- USERS SECTION ------------------- */}
            <section
              id="users"
              className={`dashboard-section ${
                activeSection === "users" ? "active" : ""
              }`}
            >
              <div className="section-header">
                <h2>All Users</h2>
                <div className="search-box">
  <input id="user-search" type="text" placeholder="Search users..." />
  <button className="btn-primary">Search</button>
</div>

              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u._id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role || "User"}</td>

                        <td>
                          <button className="btn btn-secondary">Edit</button>
                          <button
  className="btn btn-danger delete-user"
  data-id={u._id}
>
  Delete
</button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ------------------- EVENTS SECTION ------------------- */}
            <section
              id="events"
              className={`dashboard-section ${
                activeSection === "events" ? "active" : ""
              }`}
            >
              <div className="section-header">
                <h2>All Events</h2>
                <div className="search-box">
  <input id="event-search" type="text" placeholder="Search events..." />
  <button className="btn-primary">Search</button>
</div>

              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>Event Name</th>
                      <th>Organizer</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e._id}>
                        <td>{e._id}</td>
                        <td>{e.title}</td>
                        <td>{e.organizerId ? e.organizerId.businessName : "Unknown"}</td>
<td>{new Date(e.startDateTime).toLocaleDateString()}</td>
<td>{e.venue}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              e.status === "active"
                                ? "status-verified"
                                : "status-pending"
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-secondary">View</button>
                          <button className="btn btn-danger delete-event">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ------------------- ORGANIZERS SECTION ------------------- */}
            <section
              id="organizers"
              className={`dashboard-section ${
                activeSection === "organizers" ? "active" : ""
              }`}
            >
              <div className="section-header">
                <h2>Organizers Management</h2>
                <div className="search-box">
  <input id="organizer-search" type="text" placeholder="Search organizers..." />
  <button className="btn-primary">Search</button>
</div>

              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Organization Name</th>
                      <th>Contact Person</th>
                      <th>Contact Number</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizers.map((o) => (
                      <tr key={o._id}>
                        <td>{o._id}</td>
                        <td>{o.organizationName}</td>
                        <td>{o.contactPerson}</td>
                        <td>{o.contactNumber}</td>
                        <td>
  <span className={`status-badge ${o.verified ? "status-verified" : "status-pending"}`}>
    {o.verified ? "Verified" : "Pending"}
  </span>
</td>

                        <td>
                          <button
                            className="btn btn-secondary view-organizer"
                            data-id={o._id}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Organizer Modal (kept same) */}
      <div id="organizerModal" className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Organizer Details</h3>
            <button className="close-modal">&times;</button>
          </div>

          <div className="organizer-details">
            <dl>
              <dt>Organization Name</dt>
              <dd id="org-name"></dd>

              <dt>Contact Person</dt>
              <dd id="org-contact"></dd>

              <dt>Contact Number</dt>
              <dd id="org-phone"></dd>

              <dt>Email</dt>
              <dd id="org-email"></dd>

              <dt>Description</dt>
              <dd id="org-description"></dd>
            </dl>
          </div>

          <div className="modal-actions">
            <button className="btn btn-success" id="verifyOrganizer">
              Verify Organizer
            </button>
            <button className="btn btn-danger" id="rejectOrganizer">
              Reject
            </button>
            <button className="btn btn-secondary" id="closeModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
