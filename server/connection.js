import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const username = process.env.MONGO_USERNAME;
    const password = encodeURIComponent(process.env.MONGO_PASSWORD); // Encode special characters

    // Construct the MongoDB connection string using environment variables
    const dbURI = `mongodb+srv://${username}:${password}@event-management-websit.4kvbvbt.mongodb.net/?retryWrites=true&w=majority&appName=event-management-website-db`;

    // Use local MongoDB as fallback if credentials aren't available
    const fallbackURI = 'mongodb://127.0.0.1:27017/EventManagement';

    await mongoose.connect(username && password ? dbURI : fallbackURI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the app if the database connection fails
  }
};

export default connectDB;
