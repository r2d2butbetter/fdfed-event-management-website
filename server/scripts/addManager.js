import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Manager from '../models/manager.js';
import User from '../models/user.js';

dotenv.config();

const username = process.env.MONGO_USERNAME;
const password = encodeURIComponent(process.env.MONGO_PASSWORD);

const mongoUrl = `mongodb+srv://${username}:${password}@event-management-websit.4kvbvbt.mongodb.net/?retryWrites=true&w=majority&appName=event-management-website-db`;

async function addManager(userEmail) {
    try {
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.error(`User with email ${userEmail} not found`);
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.email})`);

        const existingManager = await Manager.findOne({ userId: user._id });

        if (existingManager) {
            console.log('User is already a manager!');
            process.exit(0);
        }

        const newManager = new Manager({
            userId: user._id,
            role: 'manager',
            createdAt: new Date()
        });

        await newManager.save();
        console.log('Successfully added user as manager!');
        console.log('Manager details:', {
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
            role: newManager.role
        });

        process.exit(0);
    } catch (error) {
        console.error('Error adding manager:', error);
        process.exit(1);
    }
}

const email = process.argv[2];

if (!email) {
    console.error('Usage: node scripts/addManager.js <user-email>');
    console.error('Example: node scripts/addManager.js manager@example.com');
    process.exit(1);
}

addManager(email);
