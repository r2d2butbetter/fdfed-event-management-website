import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: 'manager'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Manager = mongoose.model('Manager', ManagerSchema);

export default Manager;
