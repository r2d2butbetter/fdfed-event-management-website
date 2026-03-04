import Organizer from '../models/organizer.js';
import User from '../models/user.js';
import Event from '../models/event.js';
import Manager from '../models/manager.js';
import { sendEmail } from '../config/emailConfig.js';
import logger from '../config/logger.js';

class managerController {
    // Manager dashboard - overview stats
    async loadDashboard(req, res) {
        try {
            const totalOrganizers = await Organizer.countDocuments();
            const pendingVerifications = await Organizer.countDocuments({ verificationStatus: 'pending' });
            const approvedOrganizers = await Organizer.countDocuments({ verificationStatus: 'approved' });
            const rejectedOrganizers = await Organizer.countDocuments({ verificationStatus: 'rejected' });
            const notSubmitted = await Organizer.countDocuments({ verificationStatus: 'not_submitted' });

            // Recent verification requests
            const recentRequests = await Organizer.find({ verificationStatus: 'pending' })
                .populate('userId', 'name email')
                .sort({ verificationRequestDate: -1 })
                .limit(10)
                .lean();

            // Recently reviewed
            const recentReviews = await Organizer.find({
                verificationStatus: { $in: ['approved', 'rejected'] },
                verificationReviewDate: { $ne: null }
            })
                .populate('userId', 'name email')
                .sort({ verificationReviewDate: -1 })
                .limit(10)
                .lean();

            res.json({
                success: true,
                data: {
                    stats: {
                        totalOrganizers,
                        pendingVerifications,
                        approvedOrganizers,
                        rejectedOrganizers,
                        notSubmitted,
                    },
                    recentRequests,
                    recentReviews,
                    manager: {
                        name: req.user.name,
                        email: req.user.email,
                    }
                }
            });
        } catch (error) {
            logger.error('Error loading manager dashboard:', { error: error.message });
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get all organizers with filters
    async getAllOrganizers(req, res) {
        try {
            const { status, page = 1, limit = 10, search } = req.query;

            const filter = {};
            if (status && status !== 'all') {
                filter.verificationStatus = status;
            }
            if (search) {
                filter.$or = [
                    { organizationName: { $regex: search, $options: 'i' } },
                ];
            }

            const total = await Organizer.countDocuments(filter);
            const organizers = await Organizer.find(filter)
                .populate('userId', 'name email')
                .sort({ verificationRequestDate: -1, _id: -1 })
                .skip((parseInt(page) - 1) * parseInt(limit))
                .limit(parseInt(limit))
                .lean();

            res.json({
                success: true,
                data: {
                    organizers,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(total / parseInt(limit)),
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching organizers:', { error: error.message });
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get organizer details for review
    async getOrganizerDetails(req, res) {
        try {
            const { id } = req.params;
            const organizer = await Organizer.findById(id)
                .populate('userId', 'name email createdAt')
                .lean();

            if (!organizer) {
                return res.status(404).json({ success: false, message: 'Organizer not found' });
            }

            const eventCount = await Event.countDocuments({ organizerId: id });

            res.json({
                success: true,
                data: {
                    organizer,
                    eventCount,
                }
            });
        } catch (error) {
            logger.error('Error fetching organizer details:', { error: error.message });
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Approve an organizer
    async approveOrganizer(req, res) {
        try {
            const { id } = req.params;
            const organizer = await Organizer.findById(id).populate('userId', 'name email');

            if (!organizer) {
                return res.status(404).json({ success: false, message: 'Organizer not found' });
            }

            if (organizer.verificationStatus !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: `Cannot approve organizer with status: ${organizer.verificationStatus}. Only pending requests can be approved.`
                });
            }

            organizer.verified = true;
            organizer.verificationStatus = 'approved';
            organizer.verificationReviewDate = new Date();
            organizer.reviewedBy = req.manager._id;
            organizer.rejectionReason = undefined;
            await organizer.save();

            // Send approval email
            const userEmail = organizer.userId?.email;
            const userName = organizer.userId?.name;
            if (userEmail) {
                const subject = 'Organizer Verification Approved!';
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>Congratulations! You're Verified!</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>Your organizer account for <strong>${organizer.organizationName}</strong> has been verified successfully!</p>
                                <p>You can now create events and start selling tickets on our platform.</p>
                                <p>Log in to your organizer dashboard to get started.</p>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Event Management Platform. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                const text = `Congratulations ${userName}! Your organizer account for ${organizer.organizationName} has been verified. You can now create events.`;
                await sendEmail(userEmail, subject, text, html);
            }

            res.json({
                success: true,
                message: 'Organizer approved and notified via email.',
                data: { organizer }
            });
        } catch (error) {
            logger.error('Error approving organizer:', { error: error.message });
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Reject an organizer
    async rejectOrganizer(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const organizer = await Organizer.findById(id).populate('userId', 'name email');

            if (!organizer) {
                return res.status(404).json({ success: false, message: 'Organizer not found' });
            }

            if (organizer.verificationStatus !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: `Cannot reject organizer with status: ${organizer.verificationStatus}. Only pending requests can be rejected.`
                });
            }

            organizer.verified = false;
            organizer.verificationStatus = 'rejected';
            organizer.verificationReviewDate = new Date();
            organizer.reviewedBy = req.manager._id;
            organizer.rejectionReason = reason || 'No reason provided';
            await organizer.save();

            // Send rejection email
            const userEmail = organizer.userId?.email;
            const userName = organizer.userId?.name;
            if (userEmail) {
                const subject = 'Organizer Verification Update';
                const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                            .reason-box { background: #fff3f3; border-left: 4px solid #ef4444; padding: 12px; margin: 10px 0; }
                            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h2>Verification Request Update</h2>
                            </div>
                            <div class="content">
                                <p>Dear ${userName},</p>
                                <p>We regret to inform you that your verification request for <strong>${organizer.organizationName}</strong> was not approved at this time.</p>
                                <div class="reason-box">
                                    <strong>Reason:</strong> ${organizer.rejectionReason}
                                </div>
                                <p>You can update your documents and resubmit for verification.</p>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} Event Management Platform. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
                const text = `Dear ${userName}, your verification request for ${organizer.organizationName} was not approved. Reason: ${organizer.rejectionReason}. You can resubmit.`;
                await sendEmail(userEmail, subject, text, html);
            }

            res.json({
                success: true,
                message: 'Organizer rejected and notified via email.',
                data: { organizer }
            });
        } catch (error) {
            logger.error('Error rejecting organizer:', { error: error.message });
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get verification statistics over time
    async getVerificationStats(req, res) {
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const monthlyStats = await Organizer.aggregate([
                {
                    $match: {
                        verificationReviewDate: { $gte: sixMonthsAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: { $month: '$verificationReviewDate' },
                            year: { $year: '$verificationReviewDate' },
                            status: '$verificationStatus'
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            res.json({
                success: true,
                data: monthlyStats
            });
        } catch (error) {
            logger.error('Error fetching verification stats:', { error: error.message });
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}

export default new managerController();
