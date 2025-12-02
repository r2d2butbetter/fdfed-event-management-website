// import { v4 as uuidv4 } from 'uuid';
// import { setUser } from '../services/auth.js';
// import { getUser } from '../services/auth.js';
// import cookieParser from 'cookie-parser';
// import db from '../connection.js';
// import bcrypt from 'bcrypt';

// class orgController{
//     async loadDashboard (req, res){
//         try {
//             // Retrieve session information
//             const sessionId = req.cookies.uid;
//             const user = getUser(sessionId);

//             if (!user) {
//                 return res.status(401).json({ message: 'Unauthorized' });
//             }

//             // Fetch the organizer details
//             const organizer = await new Promise((resolve, reject) => {
//                 db.get(
//                     'SELECT * FROM Organizer WHERE userId = ?',
//                     [user.userId],
//                     (err, row) => {
//                         if (err) return reject(err);
//                         resolve(row);
//                     }
//                 );
//             });

//             if (!organizer) {
//                 return res.status(403).json({ message: 'You are not registered as an organizer.' });
//             }

//             // Fetch all events created by this organizer
//             const events = await new Promise((resolve, reject) => {
//                 db.all(
//                     'SELECT * FROM Event WHERE organizerId = ?',
//                     [organizer.organizerId],
//                     (err, rows) => {
//                         if (err) return reject(err);
//                         resolve(rows);
//                     }
//                 );
//             });

//             // Return the events as a JSON response or render a view
//             // res.status(200).json({ events });
//             console.log("EVENTS: ", events);
//             // OR render a view
//             res.render('creator_dashboard.ejs', { events });
//         } catch (error) {
//             console.error('Error retrieving organizer events:', error);
//             res.status(500).json({ message: 'An error occurred while retrieving events.' });
//         }
//     }
//     async getOrgEvents (req, res){
//         try {
//             const sessionId = req.cookies.uid;
//             const user = getUser(sessionId);

//             if (!user) {
//               return res.redirect('/login');
//             }

//             // Get the organizer's details
//             const organizer = await new Promise((resolve, reject) => {
//               db.get(
//                 'SELECT * FROM Organizer WHERE userId = ?',
//                 [user.userId],
//                 (err, row) => {
//                   if (err) return reject(err);
//                   resolve(row);
//                 }
//               );
//             });
//             console.log("Organizer ID:", organizer.organizerId);

//             const events = await new Promise((resolve, reject) => {
//                 db.all(
//                   'SELECT * FROM Event WHERE organizerId = ?',
//                   [organizer.organizerId],
//                   (err, rows) => {
//                     if (err) return reject(err);
//                     resolve(rows);
//                   }
//                 );
//               });
//               console.log("Events: ", events)
//               res.render("creator_dashboard.ejs",{events});

//         } catch (error) {
//             console.error('Error loading organizer dashboard:', error);
//             res.status(500).send('An error occurred while loading the dashboard.');
//         }
//     }  
//     async createEvents (req, res){

//         try {
//             const sessionId = req.cookies.uid;
//             const user = getUser(sessionId);

//             if (!user) {
//                 return res.status(401).json({ message: 'Unauthorized' });
//             }

//         const organizer = await new Promise((resolve, reject) => {
//             db.get('SELECT * FROM Organizer WHERE userId = ?',[user.userId], (err, row) => {
//                 if(err) return reject(err);
//                 resolve(row);
//             })
//         });
//         if(!organizer){
//             return res.status(403).json({message: 'You are not registered as an organizer'});
//         }
//         console.log("Body : ",req.body)
//         const{category, title, description, startDateTime, endDateTime, venue, capacity, price, status} = req.body;

//         if (!category || !title || !description || !startDateTime || !endDateTime || !venue || !capacity || !price) {
//             return res.status(400).json({ message: 'All fields are required.' });
//         }

