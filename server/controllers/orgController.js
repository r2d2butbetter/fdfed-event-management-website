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
import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/user.js';
import { sendEmail } from '../config/emailConfig.js';

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

      // --- OPTIMIZED: single aggregate replaces N countDocuments calls ---
      const regCountsPerEvent = await Registration.aggregate([
        { $match: { eventId: { $in: upcomingEvents.map(e => e._id) } } },
        { $group: { _id: '$eventId', count: { $sum: 1 } } }
      ]);
      const regCountMap = Object.fromEntries(
        regCountsPerEvent.map(r => [r._id.toString(), r.count])
      );
      for (const event of upcomingEvents) {
        event.registrationCount = regCountMap[event._id.toString()] || 0;
        event.ticketsLeft = event.capacity - event.registrationCount;
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
        eventId: { $in: eventIds }
      });

      // Get last month's attendees
      const lastMonthAttendees = await Registration.countDocuments({
        eventId: { $in: eventIds },
        registrationDate: { $gte: twoMonthsAgo, $lt: lastMonth }
      });

      // Calculate attendee change percentage
      const attendeeChange = lastMonthAttendees > 0 ?
        Math.round(((totalAttendees - lastMonthAttendees) / lastMonthAttendees) * 100) : 0;

      // Calculate total tickets sold (same as totalAttendees in this case)
      const totalTicketsSold = totalAttendees;

      // Calculate ticket sales change percentage
      const ticketsSoldChange = attendeeChange; // Same as attendee change

      // --- OPTIMIZED: top-selling event via aggregate (replaces find + JS loop) ---
      let topSellingEvent = null;
      if (events.length > 0) {
        const topSalesAgg = await Registration.aggregate([
          { $match: { eventId: { $in: eventIds } } },
          { $group: { _id: '$eventId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 }
        ]);
        if (topSalesAgg.length > 0) {
          const topEvent = events.find(e => e._id.toString() === topSalesAgg[0]._id.toString());
          if (topEvent) {
            topSellingEvent = { title: topEvent.title, ticketsSold: topSalesAgg[0].count };
          }
        }
      }

      // Calculate average ticket price (pure JS, no extra DB call needed)
      const eventsWithPrice = events.filter(e => e.ticketPrice);
      const avgTicketPrice = eventsWithPrice.length > 0
        ? Math.round(eventsWithPrice.reduce((s, e) => s + e.ticketPrice, 0) / eventsWithPrice.length)
        : 0;

      // --- OPTIMIZED: 5 weekly aggregate calls → 1 aggregate grouped by ISO week ---
      const fiveWeeksAgo = new Date();
      fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35);
      fiveWeeksAgo.setHours(0, 0, 0, 0);

      const weeklyRaw = await Payment.aggregate([
        {
          $match: {
            eventId: { $in: eventIds },
            paymentDate: { $gte: fiveWeeksAgo },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { $isoWeek: '$paymentDate' },
            weekTickets: { $sum: '$tickets' },
            weekRevenue: { $sum: '$organizerRevenue' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Map aggregate results into a week-keyed lookup
      const weeklyMap = Object.fromEntries(weeklyRaw.map(w => [w._id, w]));
      const weeklySalesData = [];
      for (let i = 4; i >= 0; i--) {
        const refDate = new Date();
        refDate.setDate(refDate.getDate() - i * 7);
        // ISO week number for this reference date
        const jan4 = new Date(refDate.getFullYear(), 0, 4);
        const isoWeek = Math.ceil(((refDate - jan4) / 86400000 + jan4.getDay() + 1) / 7);
        const entry = weeklyMap[isoWeek];
        weeklySalesData.push({
          name: `Week ${5 - i}`,
          tickets: entry ? entry.weekTickets : 0,
          revenue: entry ? entry.weekRevenue : 0
        });
      }

      // --- OPTIMIZED: 12 monthly aggregate calls → 1 aggregate grouped by year+month ---
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
      twelveMonthsAgo.setDate(1);
      twelveMonthsAgo.setHours(0, 0, 0, 0);

      const monthlyRaw = await Payment.aggregate([
        {
          $match: {
            eventId: { $in: eventIds },
            paymentDate: { $gte: twelveMonthsAgo },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } },
            monthTickets: { $sum: '$tickets' },
            monthRevenue: { $sum: '$organizerRevenue' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const monthlyMap = Object.fromEntries(
        monthlyRaw.map(m => [`${m._id.year}-${m._id.month}`, m])
      );
      const monthlyRevenueData = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setDate(1);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        const entry = monthlyMap[key];
        monthlyRevenueData.push({
          name: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
          revenue: entry ? entry.monthRevenue : 0,
          tickets: entry ? entry.monthTickets : 0
        });
      }

      // --- OPTIMIZED: 4 quarterly aggregate calls → 1 aggregate grouped by year+quarter ---
      const fourQuartersAgo = new Date();
      fourQuartersAgo.setMonth(fourQuartersAgo.getMonth() - 12);
      fourQuartersAgo.setDate(1);
      fourQuartersAgo.setHours(0, 0, 0, 0);

      const quarterlyRaw = await Payment.aggregate([
        {
          $match: {
            eventId: { $in: eventIds },
            paymentDate: { $gte: fourQuartersAgo },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$paymentDate' },
              quarter: { $ceil: { $divide: [{ $month: '$paymentDate' }, 3] } }
            },
            quarterTickets: { $sum: '$tickets' },
            quarterRevenue: { $sum: '$organizerRevenue' }
          }
        },
        { $sort: { '_id.year': 1, '_id.quarter': 1 } }
      ]);

      const quarterlyMap = Object.fromEntries(
        quarterlyRaw.map(q => [`${q._id.year}-Q${q._id.quarter}`, q])
      );
      const quarterlyRevenueData = [];
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
      const currentYear = new Date().getFullYear();
      for (let i = 3; i >= 0; i--) {
        let q = currentQuarter - i;
        let y = currentYear;
        if (q <= 0) { q += 4; y -= 1; }
        const key = `${y}-Q${q}`;
        const entry = quarterlyMap[key];
        quarterlyRevenueData.push({
          name: `Q${q} ${y}`,
          revenue: entry ? entry.quarterRevenue : 0,
          tickets: entry ? entry.quarterTickets : 0
        });
      }

      // --- OPTIMIZED: 3 yearly aggregate calls → 1 aggregate grouped by year ---
      const threeYearsAgo = new Date(currentYear - 2, 0, 1);

      const yearlyRaw = await Payment.aggregate([
        {
          $match: {
            eventId: { $in: eventIds },
            paymentDate: { $gte: threeYearsAgo },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { $year: '$paymentDate' },
            yearTickets: { $sum: '$tickets' },
            yearRevenue: { $sum: '$organizerRevenue' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const yearlyMap = Object.fromEntries(yearlyRaw.map(y => [y._id, y]));
      const yearlyRevenueData = [];
      for (let i = 2; i >= 0; i--) {
        const y = currentYear - i;
        const entry = yearlyMap[y];
        yearlyRevenueData.push({
          name: y.toString(),
          revenue: entry ? entry.yearRevenue : 0,
          tickets: entry ? entry.yearTickets : 0
        });
      }

      // --- OPTIMIZED: single fetch for peak-time analysis (reused below for revenuePerEvent) ---
      // Calculate peak registration times (by hour and day of week)
      const allRegistrations = await Registration.find(
        { eventId: { $in: eventIds } },
        { registrationDate: 1, eventId: 1 }  // projection — only fetch fields we need
      ).lean();

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

      const {
        category,
        title,
        description,
        startDateTime,
        endDateTime,
        venue,
        capacity,
        price,
        status,

        // Common organizer profile fields
        orgType,
        registeredAddressLine1,
        registeredAddressLine2,
        registeredCity,
        registeredState,
        registeredPostalCode,
        registeredCountry,
        website,
        registrationNumber,
        yearEstablished,
        facebook,
        instagram,
        twitter,
        linkedin,
        youtube,

        // TEDx fields
        tedxLicenseId,
        tedxLicenseOwnerName,
        tedxLicenseOwnerEmail,
        tedxLicenseScope,
        tedxLicenseExpiryDate,
        tedxDocumentLinks,

        // Health Camp fields
        healthOrganizerType,
        healthDirectorName,
        healthRegistrationNumber,
        healthPartnerHospitalName,
        healthEmergencyContact,
        healthDocumentLinks,

        // Concerts fields
        concertOrganizerType,
        concertPrimaryArtists,
        concertVenueNameConfirm,
        concertVenueCapacityConfirm,
        concertAgeRestrictions,
        concertDocumentLinks,

        // Exhibitions fields
        exhibitionVenueDetails,
        exhibitionHallDetails,
        exhibitionKeyExhibitors,
        exhibitionDocumentLinks,
      } = req.body;

      if (!category || !title || !description || !startDateTime || !endDateTime || !venue || !capacity || !price) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required.'
        });
      }

      // Update organizer profile details from the submitted form (without changing verification status)
      if (orgType) organizer.orgType = orgType;
      if (website) organizer.website = website;
      if (registrationNumber) organizer.registrationNumber = registrationNumber;
      if (yearEstablished) {
        const yearNum = Number(yearEstablished);
        if (!Number.isNaN(yearNum)) {
          organizer.yearEstablished = yearNum;
        }
      }

      // Registered address pieces
      organizer.registeredAddress = organizer.registeredAddress || {};
      if (registeredAddressLine1) organizer.registeredAddress.line1 = registeredAddressLine1;
      if (registeredAddressLine2) organizer.registeredAddress.line2 = registeredAddressLine2;
      if (registeredCity) organizer.registeredAddress.city = registeredCity;
      if (registeredState) organizer.registeredAddress.state = registeredState;
      if (registeredPostalCode) organizer.registeredAddress.postalCode = registeredPostalCode;
      if (registeredCountry) organizer.registeredAddress.country = registeredCountry;

      // Social links
      organizer.socialLinks = organizer.socialLinks || {};
      if (facebook) organizer.socialLinks.facebook = facebook;
      if (instagram) organizer.socialLinks.instagram = instagram;
      if (twitter) organizer.socialLinks.twitter = twitter;
      if (linkedin) organizer.socialLinks.linkedin = linkedin;
      if (youtube) organizer.socialLinks.youtube = youtube;

      // Category-specific blocks
      if (category === 'TEDx') {
        organizer.tedxInfo = organizer.tedxInfo || {};
        if (tedxLicenseId) organizer.tedxInfo.licenseId = tedxLicenseId;
        if (tedxLicenseOwnerName) organizer.tedxInfo.licenseOwnerName = tedxLicenseOwnerName;
        if (tedxLicenseOwnerEmail) organizer.tedxInfo.licenseOwnerEmail = tedxLicenseOwnerEmail;
        if (tedxLicenseScope) organizer.tedxInfo.licenseScope = tedxLicenseScope;
        if (tedxLicenseExpiryDate) {
          const expDate = new Date(tedxLicenseExpiryDate);
          if (!Number.isNaN(expDate.getTime())) {
            organizer.tedxInfo.licenseExpiryDate = expDate;
          }
        }
        if (tedxDocumentLinks) organizer.tedxInfo.documentLinks = tedxDocumentLinks;
      }

      if (category === 'Health Camp') {
        organizer.healthCampInfo = organizer.healthCampInfo || {};
        if (healthOrganizerType) organizer.healthCampInfo.organizerType = healthOrganizerType;
        if (healthDirectorName) organizer.healthCampInfo.medicalDirectorName = healthDirectorName;
        if (healthRegistrationNumber) organizer.healthCampInfo.medicalRegistrationNumber = healthRegistrationNumber;
        if (healthPartnerHospitalName) organizer.healthCampInfo.partnerHospitalName = healthPartnerHospitalName;
        if (healthEmergencyContact) organizer.healthCampInfo.emergencyContact = healthEmergencyContact;
        if (healthDocumentLinks) organizer.healthCampInfo.documentLinks = healthDocumentLinks;
      }

      if (category === 'Concerts') {
        organizer.concertInfo = organizer.concertInfo || {};
        if (concertOrganizerType) organizer.concertInfo.organizerType = concertOrganizerType;
        if (concertPrimaryArtists) organizer.concertInfo.primaryArtists = concertPrimaryArtists;
        if (concertVenueNameConfirm) organizer.concertInfo.venueNameConfirmation = concertVenueNameConfirm;
        if (concertVenueCapacityConfirm) organizer.concertInfo.venueCapacityConfirmation = concertVenueCapacityConfirm;
        if (concertAgeRestrictions) organizer.concertInfo.ageRestrictions = concertAgeRestrictions;
        if (concertDocumentLinks) organizer.concertInfo.documentLinks = concertDocumentLinks;
      }

      if (category === 'Exhibitions') {
        organizer.exhibitionInfo = organizer.exhibitionInfo || {};
        if (exhibitionVenueDetails) organizer.exhibitionInfo.venueDetails = exhibitionVenueDetails;
        if (exhibitionHallDetails) organizer.exhibitionInfo.hallDetails = exhibitionHallDetails;
        if (exhibitionKeyExhibitors) organizer.exhibitionInfo.keyExhibitors = exhibitionKeyExhibitors;
        if (exhibitionDocumentLinks) organizer.exhibitionInfo.documentLinks = exhibitionDocumentLinks;
      }

      await organizer.save();

      // Check if an image was uploaded
      const imagePath = req.file ? `/events/${req.file.filename}` : null;

      let embeddingVector = undefined;
      try {
        if (process.env.GEMINI_API_KEY) {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
          const textToEmbed = `Category: ${category}. Title: ${title}. Description: ${description}. Venue: ${venue}`;
          const embeddingResponse = await embeddingModel.embedContent(textToEmbed);
          embeddingVector = embeddingResponse.embedding.values;
        }
      } catch (embError) {
        console.error("Error generating event embedding:", embError);
      }

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
        embedding: embeddingVector, // Add the AI-generated vector

      });

      const savedEvent = await newEvent.save();

      // Send email notifications to users who have opted in
      try {
        const subscribedUsers = await User.find({
          'notificationPreferences.emailUpdates': true
        }, 'email name').lean();

        if (subscribedUsers.length > 0) {
          const eventDate = new Date(startDateTime).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          });

          for (const subscriber of subscribedUsers) {
            const html = `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #9353d3 0%, #643d88 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                  .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                  .event-details { background: #fff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #9353d3; }
                  .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>New Event Published!</h2>
                  </div>
                  <div class="content">
                    <p>Hi ${subscriber.name},</p>
                    <p>A new event has been published that you might be interested in:</p>
                    <div class="event-details">
                      <h3>${title}</h3>
                      <p><strong>Category:</strong> ${category}</p>
                      <p><strong>Date:</strong> ${eventDate}</p>
                      <p><strong>Venue:</strong> ${venue}</p>
                      <p><strong>Price:</strong> ₹${price}</p>
                    </div>
                    <p>Log in to your dashboard to book tickets!</p>
                  </div>
                  <div class="footer">
                    <p>You received this email because you opted in to event updates.</p>
                    <p>You can manage your notification preferences in your dashboard settings.</p>
                    <p>&copy; ${new Date().getFullYear()} Event Management Platform. All rights reserved.</p>
                  </div>
                </div>
              </body>
              </html>
            `;
            const text = `New event: ${title} | ${category} | ${eventDate} at ${venue} | ₹${price}`;
            // Fire and forget - don't block event creation
            sendEmail(subscriber.email, `New Event: ${title}`, text, html).catch(err =>
              console.error(`Failed to notify ${subscriber.email}:`, err.message)
            );
          }
        }
      } catch (notifyError) {
        // Log but don't fail the event creation
        console.error('Error sending new event notifications:', notifyError.message);
      }

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
      const { subject, message, recipientEmails } = req.body;
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

      if (!recipientEmails || recipientEmails.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one recipient is required.'
        });
      }

      // Import email service
      const { sendBulkEmails } = await import('../config/emailConfig.js');

      // Send emails
      console.log(`📧 Sending bulk email to ${recipientEmails.length} recipients for event: ${event.title}`);

      const results = await sendBulkEmails(
        recipientEmails,
        subject,
        message,
        event.title
      );

      // Log results
      console.log(`✅ Successfully sent: ${results.successful.length}`);
      if (results.failed.length > 0) {
        console.log(`❌ Failed to send: ${results.failed.length}`);
        console.log('Failed emails:', results.failed.map(f => f.email).join(', '));
      }

      return res.status(200).json({
        success: true,
        message: `Email sent successfully to ${results.successful.length} out of ${results.total} recipients.`,
        data: {
          emailsSent: results.successful.length,
          failed: results.failed.length,
          total: results.total,
          recipients: recipientEmails
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

  // Submit verification request with document
  async submitVerificationRequest(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Please log in.' });
      }

      const organizer = await Organizer.findOne({ userId: req.session.userId });
      if (!organizer) {
        return res.status(404).json({ success: false, message: 'Organizer profile not found.' });
      }

      if (organizer.verificationStatus === 'pending') {
        return res.status(400).json({ success: false, message: 'A verification request is already pending.' });
      }

      if (organizer.verificationStatus === 'approved') {
        return res.status(400).json({ success: false, message: 'You are already verified.' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a verification document.' });
      }

      organizer.verificationDocument = `/events/${req.file.filename}`;
      organizer.verificationStatus = 'pending';
      organizer.verificationRequestDate = new Date();
      organizer.rejectionReason = undefined;
      await organizer.save();

      return res.status(200).json({
        success: true,
        message: 'Verification request submitted successfully. A manager will review your document.',
        data: {
          verificationStatus: organizer.verificationStatus,
          verificationRequestDate: organizer.verificationRequestDate,
        }
      });
    } catch (error) {
      console.error('Error submitting verification request:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Get verification status
  async getVerificationStatus(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Please log in.' });
      }

      const organizer = await Organizer.findOne({ userId: req.session.userId });
      if (!organizer) {
        return res.status(404).json({ success: false, message: 'Organizer profile not found.' });
      }

      return res.status(200).json({
        success: true,
        data: {
          verified: organizer.verified,
          verificationStatus: organizer.verificationStatus,
          verificationRequestDate: organizer.verificationRequestDate,
          verificationReviewDate: organizer.verificationReviewDate,
          rejectionReason: organizer.rejectionReason,
          hasDocument: !!organizer.verificationDocument,
        }
      });
    } catch (error) {
      console.error('Error fetching verification status:', error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }

}

export default new orgController();


