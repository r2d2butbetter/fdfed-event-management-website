import Event from '../models/event.js';

/**
 * Middleware to automatically update event status based on end date
 * Events that have passed their endDateTime will be marked as 'over'
 */
export const updateEventStatus = async (req, res, next) => {
    try {
        const now = new Date();

        // Update all events where endDateTime has passed and status is not already 'over'
        await Event.updateMany(
            {
                endDateTime: { $lt: now },
                status: { $in: ['start_selling', 'upcoming'] }
            },
            {
                $set: { status: 'over' }
            }
        );

        next();
    } catch (error) {
        console.error('Error updating event status:', error);
        // Don't block the request if status update fails
        next();
    }
};

export default updateEventStatus;
