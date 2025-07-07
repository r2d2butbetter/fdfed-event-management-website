import SavedEvent from '../models/save.js';
import Event from '../models/event.js';

class userController {    async loadDashboard (req, res){
        try {
            // Check if user is available through req.user (from middleware) or req.session.user
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                // No authenticated user, redirect to login page
                console.log('No authenticated user found, redirecting to login');
                return res.redirect('/login');
            }
            
            // Find user by ID (excluding password hash)
            const User = (await import('../models/user.js')).default;
            const Registration = (await import('../models/registration.js')).default;
            const Event = (await import('../models/event.js')).default;
            let user;
            
            try {
                // If userId exists, try to find the user
                if (userId) {
                    user = await User.findById(userId).select('name').lean();
                }
            } catch (error) {
                console.error('Error finding user:', error);
                return res.redirect('/login');
            }
            
            // If user not found, redirect to login
            if (!user) {
                console.error('User not found in database');
                return res.redirect('/login');
            }
              // Get user's bookings/registrations
            const registrations = await Registration.find({ userId })
                .populate({
                    path: 'eventId',
                    model: 'Event',
                    select: 'title description startDateTime endDateTime venue ticketPrice status'
                }).sort({ registrationDate: -1 });
            
            // Group registrations by event ID
            const eventRegistrationMap = new Map();
            
            // Process each registration and count tickets per event
            registrations.forEach(registration => {
                const eventId = registration.eventId._id.toString();
                  if (!eventRegistrationMap.has(eventId)) {
                    eventRegistrationMap.set(eventId, {
                        event: registration.eventId,
                        registrations: [],
                        count: 0,
                        latestRegistrationId: registration._id, // Keep track of the latest registration for this event
                        latestRegistrationDate: registration.registrationDate
                    });
                }
                
                // Add registration to the event's registrations array
                eventRegistrationMap.get(eventId).registrations.push(registration);
                eventRegistrationMap.get(eventId).count++;
                
                // Update latest registration ID if this one is newer
                if (registration.registrationDate > eventRegistrationMap.get(eventId).latestRegistrationDate) {
                    eventRegistrationMap.get(eventId).latestRegistrationId = registration._id;
                    eventRegistrationMap.get(eventId).latestRegistrationDate = registration.registrationDate;
                }
            });
                
            // Process events data to categorize as upcoming, completed, or cancelled
            const currentDate = new Date();
            const userBookings = Array.from(eventRegistrationMap.values()).map(eventData => {
                const event = eventData.event;
                const startDate = new Date(event.startDateTime);
                
                // Determine status
                let status = 'upcoming';
                if (event.status === 'cancelled') {
                    status = 'cancelled';
                } else if (startDate < currentDate) {
                    status = 'completed';
                }
                
                // Format date for display
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                const timeOptions = { hour: 'numeric', minute: 'numeric' };
                
                return {
                    id: eventData.latestRegistrationId, // Use the latest registration ID
                    title: event.title,
                    date: startDate.toLocaleDateString('en-US', dateOptions),
                    time: startDate.toLocaleTimeString('en-US', timeOptions),
                    venue: event.venue,
                    ticketType: 'Standard', // Assuming a default if not available
                    price: event.ticketPrice,
                    status: status,
                    eventId: event._id,
                    ticketCount: eventData.count // Add the ticket count
                };
            });
            
            // Render dashboard with user data and bookings
            res.render('user_dashboard.ejs', { 
                user: {
                    name: user.name,
                    username: user.name.replace(/\s+/g, '').toLowerCase()
                },
                bookings: userBookings
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            return res.redirect('/login');
        }
    }
    
    async getUserEvents (req, res){
        try {
            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            
            // Find all registrations for this user and populate event details
            const Registration = (await import('../models/registration.js')).default;
            const Event = (await import('../models/event.js')).default;
            
            const registrations = await Registration.find({ userId })
                .populate({
                    path: 'eventId',
                    model: 'Event',
                    select: 'title description startDateTime endDateTime venue ticketPrice status'
                });
            
            // Extract the event data from registrations
            const events = registrations.map(registration => registration.eventId);
            
            res.status(200).json({
                success: true,
                events
            });
        } catch (error) {
            console.error('Error fetching user events:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve events',
                error: error.message
            });
        }
    }
    
