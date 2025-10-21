import mongoose from 'mongoose';

const SavedEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  savedDate: { type: Date, default: Date.now },
}, {
  indexes: [
    { fields: { userId: 1, eventId: 1 }, unique: true }, // Prevent duplicate saved events for the same user
  ],
});

const SavedEvent = mongoose.model('SavedEvent', SavedEventSchema);

export default SavedEvent;