//         await new Promise((resolve, reject) => {
//             db.run('INSERT INTO Event (category, title, description, startDateTime, endDateTime, venue, capacity, ticketPrice, status, organizerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//                 [category, title, description, startDateTime, endDateTime, venue, capacity, price, status, organizer.organizerId],
//                 (err) => {
//                     if (err) return reject(err);
//                     resolve();
//                 }
//             );
//         });        
//         // res.status(201).json({ message: 'Event created successfully!' });
//         res.redirect('/organizer/dashboard');
//         } catch(error){
//             console.error('Error creating event:', error);
//             res.status(500).json({ message: 'An error occurred while creating the event.' });
//         }

//     } 
//     async updateEvent (req, res){

//     }
//     async deleteEvent (req, res){

//     }
// }

// export default new orgController();

import { getUser } from '../services/auth.js';
import Organizer from '../models/organizer.js';
import Event from '../models/event.js';

class orgController {
  async loadDashboard(req, res) {
    try {
      // Retrieve session information
      const user = req.session.userId;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Import the necessary models
      const Registration = (await import('../models/registration.js')).default;
      const User = (await import('../models/user.js')).default;

      // Fetch the organizer details
      const organizer = await Organizer.findOne({ userId: req.session.userId });
      console.log("User ID:", req.session.userId);
      console.log("Organizer fetched:", organizer);

      if (!organizer) {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as an organizer.'
        });
      }

      // Fetch all events created by this organizer
      const events = await Event.find({ organizerId: organizer._id }).lean();
      const totalEvents = events.length;
      const totalactiveEvents = events.filter(event => event.status === 'start_selling').length;

      // Get upcoming events and populate with registration counts
      const upcomingEvents = events.filter(event => event.status === 'start_selling');

      // Add registration counts to each upcoming event
      for (let event of upcomingEvents) {
        const registrationCount = await Registration.countDocuments({ eventId: event._id });
        event.registrationCount = registrationCount;
        event.ticketsLeft = event.capacity - registrationCount;
      }

      // Calculate total revenue
      let totalRevenue = 0;
      for (const event of events) {
        const registrationCount = await Registration.countDocuments({ eventId: event._id });
        totalRevenue += event.ticketPrice * registrationCount;
      }

      // Calculate last month's revenue for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      // Get registrations from last month
      const lastMonthRegistrations = await Registration.find({
        eventId: { $in: events.map(event => event._id) },
        registrationDate: { $gte: twoMonthsAgo, $lt: lastMonth }
      }).populate('eventId');

      let lastMonthRevenue = 0;
      for (const reg of lastMonthRegistrations) {
        if (reg.eventId && reg.eventId.ticketPrice) {
          lastMonthRevenue += reg.eventId.ticketPrice;
        }
      }

      // Calculate revenue change percentage
      const revenueChange = lastMonthRevenue > 0 ?
        Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

      // Get total number of attendees (registrations)
      const totalAttendees = await Registration.countDocuments({
        eventId: { $in: events.map(event => event._id) }
      });

      // Get last month's attendees
      const lastMonthAttendees = await Registration.countDocuments({
        eventId: { $in: events.map(event => event._id) },
        registrationDate: { $gte: twoMonthsAgo, $lt: lastMonth }
      });

      // Calculate attendee change percentage
      const attendeeChange = lastMonthAttendees > 0 ?
        Math.round(((totalAttendees - lastMonthAttendees) / lastMonthAttendees) * 100) : 0;

      // Calculate total tickets sold (same as totalAttendees in this case)
      const totalTicketsSold = totalAttendees;

      // Calculate ticket sales change percentage
      const ticketsSoldChange = attendeeChange; // Same as attendee change

      // Find the top selling event
      let topSellingEvent = null;
      if (events.length > 0) {
        // Create an object to track ticket sales per event
        const eventSales = {};

        // Get all registrations for this organizer's events
        const allRegistrations = await Registration.find({
          eventId: { $in: events.map(event => event._id) }
        });

        // Count registrations per event
        for (const reg of allRegistrations) {
          const eventId = reg.eventId.toString();
          if (!eventSales[eventId]) {
            eventSales[eventId] = 0;
          }
          eventSales[eventId]++;
        }

        // Find the event with the most sales
        if (Object.keys(eventSales).length > 0) {
          const topEventId = Object.keys(eventSales).reduce((a, b) =>
            eventSales[a] > eventSales[b] ? a : b
          );

          const topEvent = events.find(event => event._id.toString() === topEventId);
          if (topEvent) {
            topSellingEvent = {
              title: topEvent.title,
              ticketsSold: eventSales[topEventId]
            };
          }
        }
      }

