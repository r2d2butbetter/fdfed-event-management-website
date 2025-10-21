import express from 'express';
import Event from '../models/event.js';
import User from '../models/user.js';
import Registration from '../models/registration.js';
import { isAuth, optionalAuth } from '../middlewares/auth.js';
const router = express.Router();

// Route for payment page with event ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    console.log('Path of image', event.image);

    const userId = req.session.userId; // Assuming userId is stored in session
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Please log in.'
      });
    }

    const user = await User.findById(userId); // Fetch user details using userId
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const totalRegistrations = await Registration.countDocuments({ eventId });
    const ticketsLeft = event.capacity - totalRegistrations;

    console.log('User retrieved:', user);

    return res.status(200).json({
      success: true,
      message: 'Payment data retrieved successfully',
      data: {
        event: {
          _id: event._id,
          title: event.title,
          description: event.description,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          venue: event.venue,
          capacity: event.capacity,
          ticketPrice: event.ticketPrice,
          image: event.image,
          category: event.category,
          status: event.status
        },
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        ticketsLeft,
        totalRegistrations
      }
    });
  } catch (error) {
    console.error('Error fetching event for payment:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your payment request.',
      error: error.message
    });
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
router.get('/events/:id/tickets-left', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const totalRegistrations = await Registration.countDocuments({ eventId });
    const ticketsLeft = event.capacity - totalRegistrations;
    res.json({ ticketsLeft });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New: Process payment asynchronously

router.post('/process-payment', optionalAuth, async (req, res) => {
  try {
    const { eventId, tickets } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const ticketCount = parseInt(tickets, 10);
    if (isNaN(ticketCount) || ticketCount <= 0)
      return res.status(400).json({ error: 'Invalid ticket count' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const totalRegistrations = await Registration.countDocuments({ eventId });
    const ticketsLeft = event.capacity - totalRegistrations;

    if (ticketCount > ticketsLeft)
      return res.status(400).json({ error: 'Not enough tickets left' });

    for (let i = 0; i < ticketCount; i++) {
      await Registration.create({ userId, eventId });
    }

    if (totalRegistrations + ticketCount >= event.capacity) {
      event.status = 'Not Selling';
      await event.save();
    }

    res.json({ success: true, ticketsLeft: ticketsLeft - ticketCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//similar function but more robust 
// router.post('/api/payments/process-payment-ajax', optionalAuth, async (req, res) => {
//   try {
//     const { eventId, tickets, paymentMethod, cardNumber, cardExpiry, cardCvv, cardName, upiId } = req.body;
//     const userId = req.user?._id;
//     console.log('Received payment data:', req.body);
//     if (!userId) return res.status(401).json({ error: 'Unauthorized' });

//     const ticketCount = parseInt(tickets, 10);
//     if (isNaN(ticketCount) || ticketCount <= 0)
//       return res.status(400).json({ error: 'Invalid ticket count' });

//     if (!eventId) return res.status(400).json({ error: 'Missing event ID' });

//     const event = await Event.findById(eventId);
//     if (!event) return res.status(404).json({ error: 'Event not found' });

//     // Simple payment validation
//     if (paymentMethod === 'card') {
//       if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
//         return res.status(400).json({ error: 'Incomplete card payment details' });
//       }
//       // Here add card validation or connect your payment gateway
//     } else if (paymentMethod === 'upi') {
//       if (!upiId) {
//         return res.status(400).json({ error: 'Missing UPI ID' });
//       }
//       // Add UPI validation or payment gateway integration here
//     } else {
//       return res.status(400).json({ error: 'Invalid payment method' });
//     }

//     const totalRegistrations = await Registration.countDocuments({ eventId });
//     const ticketsLeft = event.capacity - totalRegistrations;

//     if (ticketCount > ticketsLeft)
//       return res.status(400).json({ error: 'Not enough tickets left' });

//     for (let i = 0; i < ticketCount; i++) {
//       await Registration.create({ userId, eventId });
//     }

//     if (totalRegistrations + ticketCount >= event.capacity) {
//       event.status = 'Not Selling';
//       await event.save();
//     }

//     res.json({ success: true, ticketsLeft: ticketsLeft - ticketCount });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });



//old code 
// router.post('/process-payment', optionalAuth,async (req, res) => {
//   try {
//     const { eventId, tickets } = req.body;
//     const userId = req.user._id;
//     const ticketCount = parseInt(tickets, 10);
//     if (isNaN(ticketCount) || ticketCount <= 0) {
//       return res.status(400).json({ error: 'Invalid ticket count' });
//     }

//     // Get the event and total registrations
//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     const totalRegistrations = await Registration.countDocuments({ eventId });
//     const ticketsLeft = event.capacity - totalRegistrations;

//     // Check if tickets requested exceed tickets left
//     if (ticketCount > ticketsLeft) {
//       return res.status(400).json({ error: 'Not enough tickets left' });
//     }

//     // Process registration (create a Registration entry)
//     for (let i = 0; i < ticketCount; i++) {
//       await Registration.create({ userId, eventId });
//     }

//     // Update event status if sold out
//     if (totalRegistrations + ticketCount >= event.capacity) {
//       event.status = 'Not Selling';
//       await event.save();
//     }
//     res.redirect('/user/dashboard');
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


export default router;