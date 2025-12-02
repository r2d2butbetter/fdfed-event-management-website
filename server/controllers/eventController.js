// import Event from '../models/event.js';


// class eventController {
//     async getAllEvents (req, res) {
//         try {            const titleQuery = req.query.title || '';
//             const venueQuery = req.query.venue || '';
//             const categoryQuery = req.query.category || '';
//             const page = parseInt(req.query.page) || 1;
//             const limit = parseInt(req.query.limit) || 8;
//             const skip = (page - 1) * limit;

//             // Build the query filter
//             const filter = {};

//             if (titleQuery) {
//                 filter.title = { $regex: titleQuery, $options: 'i' };
//             }

//             if (venueQuery) {
//                 filter.venue = { $regex: venueQuery, $options: 'i' };
//             }

//             if (categoryQuery) {
//                 filter.category = categoryQuery;
//             }

//             // Get total count for pagination
//             const totalEvents = await Event.countDocuments(filter);
//             const totalPages = Math.ceil(totalEvents / limit);

//             // Fetch events with pagination
//             const events = await Event.find(filter)
//                 .sort({ startDateTime: 1 })
//                 .skip(skip)
//                 .limit(limit);

//             res.render('home', { 
//                 events, 
//                 titleQuery, 
//                 venueQuery,
//                 categoryQuery,
//                 currentPage: page,
//                 totalPages,
//                 hasNextPage: page < totalPages,
//                 hasPrevPage: page > 1,
//                 nextPage: page + 1,
//                 prevPage: page - 1,
//                 title: 'Home',
//                 showLogin: true,
//                 showSignup: true
//             });
//         } catch (error) {
//             console.error('Error fetching events:', error);
//             res.status(500).send('An error occurred while fetching events.');
//         }
//     }

//     async getEventsByCategory(req, res) {
//         try {
//             const category = req.params.category;
//             const events = await Event.find({ 
//                 category: { $regex: category, $options: 'i' },
//                 status: 'start_selling'
//             }).sort({ startDateTime: 1 });

//             res.render('category', { 
//                 category, 
//                 events,
//                 title: `${category} Events`,
//                 showLogin: true,
//                 showSignup: true
//             });
//         } catch (error) {
//             console.error('Error fetching category events:', error);
//             res.status(500).send('An error occurred while fetching category events.');
//         }
//     }    async createEventForm (req,res) {
//         try {
//             const { editId } = req.query;
//             let event = null;

//             // If editId is provided, fetch the event details
//             if (editId) {
//                 event = await Event.findById(editId);
//                 if (!event) {
//                     return res.status(404).render('404');
//                 }
//             }

//             res.render('base', { 
//                 title: editId ? 'Edit Event' : 'Create Event', 
//                 content: 'create_event', 
//                 showLogin: false, 
//                 showSignup: false,
//                 event: event // Pass the event object for edit mode
//             });
//         } catch (error) {
//             console.error('Error loading event form:', error);
//             res.status(500).send('An error occurred while loading the event form.');
//         }
//     }async getEventById (req, res) {
//         try {
//             const eventId = req.params.id;
//             const event = await Event.findById(eventId).populate('organizerId');

//             if (!event) {
//                 return res.status(404).render('404');
//             }

//             // Get related events (same category)
//             const relatedEvents = await Event.find({ 
//                 category: event.category, 
//                 _id: { $ne: eventId },
//                 status: 'start_selling'
//             }).limit(4);

//             // Using the unified event page template directly
//             res.render('event_page', {
//                 title: event.title,
//                 event,
//                 relatedEvents,
//                 showLogin: true,
//                 showSignup: true
//             });
//         } catch (error) {
//             console.error('Error fetching event details:', error);
//             res.status(500).send('An error occurred while fetching event details.');
//         }
//     }
//       async getUpcomingEvents(req, res) {
//         try {
//             const now = new Date();
//             const events = await Event.find({ 
//                 startDateTime: { $gt: now },
//                 status: 'start_selling'
//             }).sort({ startDateTime: 1 }).limit(8);

//             res.json(events);
//         } catch (error) {
//             console.error('Error fetching upcoming events:', error);
//             res.status(500).json({ error: 'An error occurred while fetching upcoming events.' });
//         }    }
// }

// export default new eventController();


import Event from '../models/event.js';

class eventController {

