import SavedEvent from '../models/save.js';
import Event from '../models/event.js';

class userController {
    async loadDashboard(req, res) {
        try {
            // Check if user is available through req.user (from middleware) or req.session.user
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                // No authenticated user, return 401
                console.log('No authenticated user found');
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Find user by ID (excluding password hash)
            const User = (await import('../models/user.js')).default;
            const Registration = (await import('../models/registration.js')).default;
            const Event = (await import('../models/event.js')).default;
            let user;

            try {
                // If userId exists, try to find the user
                if (userId) {
                    user = await User.findById(userId).select('name email').lean();
                }
            } catch (error) {
                console.error('Error finding user:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Error finding user'
                });
            }

            // If user not found, return 404
            if (!user) {
                console.error('User not found in database');
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            // Get user's bookings/registrations (only active ones for stats, but return all for display)
            const registrations = await Registration.find({ userId })
                .populate({
                    path: 'eventId',
                    model: 'Event',
                    select: 'title description startDateTime endDateTime venue ticketPrice status'
                }).sort({ registrationDate: -1 });

            // Group registrations by event for cleaner display
            const currentDate = new Date();
            const eventRegistrationMap = new Map();

            registrations.forEach(registration => {
                const event = registration.eventId;
                if (!event) return;

                const eventId = event._id.toString();
                const startDate = new Date(event.startDateTime);

                // Determine display status
                let displayStatus = 'upcoming';
                if (registration.status === 'cancelled') {
                    displayStatus = 'cancelled';
                } else if (event.status === 'cancelled') {
                    displayStatus = 'cancelled';
                } else if (startDate < currentDate) {
                    displayStatus = 'completed';
                }

                // Calculate refund info
                const daysUntilEvent = Math.ceil((startDate - currentDate) / (1000 * 60 * 60 * 24));
                let refundPercentage = 0;
                if (daysUntilEvent > 7) {
                    refundPercentage = 100;
                } else if (daysUntilEvent >= 3) {
                    refundPercentage = 50;
                } else {
                    refundPercentage = 0;
                }

                const canCancel = registration.status === 'active' && startDate > currentDate;

                // Group by event AND status (active vs cancelled shown separately)
                const groupKey = `${eventId}-${registration.status}`;

                if (!eventRegistrationMap.has(groupKey)) {
                    eventRegistrationMap.set(groupKey, {
                        eventId: event._id,
                        title: event.title,
                        startDateTime: event.startDateTime,
                        endDateTime: event.endDateTime,
                        venue: event.venue,
                        ticketType: 'Standard',
                        price: event.ticketPrice,
                        status: displayStatus,
                        registrationStatus: registration.status,
                        ticketCount: 0,
                        activeTicketCount: 0,
                        cancelledTicketCount: 0,
                        registrationIds: [], // All registration IDs for this event
                        activeRegistrationIds: [], // Only active registration IDs
                        registrationDate: registration.registrationDate,
                        canCancel: false,
                        refundPercentage,
                        refundAmountPerTicket: (event.ticketPrice * refundPercentage) / 100,
                        totalRefundedAmount: 0
                    });
                }

                const group = eventRegistrationMap.get(groupKey);
                group.ticketCount++;
                group.registrationIds.push(registration._id);

                if (registration.status === 'active') {
                    group.activeTicketCount++;
                    group.activeRegistrationIds.push(registration._id);
                    if (canCancel) {
                        group.canCancel = true;
                    }
                } else if (registration.status === 'cancelled') {
                    group.cancelledTicketCount++;
                    group.totalRefundedAmount += registration.refundAmount || 0;
                }

                // Keep the earliest registration date
                if (registration.registrationDate < group.registrationDate) {
                    group.registrationDate = registration.registrationDate;
                }
            });

            const userBookings = Array.from(eventRegistrationMap.values());

            // Calculate stats
            const activeBookings = userBookings.filter(b => b.registrationStatus === 'active');
            const cancelledBookings = userBookings.filter(b => b.registrationStatus === 'cancelled');
            const totalActiveTickets = activeBookings.reduce((sum, b) => sum + b.ticketCount, 0);
            const totalCancelledTickets = cancelledBookings.reduce((sum, b) => sum + b.ticketCount, 0);

            // Return JSON response
            return res.status(200).json({
                success: true,
                data: {
                    user: {
                        name: user.name,
                        email: user.email,
                        username: user.name.replace(/\s+/g, '').toLowerCase()
                    },
                    bookings: userBookings,
                    stats: {
                        totalBookings: totalActiveTickets,
                        upcomingEvents: activeBookings.filter(b => b.status === 'upcoming').reduce((sum, b) => sum + b.ticketCount, 0),
                        completedEvents: activeBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.ticketCount, 0),
                        cancelledEvents: totalCancelledTickets
                    }
                }
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to load dashboard',
                error: error.message
            });
        }
    }

    async getUserEvents(req, res) {
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

    async getUserProfile(req, res) {
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

    async updateUserProfile(req, res) {
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

            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Please log in to save events'
                });
            }

            console.log('Event id:', eventId, 'User id:', userId);

            // Check if the event exists
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            // Check if the event is already saved for the user
            const existingSavedEvent = await SavedEvent.findOne({ userId, eventId });
            if (existingSavedEvent) {
                return res.status(200).json({
                    success: true,
                    alreadySaved: true,
                    message: 'Event is already saved'
                });
            }

            // Save the event for the user
            const savedEvent = new SavedEvent({ userId, eventId });
            await savedEvent.save();

            res.status(200).json({
                success: true,
                message: 'Event saved successfully!'
            });
        } catch (error) {
            console.error('Error saving event:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while saving the event'
            });
        }
    }

    async unsaveEvent(req, res) {
        try {
            const { eventId } = req.body;

            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Please log in to unsave events'
                });
            }

            console.log('Unsaving event id:', eventId, 'User id:', userId);

            // Check if the event is saved for the user
            const savedEvent = await SavedEvent.findOne({ userId, eventId });
            if (!savedEvent) {
                return res.status(404).json({
                    success: false,
                    message: 'Event is not saved'
                });
            }

            // Remove the saved event
            await SavedEvent.deleteOne({ userId, eventId });

            res.status(200).json({
                success: true,
                message: 'Event unsaved successfully!'
            });
        } catch (error) {
            console.error('Error unsaving event:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while unsaving the event'
            });
        }
    }

    async checkSavedStatus(req, res) {
        try {
            const { eventId } = req.query;

            // Get user ID from either req.user or req.session
            let userId = null;
            if (req.user) {
                userId = req.user._id;
            } else if (req.session.userId) {
                userId = req.session.userId;
            } else {
                return res.status(200).json({
                    success: true,
                    isSaved: false
                });
            }

            // Check if the event is saved for the user
            const savedEvent = await SavedEvent.findOne({ userId, eventId });

            res.status(200).json({
                success: true,
                isSaved: !!savedEvent
            });
        } catch (error) {
            console.error('Error checking saved status:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred while checking saved status'
            });
        }
    }

    async getSavedEvents(req, res) {
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

    /**
     * Cancel a booking/registration
     * Time-based refund policy:
     * - >7 days before event: 100% refund
     * - 3-7 days before event: 50% refund
     * - <3 days before event: 0% refund
     */
    async cancelBooking(req, res) {
        try {
            const { registrationIds, ticketCount } = req.body;

            // Get user ID
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

            // Validate input
            if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Registration IDs are required'
                });
            }

            const cancelCount = ticketCount || registrationIds.length;
            if (cancelCount > registrationIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel more tickets than available'
                });
            }

            // Import required models
            const Registration = (await import('../models/registration.js')).default;
            const Event = (await import('../models/event.js')).default;
            const Payment = (await import('../models/payment.js')).default;

            // Get the registrations to cancel (take only the requested count)
            const idsToCancel = registrationIds.slice(0, cancelCount);

            // Fetch all registrations
            const registrations = await Registration.find({
                _id: { $in: idsToCancel },
                userId: userId,
                status: 'active'
            }).populate('eventId').populate('paymentId');

            if (registrations.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active registrations found to cancel'
                });
            }

            // Verify all registrations are for the same event
            const eventId = registrations[0].eventId._id.toString();
            const allSameEvent = registrations.every(r => r.eventId._id.toString() === eventId);
            if (!allSameEvent) {
                return res.status(400).json({
                    success: false,
                    message: 'All registrations must be for the same event'
                });
            }

            const event = registrations[0].eventId;
            const eventStartDate = new Date(event.startDateTime);
            const currentDate = new Date();

            // Check if event has already started
            if (eventStartDate <= currentDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel booking for an event that has already started or passed'
                });
            }

            // Calculate days until event
            const daysUntilEvent = Math.ceil((eventStartDate - currentDate) / (1000 * 60 * 60 * 24));

            // Determine refund percentage based on time-based policy
            let refundPercentage = 0;
            let refundMessage = '';
            if (daysUntilEvent > 7) {
                refundPercentage = 100;
                refundMessage = 'Full refund (more than 7 days before event)';
            } else if (daysUntilEvent >= 3) {
                refundPercentage = 50;
                refundMessage = '50% refund (3-7 days before event)';
            } else {
                refundPercentage = 0;
                refundMessage = 'No refund (less than 3 days before event)';
            }

            // Calculate refund amount per ticket
            const ticketPrice = event.ticketPrice;
            const refundAmountPerTicket = (ticketPrice * refundPercentage) / 100;
            let totalRefundAmount = 0;
            let cancelledCount = 0;

            // Cancel each registration
            for (const registration of registrations) {
                registration.status = 'cancelled';
                registration.cancelledAt = new Date();
                registration.refundAmount = refundAmountPerTicket;
                await registration.save();

                totalRefundAmount += refundAmountPerTicket;
                cancelledCount++;

                // Update Payment record if it exists
                if (registration.paymentId) {
                    const payment = await Payment.findById(registration.paymentId);
                    if (payment) {
                        payment.refundAmount = (payment.refundAmount || 0) + refundAmountPerTicket;
                        payment.refundedTickets = (payment.refundedTickets || 0) + 1;
                        payment.refundDate = new Date();

                        // Update payment status based on refunds
                        if (payment.refundedTickets >= payment.tickets) {
                            payment.status = 'refunded';
                        } else {
                            payment.status = 'partial_refund';
                        }

                        // Adjust commission and revenue based on refund
                        const refundCommission = refundAmountPerTicket * 0.05;
                        const refundOrganizerRevenue = refundAmountPerTicket * 0.95;
                        payment.adminCommission = payment.adminCommission - refundCommission;
                        payment.organizerRevenue = payment.organizerRevenue - refundOrganizerRevenue;

                        await payment.save();
                    }
                }
            }

            // Check if event can be reopened for selling (if it was sold out)
            if (event.status === 'Not Selling') {
                const activeRegistrations = await Registration.countDocuments({
                    eventId: event._id,
                    status: 'active'
                });
                if (activeRegistrations < event.capacity) {
                    event.status = 'start_selling';
                    await event.save();
                }
            }

            return res.status(200).json({
                success: true,
                message: `${cancelledCount} ticket(s) cancelled successfully`,
                data: {
                    cancelledCount,
                    totalRefundAmount,
                    refundAmountPerTicket,
                    refundPercentage,
                    refundMessage,
                    cancelledAt: new Date()
                }
            });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to cancel booking',
                error: error.message
            });
        }
    }

    /**
     * Get refund preview for a booking (without actually cancelling)
     */
    async getRefundPreview(req, res) {
        try {
            const { registrationId } = req.params;

            // Get user ID
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

            // Import required models
            const Registration = (await import('../models/registration.js')).default;

            // Find the registration
            const registration = await Registration.findById(registrationId)
                .populate('eventId');

            if (!registration) {
                return res.status(404).json({
                    success: false,
                    message: 'Registration not found'
                });
            }

            // Verify the registration belongs to this user
            if (registration.userId.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to view this booking'
                });
            }

            // Check if already cancelled
            if (registration.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'This booking has already been cancelled'
                });
            }

            const event = registration.eventId;
            const eventStartDate = new Date(event.startDateTime);
            const currentDate = new Date();

            // Check if event has already started
            if (eventStartDate <= currentDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel booking for an event that has already started or passed',
                    canCancel: false
                });
            }

            // Calculate days until event
            const daysUntilEvent = Math.ceil((eventStartDate - currentDate) / (1000 * 60 * 60 * 24));

            // Determine refund percentage based on time-based policy
            let refundPercentage = 0;
            let refundMessage = '';
            if (daysUntilEvent > 7) {
                refundPercentage = 100;
                refundMessage = 'Full refund (more than 7 days before event)';
            } else if (daysUntilEvent >= 3) {
                refundPercentage = 50;
                refundMessage = '50% refund (3-7 days before event)';
            } else {
                refundPercentage = 0;
                refundMessage = 'No refund (less than 3 days before event)';
            }

            // Calculate refund amount for this ticket
            const ticketPrice = event.ticketPrice;
            const refundAmount = (ticketPrice * refundPercentage) / 100;

            return res.status(200).json({
                success: true,
                data: {
                    registrationId: registration._id,
                    eventTitle: event.title,
                    eventDate: event.startDateTime,
                    ticketPrice,
                    daysUntilEvent,
                    refundPercentage,
                    refundAmount,
                    refundMessage,
                    canCancel: true
                }
            });
        } catch (error) {
            console.error('Error getting refund preview:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get refund preview',
                error: error.message
            });
        }
    }

}

export default new userController();