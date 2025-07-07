import Event from '../models/event.js';


class eventController {
    async getAllEvents (req, res) {
        try {            const titleQuery = req.query.title || '';
            const venueQuery = req.query.venue || '';
            const categoryQuery = req.query.category || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 8;
            const skip = (page - 1) * limit;

            // Build the query filter
            const filter = {};
            
            if (titleQuery) {
                filter.title = { $regex: titleQuery, $options: 'i' };
            }
            
            if (venueQuery) {
                filter.venue = { $regex: venueQuery, $options: 'i' };
            }
            
            if (categoryQuery) {
                filter.category = categoryQuery;
            }
            
            // Get total count for pagination
            const totalEvents = await Event.countDocuments(filter);
            const totalPages = Math.ceil(totalEvents / limit);
            
            // Fetch events with pagination
            const events = await Event.find(filter)
                .sort({ startDateTime: 1 })
                .skip(skip)
                .limit(limit);
            
            res.render('home', { 
                events, 
                titleQuery, 
                venueQuery,
                categoryQuery,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                title: 'Home',
                showLogin: true,
                showSignup: true
            });
        } catch (error) {
            console.error('Error fetching events:', error);
            res.status(500).send('An error occurred while fetching events.');
        }
    }

    async getEventsByCategory(req, res) {
        try {
            const category = req.params.category;
            const events = await Event.find({ 
                category: { $regex: category, $options: 'i' },
                status: 'start_selling'
            }).sort({ startDateTime: 1 });
            
            res.render('category', { 
                category, 
                events,
                title: `${category} Events`,
                showLogin: true,
                showSignup: true
            });
        } catch (error) {
            console.error('Error fetching category events:', error);
            res.status(500).send('An error occurred while fetching category events.');
        }
    }    async createEventForm (req,res) {
        try {
            const { editId } = req.query;
            let event = null;
            
            // If editId is provided, fetch the event details
            if (editId) {
                event = await Event.findById(editId);
                if (!event) {
                    return res.status(404).render('404');
                }
            }
            
            res.render('base', { 
                title: editId ? 'Edit Event' : 'Create Event', 
                content: 'create_event', 
                showLogin: false, 
                showSignup: false,
                event: event // Pass the event object for edit mode
            });
        } catch (error) {
            console.error('Error loading event form:', error);
            res.status(500).send('An error occurred while loading the event form.');
        }
    }async getEventById (req, res) {
        try {
            const eventId = req.params.id;
            const event = await Event.findById(eventId).populate('organizerId');
            
            if (!event) {
                return res.status(404).render('404');
            }
            
            // Get related events (same category)
            const relatedEvents = await Event.find({ 
                category: event.category, 
                _id: { $ne: eventId },
                status: 'start_selling'
            }).limit(4);
            
            // Using the unified event page template directly
            res.render('event_page', {
                title: event.title,
                event,
                relatedEvents,
                showLogin: true,
                showSignup: true
            });
        } catch (error) {
            console.error('Error fetching event details:', error);
            res.status(500).send('An error occurred while fetching event details.');
        }
    }
      async getUpcomingEvents(req, res) {
        try {
            const now = new Date();
            const events = await Event.find({ 
                startDateTime: { $gt: now },
                status: 'start_selling'
            }).sort({ startDateTime: 1 }).limit(8);
            
            res.json(events);
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
            res.status(500).json({ error: 'An error occurred while fetching upcoming events.' });
        }    }
}

export default new eventController();