import express from 'express';
import Event from '../models/event.js';
import User from '../models/user.js';
import Registration from '../models/registration.js';
import { isAuth, optionalAuth } from '../middlewares/auth.js';
const router = express.Router();

// Route for payment page with event ID
router.get('/:id',optionalAuth ,async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).render('404');
        }
        
        console.log('Path of image', event.image);

        const userId = req.session.userId; // Assuming userId is stored in session
        if (!userId) {
            return res.status(401).send('Unauthorized: Please log in.');
        }

        const user = await User.findById(userId); // Fetch user details using userId
        if (!user) {
            return res.status(404).send('User not found.');
        }

        const totalRegistrations = await Registration.countDocuments({ eventId });
        const ticketsLeft = event.capacity - totalRegistrations;

        console.log('User retrieved:', user); 
        res.render('payments.ejs', {
            event,
            user,
            ticketsLeft,
            title: 'Payment for ' + event.title
        });
    } catch (error) {
        console.error('Error fetching event for payment:', error);
        res.status(500).send('An error occurred while processing your payment request.');
    }
});

// Process payment submission
// router.post('/process-payment', optionalAuth, async (req, res) => {
//     try {
//         const { eventId } = req.body;
//         const userId = req.user._id; // Assuming req.user contains the authenticated user's info

//         // Fetch the event to validate
//         const event = await Event.findById(eventId);
//         if (!event) {
//             return res.status(404).json({ error: 'Event not found.' });
//         }

//         // Check if the user is already registered
//         const existingRegistration = await Registration.findOne({ userId, eventId });
//         if (existingRegistration) {
//             return res.status(400).json({ error: 'You are already registered for this event.' });
//         }

//         // Simulate payment processing
//         const paymentSuccessful = true; // Placeholder for actual payment logic
//         if (!paymentSuccessful) {
//             return res.status(400).json({ error: 'Payment failed. Please try again.' });
//         }

//         // Register the user for the event
//         const newRegistration = new Registration({
//             userId,
//             eventId,
//         });
//         await newRegistration.save();

//         console.log('User registered successfully:', newRegistration);

//         // Redirect to user's dashboard after successful registration
//         res.redirect('/user/dashboard');
//     } catch (error) {
//         console.error('Error processing payment and registration:', error);
//         res.status(500).send('An error occurred while processing your payment and registration.');
//     }
// });

router.post('/process-payment', optionalAuth,async (req, res) => {
  try {
    const { eventId, tickets } = req.body;
    const userId = req.user._id;
    // Validate tickets is a number and greater than 0
    const ticketCount = parseInt(tickets, 10);
    if (isNaN(ticketCount) || ticketCount <= 0) {
      return res.status(400).json({ error: 'Invalid ticket count' });
    }

    // Get the event and total registrations
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const totalRegistrations = await Registration.countDocuments({ eventId });
    const ticketsLeft = event.capacity - totalRegistrations;

    // Check if tickets requested exceed tickets left
    if (ticketCount > ticketsLeft) {
      return res.status(400).json({ error: 'Not enough tickets left' });
    }

    // Process registration (create a Registration entry)
    for (let i = 0; i < ticketCount; i++) {
      await Registration.create({ userId, eventId });
    }

    // Update event status if sold out
    if (totalRegistrations + ticketCount >= event.capacity) {
      event.status = 'Not Selling';
      await event.save();
    }
    res.redirect('/user/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;