      // Calculate average ticket price
      let avgTicketPrice = 0;
      let totalTickets = 0;
      let totalPrice = 0;

      if (events.length > 0) {
        // Sum up all ticket prices and number of events with prices
        for (const event of events) {
          if (event.ticketPrice) {
            totalPrice += event.ticketPrice;
            totalTickets++;
          }
        }

        // Calculate average
        avgTicketPrice = totalTickets > 0 ? Math.round(totalPrice / totalTickets) : 0;
      }

      // Calculate weekly sales data for the last 5 weeks
      const weeklySalesData = [];
      for (let i = 4; i >= 0; i--) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - (i * 7 + 6));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - (i * 7));
        endOfWeek.setHours(23, 59, 59, 999);

        const weekRegistrations = await Registration.find({
          eventId: { $in: events.map(event => event._id) },
          registrationDate: { $gte: startOfWeek, $lte: endOfWeek }
        }).populate('eventId');

        let weekTickets = weekRegistrations.length;
        let weekRevenue = 0;

        weekRegistrations.forEach(reg => {
          if (reg.eventId && reg.eventId.ticketPrice) {
            weekRevenue += reg.eventId.ticketPrice;
          }
        });

        weeklySalesData.push({
          name: `Week ${5 - i}`,
          tickets: weekTickets,
          revenue: weekRevenue
        });
      }

      // For ratings, since we don't have a Rating model, we'll use a default value
      const avgRating = 4.7; // This would be calculated from a Ratings model if it existed
      const ratingChange = 0.2; // This would also be calculated from actual data

      // Format user data
      const userData = await User.findById(req.session.userId).select('name email').lean();

      // Return JSON response instead of rendering EJS
      return res.status(200).json({
        success: true,
        data: {
          organizer: {
            _id: organizer._id,
            organizationName: organizer.organizationName,
            contactNo: organizer.contactNo,
            description: organizer.description
          },
          user: userData,
          events,
          upcomingEvents,
          stats: {
            totalEvents,
            totalActiveEvents: totalactiveEvents,
            totalRevenue,
            revenueChange,
            totalAttendees,
            attendeeChange,
            avgRating,
            ratingChange,
            topSellingEvent,
            totalTicketsSold,
            ticketsSoldChange,
            topSellingEvent,
            totalTicketsSold,
            ticketsSoldChange,
            avgTicketPrice,
            weeklySalesData
          }
        }
      });
    } catch (error) {
      console.error('Error retrieving organizer events:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving events.',
        error: error.message
      });
    }
  }

  // async createEvents(req, res) {
  //   try {
  //     const sessionId = req.cookies.uid;
  //     const user = getUser(sessionId);

  //     if (!user) {
  //       return res.status(401).json({ message: 'Unauthorized' });
  //     }

  //     const organizer = await Organizer.findOne({ userId: req.session.userId });

  //     if (!organizer) {
  //       return res.status(403).json({ message: 'You are not registered as an organizer' });
  //     }

  //     const { category, title, description, startDateTime, endDateTime, venue, capacity, price, status } = req.body;

  //     if (!category || !title || !description || !startDateTime || !endDateTime || !venue || !capacity || !price) {
  //       return res.status(400).json({ message: 'All fields are required.' });
  //     }

  //     // Create a new event in the database
  //     const newEvent = new Event({
  //       category,
  //       title,
  //       description,
  //       startDateTime,
  //       endDateTime,
  //       venue,
  //       capacity,
  //       ticketPrice: price,
  //       status: status || 'Upcoming',
  //       organizerId: organizer._id,
  //     });

  //     await newEvent.save();

  //     res.redirect('/organizer/dashboard');
  //   } catch (error) {
  //     console.error('Error creating event:', error);
  //     res.status(500).json({ message: 'An error occurred while creating the event.' });
  //   }
  // }

  async createEvents(req, res) {
    try {
      // Use session-based authentication consistently
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const organizer = await Organizer.findOne({ userId: req.session.userId });

      if (!organizer) {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as an organizer.'
        });
      }

      const { category, title, description, startDateTime, endDateTime, venue, capacity, price, status } = req.body;

      if (!category || !title || !description || !startDateTime || !endDateTime || !venue || !capacity || !price) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required.'
        });
      }

      // Check if an image was uploaded
      const imagePath = req.file ? `/events/${req.file.filename}` : null;

      // Create a new event in the database
      const newEvent = new Event({
        category,
        title,
        description,
        startDateTime,
        endDateTime,
        venue,
        capacity,
        ticketPrice: price,
        status: status || 'start_selling',
        organizerId: organizer._id,
        image: imagePath, // Add the image path to the event
      });

      const savedEvent = await newEvent.save();

      return res.status(201).json({
        success: true,
        message: 'Event created successfully!',
        data: {
          event: savedEvent
        }
      });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while creating the event.',
        error: error.message
      });
    }
  }
  async updateEvent(req, res) {
    try {
      const eventId = req.params.id;
      const { category, title, description, startDateTime, endDateTime, venue, capacity, price, status } = req.body;

      // Check if event exists and if the user has the right to update it
      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found.'
        });
      }

      // Verify the organizer owns this event
      const organizer = await Organizer.findOne({ userId: req.session.userId });

      if (!organizer || !event.organizerId.equals(organizer._id)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this event.'
        });
      }

      // Update the event
      event.category = category || event.category;
      event.title = title || event.title;
      event.description = description || event.description;
      event.startDateTime = startDateTime || event.startDateTime;
      event.endDateTime = endDateTime || event.endDateTime;
      event.venue = venue || event.venue;
      event.capacity = capacity || event.capacity;
      event.ticketPrice = price || event.ticketPrice;
      event.status = status || event.status;

      // If there's a new image file, update the image path
      if (req.file) {
        event.image = `/events/${req.file.filename}`;
      }

      const updatedEvent = await event.save();

      return res.status(200).json({
        success: true,
        message: 'Event updated successfully!',
        data: {
          event: updatedEvent
        }
      });
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating the event.',
        error: error.message
      });
    }
  }
  async deleteEvent(req, res) {
    try {
      const eventId = req.params.id;

      // Check if event exists
      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({ message: 'Event not found.' });
      }

      // Verify the organizer owns this event
      const organizer = await Organizer.findOne({ userId: req.session.userId });

      if (!organizer || !event.organizerId.equals(organizer._id)) {
        return res.status(403).json({ message: 'You do not have permission to delete this event.' });
      }

      // Delete the event
      await Event.findByIdAndDelete(eventId);

      res.status(200).json({ message: 'Event deleted successfully!' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'An error occurred while deleting the event.' });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const organizer = await Organizer.findOne({ userId: req.session.userId });

      if (!organizer) {
        return res.status(403).json({
          success: false,
          message: 'You are not registered as an organizer.'
        });
      }

      const { organizationName, description, contactNo } = req.body;

      // Update organizer profile
      if (organizationName) organizer.organizationName = organizationName;
      if (description !== undefined) organizer.description = description;
      if (contactNo) organizer.contactNo = contactNo;

      const updatedOrganizer = await organizer.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        data: {
          organizer: updatedOrganizer
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while updating profile.',
        error: error.message
      });
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const User = (await import('../models/user.js')).default;
      const bcrypt = (await import('bcrypt')).default;

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required.'
        });
      }

      // Find user
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwordHash = hashedPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully!'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while changing password.',
        error: error.message
      });
    }
  }
}

export default new orgController();