    // Render home page without events (for initial load)
    async getHomePage(req, res) {
        try {
            res.json({
                success: true,
                message: 'Home page data retrieved successfully',
                data: {
                    searchParams: {
                        titleQuery: req.query.title || '',
                        venueQuery: req.query.venue || '',
                        categoryQuery: req.query.category || ''
                    },
                    note: 'Use /events endpoint to fetch actual events data'
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Server error while loading home page',
                error: err.message
            });
        }
    }

    // Get all events with optional filtering - JSON API
    async getAllEvents(req, res) {
        try {
            const titleQuery = req.query.title || '';
            const venueQuery = req.query.venue || '';
            const categoryQuery = req.query.category || '';
            const sellingPage = parseInt(req.query.sellingPage) || 1;
            const upcomingPage = parseInt(req.query.upcomingPage) || 1;
            const limit = parseInt(req.query.limit) || 12;

            // Build base filter without status
            const baseFilter = {};

            if (titleQuery) {
                baseFilter.title = { $regex: titleQuery, $options: 'i' };
            }

            if (venueQuery) {
                baseFilter.venue = { $regex: venueQuery, $options: 'i' };
            }

            if (categoryQuery) {
                baseFilter.category = { $regex: categoryQuery, $options: 'i' };
            }

            // Get selling events
            const sellingSkip = (sellingPage - 1) * limit;
            const sellingFilter = { ...baseFilter, status: 'start_selling' };
            const totalSellingEvents = await Event.countDocuments(sellingFilter);
            const totalSellingPages = Math.ceil(totalSellingEvents / limit);
            const sellingEvents = await Event.find(sellingFilter)
                .sort({ startDateTime: 1 })
                .skip(sellingSkip)
                .limit(limit)
                .lean();

            // Get upcoming events
            const upcomingSkip = (upcomingPage - 1) * limit;
            const upcomingFilter = { ...baseFilter, status: 'upcoming' };
            const totalUpcomingEvents = await Event.countDocuments(upcomingFilter);
            const totalUpcomingPages = Math.ceil(totalUpcomingEvents / limit);
            const upcomingEvents = await Event.find(upcomingFilter)
                .sort({ startDateTime: 1 })
                .skip(upcomingSkip)
                .limit(limit)
                .lean();

            return res.status(200).json({
                success: true,
                data: {
                    selling: {
                        events: sellingEvents,
                        pagination: {
                            currentPage: sellingPage,
                            totalPages: totalSellingPages,
                            totalEvents: totalSellingEvents,
                            hasNextPage: sellingPage < totalSellingPages,
                            hasPrevPage: sellingPage > 1
                        }
                    },
                    upcoming: {
                        events: upcomingEvents,
                        pagination: {
                            currentPage: upcomingPage,
                            totalPages: totalUpcomingPages,
                            totalEvents: totalUpcomingEvents,
                            hasNextPage: upcomingPage < totalUpcomingPages,
                            hasPrevPage: upcomingPage > 1
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching events.'
            });
        }
    }

    // Get events by category - JSON API
    async getEventsByCategory(req, res) {
        try {
            const category = req.params.category;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;

            // Build filter - show selling, upcoming, and over events on category pages
            const filter = {
                category: { $regex: category, $options: 'i' },
                status: { $in: ['start_selling', 'upcoming', 'over'] }
            };

            // Get total count for pagination
            const totalEvents = await Event.countDocuments(filter);
            const totalPages = Math.ceil(totalEvents / limit);

            // Fetch events with pagination
            const events = await Event.find(filter)
                .sort({ startDateTime: 1 })
                .skip(skip)
                .limit(limit)
                .lean();

            return res.status(200).json({
                success: true,
                data: {
                    category,
                    events,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalEvents,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching category events:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching category events.'
            });
        }
    }

    // createEventForm method removed - React frontend handles the create/edit event form

    // Get single event by ID - JSON API
    async getEventById(req, res) {
        try {
            const eventId = req.params.id;
            const event = await Event.findById(eventId)
                .populate('organizerId', 'organizationName contactNo description')
                .lean();

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found.'
                });
            }

            // Get related events (same category, different event)
            const relatedEvents = await Event.find({
                category: event.category,
                _id: { $ne: eventId },
                status: { $in: ['start_selling', 'upcoming', 'over'] }
            }).limit(4).lean();

            // Get registration count for capacity tracking
            const Registration = (await import('../models/registration.js')).default;
            const registrationCount = await Registration.countDocuments({ eventId });
            const ticketsLeft = event.capacity - registrationCount;

            return res.status(200).json({
                success: true,
                data: {
                    event: {
                        ...event,
                        ticketsLeft,
                        registrationCount
                    },
                    relatedEvents
                }
            });
        } catch (error) {
            console.error('Error fetching event details:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching event details.'
            });
        }
    }

    // Delete event by ID
    async deleteEvent(req, res) {
        try {
            const eventId = req.params.id;
            const event = await Event.findById(eventId);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found.'
                });
            }

            // Optional: Check if user is authorized to delete (admin or event organizer)
            // For now, allowing any authenticated user to delete

            await Event.findByIdAndDelete(eventId);

            return res.status(200).json({
                success: true,
                message: 'Event deleted successfully.'
            });
        } catch (error) {
            console.error('Error deleting event:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while deleting the event.',
                error: error.message
            });
        }
    }
}

export default new eventController();
