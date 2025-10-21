import User from '../models/user.js';
import Event from '../models/event.js';
import Organizer from '../models/organizer.js';
import Admin from '../models/admin.js';
import Registration from '../models/registration.js';

class adminController {    async loadDashboard (req, res) {
        try {
            // Get counts for dashboard statistics
            const userCount = await User.countDocuments();
            const eventCount = await Event.countDocuments();
            const organizerCount = await Organizer.countDocuments();
            const verifiedOrganizerCount = await Organizer.countDocuments({ verified: true });
            const adminCount = await Admin.countDocuments();
            
            // Get recent events
            const recentEvents = await Event.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('organizerId');
                
            // Since we're in the admin controller and passed the isAdmin middleware,
            // user is guaranteed to be an admin
            const admin = await Admin.findOne({ userId: req.user._id }).populate('userId');
            
            res.render("admin.ejs", {
                userCount,
                eventCount,
                organizerCount,
                verifiedOrganizerCount,
                adminCount,
                recentEvents,
                admin,
                user: req.user
            });
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
            res.status(500).send('Server error');
        }
    }
    
    // Chart data endpoints
    async getMonthlyEventStats(req, res) {
        try {
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            
            // Aggregate monthly events
            const monthlyEvents = await Event.aggregate([
                {
                    $match: {
                        startDateTime: { $gte: sixMonthsAgo, $lte: now }
                    }
                },
                {
                    $group: {
                        _id: { 
                            year: { $year: "$startDateTime" }, 
                            month: { $month: "$startDateTime" } 
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1 }
                }
            ]);
            
            // Format the data for the chart
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedData = [];
            
            // Initialize with zeros for the last 6 months
            for (let i = 0; i < 6; i++) {
                const d = new Date();
                d.setMonth(d.getMonth() - 5 + i);
                const year = d.getFullYear();
                const month = d.getMonth();
                
                formattedData.push({
                    month: months[month],
                    year: year,
                    count: 0
                });
            }
            
            // Fill in actual counts
            monthlyEvents.forEach(item => {
                const monthIndex = item._id.month - 1; // MongoDB months are 1-indexed
                const label = months[monthIndex];
                const dataIndex = formattedData.findIndex(
                    d => d.month === label && d.year === item._id.year
                );
                
                if (dataIndex !== -1) {
                    formattedData[dataIndex].count = item.count;
                }
            });
            
            res.json(formattedData);
        } catch (error) {
            console.error('Error getting monthly event stats:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async getEventCategoriesStats(req, res) {
        try {
            const categoryStats = await Event.aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);
            
            const formattedData = categoryStats.map(item => ({
                category: item._id,
                count: item.count
            }));
            
            res.json(formattedData);
        } catch (error) {
            console.error('Error getting event categories stats:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async getRevenueAnalysis(req, res) {
        try {
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            
            // Get all registrations from the last 6 months
            const registrations = await Registration.find({
                registrationDate: { $gte: sixMonthsAgo, $lte: now }
            }).populate('eventId');
            
            // Calculate monthly revenue
            const monthlyRevenue = {};
            
            registrations.forEach(reg => {
                if (reg.eventId && reg.eventId.ticketPrice) {
                    const date = new Date(reg.registrationDate);
                    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    
                    if (!monthlyRevenue[monthYear]) {
                        monthlyRevenue[monthYear] = 0;
                    }
                    
                    monthlyRevenue[monthYear] += reg.eventId.ticketPrice;
                }
            });
            
            // Format for chart
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const formattedData = [];
            
            // Initialize with zeros for all months
            for (let i = 0; i < 6; i++) {
                const d = new Date();
                d.setMonth(d.getMonth() - 5 + i);
                const year = d.getFullYear();
                const month = d.getMonth();
                const monthYear = `${year}-${month + 1}`;
                
                formattedData.push({
                    month: months[month],
                    year: year,
                    revenue: monthlyRevenue[monthYear] || 0
                });
            }
            
            res.json(formattedData);
        } catch (error) {
            console.error('Error getting revenue analysis:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async getOrganizerVerificationStats(req, res) {
        try {
            // Get counts of verified and unverified organizers
            const verifiedCount = await Organizer.countDocuments({ verified: true });
            const unverifiedCount = await Organizer.countDocuments({ verified: false });
            
            const data = [
                { status: 'Verified', count: verifiedCount },
                { status: 'Unverified', count: unverifiedCount }
            ];
            
            res.json(data);
        } catch (error) {
            console.error('Error getting organizer verification stats:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async getAllUsers (req, res) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            console.error('Error getting users:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async getAllEvents (req, res) {
        try {
            const events = await Event.find().populate('organizerId');
            res.json(events);
        } catch (error) {
            console.error('Error getting events:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async getAllOrganizers (req, res) {
        try {
            const organizers = await Organizer.find().populate('userId');
            res.json(organizers);
        } catch (error) {
            console.error('Error getting organizers:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async getOrganizerById (req, res) {
        try {
            const { id } = req.params;
            const organizer = await Organizer.findById(id).populate('userId');
            
            if (!organizer) {
                return res.status(404).json({ message: 'Organizer not found' });
            }
            
            res.json(organizer);
        } catch (error) {
            console.error('Error getting organizer:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async verifyOrganizer (req, res) {
        try {
            const { id } = req.params;
            const organizer = await Organizer.findByIdAndUpdate(
                id,
                { verified: true },
                { new: true }
            );
            
            if (!organizer) {
                return res.status(404).json({ message: 'Organizer not found' });
            }
            
            res.json({ message: 'Organizer verified successfully', organizer });
        } catch (error) {
            console.error('Error verifying organizer:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async rejectOrganizer (req, res) {
        try {
            const { id } = req.params;
            const organizer = await Organizer.findByIdAndUpdate(
                id,
                { verified: false },
                { new: true }
            );
            
            if (!organizer) {
                return res.status(404).json({ message: 'Organizer not found' });
            }
            
            res.json({ message: 'Organizer rejected', organizer });
        } catch (error) {
            console.error('Error rejecting organizer:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async updateUser (req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const user = await User.findByIdAndUpdate(id, updateData, { new: true });
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json({ message: 'User updated successfully', user });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    
    async deleteUser (req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndDelete(id);
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
      async createUser (req, res) {
        try {
            const userData = req.body;
            const user = new User(userData);
            await user.save();
            
            res.status(201).json({ message: 'User created successfully', user });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

}

export default new adminController();