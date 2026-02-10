import Event from '../models/event.js';
import Organizer from '../models/organizer.js';

/**
 * Middleware to validate email sending request
 * Checks:
 * - Event exists
 * - User owns the event
 * - Subject and message are provided
 * - Recipient emails are valid
 */
export const validateEmailRequest = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { subject, message, recipientEmails } = req.body;
    const userId = req.session.userId;

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer of this event
    const organizer = await Organizer.findOne({ userId });
    if (!organizer) {
      return res.status(403).json({
        success: false,
        message: 'You are not registered as an organizer'
      });
    }

    if (!event.organizerId.equals(organizer._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to send emails for this event'
      });
    }

    // Validate subject
    if (!subject || subject.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email subject is required'
      });
    }

    if (subject.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Email subject must be less than 200 characters'
      });
    }

    // Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email message is required'
      });
    }

    if (message.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Email message must be less than 5000 characters'
      });
    }

    // Validate recipient emails
    if (!recipientEmails || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one recipient email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipientEmails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid email addresses: ${invalidEmails.join(', ')}`
      });
    }

    // Check recipient limit (prevent abuse)
    if (recipientEmails.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send to more than 500 recipients at once'
      });
    }

    // Attach event and organizer to request for use in controller
    req.event = event;
    req.organizer = organizer;

    next();
  } catch (error) {
    console.error('Email validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while validating the email request',
      error: error.message
    });
  }
};
