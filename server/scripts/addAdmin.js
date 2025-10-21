import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/admin.js';
import User from '../models/user.js';

dotenv.config();

// Connect to MongoDB
const username = process.env.MONGO_USERNAME;
const password = encodeURIComponent(process.env.MONGO_PASSWORD);

const mongoUrl = `mongodb+srv://${username}:${password}@event-management-websit.4kvbvbt.mongodb.net/?retryWrites=true&w=majority&appName=event-management-website-db`;

async function addAdmin(userEmail) {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        // Find the user by email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.error(`User with email ${userEmail} not found`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.email})`);

        // Check if user is already an admin
        const existingAdmin = await Admin.findOne({ userId: user._id });

        if (existingAdmin) {
            console.log('User is already an admin!');
            process.exit(0);
        }

        // Create new admin entry
        const newAdmin = new Admin({
            userId: user._id,
            role: 'admin',
            createdAt: new Date()
        });

        await newAdmin.save();
        console.log('Successfully added user as admin!');
        console.log('Admin details:', {
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            role: newAdmin.role
        });

        process.exit(0);
    } catch (error) {
        console.error('Error adding admin:', error);
        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('Usage: node scripts/addAdmin.js <user-email>');
    console.error('Example: node scripts/addAdmin.js aaa@sss.com');
    process.exit(1);
}

addAdmin(email);