    async getUserProfile (req, res) {
        try {
            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            
            // Find user by ID (excluding password hash)
            const User = (await import('../models/user.js')).default;
            const user = await User.findById(userId).select('-passwordHash');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve profile',
                error: error.message
            });
        }
    }
    
    async updateUserProfile (req, res) {
        try {
            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
              // Get updated profile data from request body
            const { name, phone, username } = req.body;
            
            // Validate required fields
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required'
                });
            }
            
            // Create update object with only the fields from our model
            const updateData = { 
                name,
                // We'll add other fields to the model as needed
                // Store additional fields as a profile object in the future if needed
            };
            
            // Update the user profile
            const User = (await import('../models/user.js')).default;
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-passwordHash');
            
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                user: updatedUser
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            
            // Check for duplicate email error
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: error.message
            });
        }
    }
    
    async changePassword(req, res) {
        try {
            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            
            // Get current password and new password from request body
            const { currentPassword, newPassword } = req.body;
            
            // Validate required fields
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }
            
            // Find the user
            const User = (await import('../models/user.js')).default;
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Import bcrypt for password hashing
            const bcrypt = (await import('bcrypt')).default;
            
            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            // Hash new password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(newPassword, saltRounds);
            
            // Update password
            user.passwordHash = passwordHash;
            await user.save();
            
            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password',
                error: error.message
            });
        }
    }
    
    async updateEmail(req, res) {
        try {
            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            
            // Get new email and password from request body
            const { newEmail, password } = req.body;
            
            // Validate required fields
            if (!newEmail || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }
            
            // Validate email format
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(newEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
            
            // Find the user
            const User = (await import('../models/user.js')).default;
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Import bcrypt for password verification
            const bcrypt = (await import('bcrypt')).default;
            
            // Verify current password
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            // Check if the new email is different from the current one
            if (user.email === newEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'New email is the same as the current email'
                });
            }
            
            // Check if email is already in use by another user
            const existingUser = await User.findOne({ email: newEmail });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use by another account'
                });
            }
            
            // Update email
            user.email = newEmail;
            await user.save();
            
            res.status(200).json({
                success: true,
                message: 'Email updated successfully'
            });
        } catch (error) {
            console.error('Error updating email:', error);
            
            // Check for duplicate email error
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to update email',
                error: error.message
            });
        }
    }

    async saveEvent(req, res) {
      try {
        const { eventId } = req.body;
        const userId = req.session.userId; // Assuming the user is authenticated
        console.log('Event id:', eventId);
    
        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
          return res.status(404).send('Event not found');
        }
    
        // Check if the event is already saved for the user
        const existingSavedEvent = await SavedEvent.findOne({ userId, eventId });
        if (existingSavedEvent) {
          return res.status(400).send('Event already saved.');
        }
    
        // Save the event for the user
        const savedEvent = new SavedEvent({ userId, eventId });
        await savedEvent.save();
    
        res.send('Event saved successfully!');
      } catch (error) {
        console.error('Error saving event:', error);
        res.status(500).send('An error occurred while saving the event.');
      }
    }
    async getSavedEvents(req, res){
        try {
            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
              // Find all saved events for this user and populate event details
            const savedEvents = await SavedEvent.find({ userId })
                .populate({
                    path: 'eventId',
                    model: 'Event',
                    select: 'title description startDateTime endDateTime venue ticketPrice status image'
                })
                .sort({ savedDate: -1 }); // Sort by most recently saved first
            
            // Extract the event data from saved events
            const events = savedEvents.map(saved => ({
                ...saved.eventId._doc,
                savedDate: saved.savedDate,
                savedEventId: saved._id
            }));
            
            res.status(200).json({
                success: true,
                events
            });
        } catch (error) {
            console.error('Error fetching saved events:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve saved events',
                error: error.message
            });
        }
    }

    async deleteSavedEvent(req, res) {
      try {
        const { eventId } = req.body; // The event ID to be deleted
        const userId = req.session.userId; // Assuming the user is authenticated
    
        // Check if the saved event exists for the user
        const savedEvent = await SavedEvent.findOne({ userId, eventId });
    
        if (!savedEvent) {
          return res.status(404).send('Saved event not found.');
        }
    
        // Delete the saved event
        await SavedEvent.deleteOne({ userId, eventId });
    
        res.send('Saved event deleted successfully!');
      } catch (error) {
        console.error('Error deleting saved event:', error);
        res.status(500).send('An error occurred while deleting the saved event.');
      }
    }

}

export default new userController();