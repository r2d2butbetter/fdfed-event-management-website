// Admin model that references User model
import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  // Reference to the User model
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true
  },
  // Additional admin-specific fields can be added here
  role: { 
    type: String, 
    default: 'admin' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
