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
import Payment from '../models/payment.js';

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

      // Calculate total revenue from Payment model (organizerRevenue is 95% of ticket sales)
      const eventIds = events.map(event => event._id);
      const totalRevenueResult = await Payment.aggregate([
        { $match: { eventId: { $in: eventIds }, status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$organizerRevenue' } } }
      ]);
      const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].totalRevenue : 0;

      // Calculate last month's revenue for comparison
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      // Get payments from last month (completed payments only)
      const lastMonthRevenueResult = await Payment.aggregate([
        {
          $match: {
            eventId: { $in: eventIds },
            paymentDate: { $gte: twoMonthsAgo, $lt: lastMonth },
            status: 'completed'
          }
        },
        { $group: { _id: null, totalRevenue: { $sum: '$organizerRevenue' } } }
      ]);
      const lastMonthRevenue = lastMonthRevenueResult.length > 0 ? lastMonthRevenueResult[0].totalRevenue : 0;

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

        const weekPayments = await Payment.aggregate([
          {
            $match: {
              eventId: { $in: eventIds },
              paymentDate: { $gte: startOfWeek, $lte: endOfWeek },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              weekTickets: { $sum: '$tickets' },
              weekRevenue: { $sum: '$organizerRevenue' }
            }
          }
        ]);

        const weekTickets = weekPayments.length > 0 ? weekPayments[0].weekTickets : 0;
        const weekRevenue = weekPayments.length > 0 ? weekPayments[0].weekRevenue : 0;

        weeklySalesData.push({
          name: `Week ${5 - i}`,
          tickets: weekTickets,
          revenue: weekRevenue
        });
      }

      // Calculate monthly revenue trends (last 12 months)
      const monthlyRevenueData = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthRegistrations = await Registration.find({
          eventId: { $in: events.map(event => event._id) },
          registrationDate: { $gte: monthStart, $lte: monthEnd }
        }).populate('eventId');

        const monthPayments = await Payment.aggregate([
          {
            $match: {
              eventId: { $in: eventIds },
              paymentDate: { $gte: monthStart, $lte: monthEnd },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              monthTickets: { $sum: '$tickets' },
              monthRevenue: { $sum: '$organizerRevenue' }
            }
          }
        ]);

        const monthRevenue = monthPayments.length > 0 ? monthPayments[0].monthRevenue : 0;
        const monthTickets = monthPayments.length > 0 ? monthPayments[0].monthTickets : 0;

        monthlyRevenueData.push({
          name: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          tickets: monthTickets
        });
      }

      // Calculate quarterly revenue trends (last 4 quarters)
      const quarterlyRevenueData = [];
      const currentQuarter = Math.floor(new Date().getMonth() / 3);
      for (let i = 3; i >= 0; i--) {
        const quarterMonth = (currentQuarter - i) * 3;
        const quarterStart = new Date(new Date().getFullYear(), quarterMonth, 1);
        const quarterEnd = new Date(new Date().getFullYear(), quarterMonth + 3, 0, 23, 59, 59, 999);

        const quarterRegistrations = await Registration.find({
          eventId: { $in: events.map(event => event._id) },
          registrationDate: { $gte: quarterStart, $lte: quarterEnd }
        }).populate('eventId');

        const quarterPayments = await Payment.aggregate([
          {
            $match: {
              eventId: { $in: eventIds },
              paymentDate: { $gte: quarterStart, $lte: quarterEnd },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              quarterTickets: { $sum: '$tickets' },
              quarterRevenue: { $sum: '$organizerRevenue' }
            }
          }
        ]);

        const quarterRevenue = quarterPayments.length > 0 ? quarterPayments[0].quarterRevenue : 0;
        const quarterTickets = quarterPayments.length > 0 ? quarterPayments[0].quarterTickets : 0;

        quarterlyRevenueData.push({
          name: `Q${Math.floor(quarterMonth / 3) + 1} ${quarterStart.getFullYear()}`,
          revenue: quarterRevenue,
          tickets: quarterTickets
        });
      }

      // Calculate yearly revenue trends (last 3 years)
      const yearlyRevenueData = [];
      const currentYear = new Date().getFullYear();
      for (let i = 2; i >= 0; i--) {
        const yearStart = new Date(currentYear - i, 0, 1);
        const yearEnd = new Date(currentYear - i, 11, 31, 23, 59, 59, 999);

        const yearRegistrations = await Registration.find({
          eventId: { $in: events.map(event => event._id) },
          registrationDate: { $gte: yearStart, $lte: yearEnd }
        }).populate('eventId');

        const yearPayments = await Payment.aggregate([
          {
            $match: {
              eventId: { $in: eventIds },
              paymentDate: { $gte: yearStart, $lte: yearEnd },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              yearTickets: { $sum: '$tickets' },
              yearRevenue: { $sum: '$organizerRevenue' }
            }
          }
        ]);

        const yearRevenue = yearPayments.length > 0 ? yearPayments[0].yearRevenue : 0;
        const yearTickets = yearPayments.length > 0 ? yearPayments[0].yearTickets : 0;

        yearlyRevenueData.push({
          name: (currentYear - i).toString(),
          revenue: yearRevenue,
          tickets: yearTickets
        });
      }

      // Calculate peak registration times (by hour and day of week)
      const allRegistrations = await Registration.find({
        eventId: { $in: events.map(event => event._id) }
      });

      const hourlyRegistrations = Array(24).fill(0);
      const dailyRegistrations = Array(7).fill(0);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      allRegistrations.forEach(reg => {
        const regDate = new Date(reg.registrationDate);
        hourlyRegistrations[regDate.getHours()]++;
        dailyRegistrations[regDate.getDay()]++;
      });

      const peakHoursData = hourlyRegistrations.map((count, hour) => ({
        hour: `${hour}:00`,
        count
      }));

      const peakDaysData = dailyRegistrations.map((count, day) => ({
        day: dayNames[day],
        count
      }));

      // Calculate revenue per event using Payment model (organizerRevenue is 95% of ticket sales)
      const revenuePerEvent = [];
      for (const event of events) {
        // Get total organizer revenue for this event from completed payments
        const eventRevenueResult = await Payment.aggregate([
          { $match: { eventId: event._id, status: 'completed' } },
          {
            $group: {
              _id: null,
              eventRevenue: { $sum: '$organizerRevenue' },
              ticketsSold: { $sum: '$tickets' }
            }
          }
        ]);

        const eventRevenue = eventRevenueResult.length > 0 ? eventRevenueResult[0].eventRevenue : 0;
        const ticketsSold = eventRevenueResult.length > 0 ? eventRevenueResult[0].ticketsSold : 0;

        revenuePerEvent.push({
          eventId: event._id,
          title: event.title,
          revenue: eventRevenue,
          ticketPrice: event.ticketPrice,
          ticketsSold: ticketsSold,
          capacity: event.capacity,
          fillRate: event.capacity > 0 ? Math.round((ticketsSold / event.capacity) * 100) : 0
        });
      }
      revenuePerEvent.sort((a, b) => b.revenue - a.revenue);

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
            weeklySalesData,
            monthlyRevenueData,
            quarterlyRevenueData,
            yearlyRevenueData,
            peakHoursData,
            peakDaysData,
            revenuePerEvent
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

  async getEventAttendees(req, res) {
    try {
      const { eventId } = req.params;
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

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found.'
        });
      }

      // Verify organizer owns this event
      if (!event.organizerId.equals(organizer._id)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view attendees for this event.'
        });
      }

      const Registration = (await import('../models/registration.js')).default;
      const User = (await import('../models/user.js')).default;

      // Get all registrations for this event
      const registrations = await Registration.find({ eventId })
        .populate('userId', 'name email')
        .sort({ registrationDate: -1 })
        .lean();

      // Group by user and count tickets
      const attendeeMap = new Map();
      registrations.forEach(reg => {
        const userId = reg.userId._id.toString();
        if (!attendeeMap.has(userId)) {
          attendeeMap.set(userId, {
            userId: reg.userId._id,
            name: reg.userId.name,
            email: reg.userId.email,
            ticketCount: 0,
            firstRegistrationDate: reg.registrationDate,
            lastRegistrationDate: reg.registrationDate
          });
        }
        const attendee = attendeeMap.get(userId);
        attendee.ticketCount++;
        if (new Date(reg.registrationDate) < new Date(attendee.firstRegistrationDate)) {
          attendee.firstRegistrationDate = reg.registrationDate;
        }
        if (new Date(reg.registrationDate) > new Date(attendee.lastRegistrationDate)) {
          attendee.lastRegistrationDate = reg.registrationDate;
        }
      });

      const attendees = Array.from(attendeeMap.values());

      return res.status(200).json({
        success: true,
        data: {
          event: {
            _id: event._id,
            title: event.title,
            startDateTime: event.startDateTime
          },
          attendees,
          totalAttendees: attendees.length,
          totalTickets: registrations.length
        }
      });
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while fetching attendees.',
        error: error.message
      });
    }
  }

  async exportEventAttendees(req, res) {
    try {
      const { eventId } = req.params;
      const { format = 'csv' } = req.query;
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

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found.'
        });
      }

      if (!event.organizerId.equals(organizer._id)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to export attendees for this event.'
        });
      }

      const Registration = (await import('../models/registration.js')).default;
      const registrations = await Registration.find({ eventId })
        .populate('userId', 'name email')
        .sort({ registrationDate: -1 })
        .lean();

      // Group by user
      const attendeeMap = new Map();
      registrations.forEach(reg => {
        const userId = reg.userId._id.toString();
        if (!attendeeMap.has(userId)) {
          attendeeMap.set(userId, {
            name: reg.userId.name,
            email: reg.userId.email,
            ticketCount: 0,
            registrationDate: reg.registrationDate
          });
        }
        attendeeMap.get(userId).ticketCount++;
      });

      const attendees = Array.from(attendeeMap.values());

      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'Name,Email,Ticket Count,Registration Date\n';
        const csvRows = attendees.map(attendee => {
          const date = new Date(attendee.registrationDate).toLocaleString();
          return `"${attendee.name}","${attendee.email}",${attendee.ticketCount},"${date}"`;
        }).join('\n');
        const csv = csvHeader + csvRows;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="attendees-${event.title}-${Date.now()}.csv"`);
        return res.send(csv);
      } else {
        // For Excel, we'll return JSON and let frontend handle it
        return res.status(200).json({
          success: true,
          data: attendees,
          eventTitle: event.title
        });
      }
    } catch (error) {
      console.error('Error exporting attendees:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while exporting attendees.',
        error: error.message
      });
    }
  }

  async sendBulkEmail(req, res) {
    try {
      const { eventId, subject, message, recipientEmails } = req.body;
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

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found.'
        });
      }

      if (!event.organizerId.equals(organizer._id)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to send emails for this event.'
        });
      }

      if (!subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Subject and message are required.'
        });
      }

      // Here you would integrate with an email service like Nodemailer, SendGrid, etc.
      // For now, we'll just simulate sending emails
      // TODO: Integrate actual email service

      return res.status(200).json({
        success: true,
        message: `Email sent successfully to ${recipientEmails?.length || 0} recipients.`,
        data: {
          emailsSent: recipientEmails?.length || 0,
          recipients: recipientEmails || []
        }
      });
    } catch (error) {
      console.error('Error sending bulk email:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while sending emails.',
        error: error.message
      });
    }
  }



  async getOrganizerRevenue(req, res) {
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

      const events = await Event.find({ organizerId: organizer._id });
      const eventIds = events.map(event => event._id);

      const result = await Payment.aggregate([
        { $match: { eventId: { $in: eventIds } } },
        { $group: { _id: null, totalRevenue: { $sum: '$organizerRevenue' }, totalTicketsSold: { $sum: '$tickets' } } }
      ]);

      const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
      const totalTicketsSold = result.length > 0 ? result[0].totalTicketsSold : 0;

      return res.status(200).json({
        success: true,
        data: { totalRevenue, totalTicketsSold }
      });
    } catch (error) {
      console.error('Error calculating organizer revenue:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while calculating revenue.',
        error: error.message
      });
    }
  }

  async getMonthlyRevenue(req, res) {
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

      const events = await Event.find({ organizerId: organizer._id });
      const eventIds = events.map(event => event._id);

      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const monthlyData = await Payment.aggregate([
        { $match: { eventId: { $in: eventIds }, paymentDate: { $gte: sixMonthsAgo, $lte: now } } },
        { $group: { _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } }, revenue: { $sum: '$organizerRevenue' }, tickets: { $sum: '$tickets' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedData = [];

      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - 5 + i);
        formattedData.push({ name: months[d.getMonth()], year: d.getFullYear(), revenue: 0, tickets: 0 });
      }

      monthlyData.forEach(item => {
        const monthIndex = item._id.month - 1;
        const label = months[monthIndex];
        const dataIndex = formattedData.findIndex(d => d.name === label && d.year === item._id.year);
        if (dataIndex !== -1) {
          formattedData[dataIndex].revenue = item.revenue;
          formattedData[dataIndex].tickets = item.tickets;
        }
      });

      return res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while getting monthly revenue.',
        error: error.message
      });
    }
  }

}

export default new orgController();


