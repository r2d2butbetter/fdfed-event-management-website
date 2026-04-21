import mongoose from 'mongoose';

const SavedEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  savedDate: { type: Date, default: Date.now },
});

// --- Indexes ---
// Prevent duplicate saves and speed up save/unsave/check-status lookups
SavedEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });
// Speed up getSavedEvents (find by userId, sort by savedDate)
SavedEventSchema.index({ userId: 1, savedDate: -1 });

const SavedEvent = mongoose.model('SavedEvent', SavedEventSchema);

export default SavedEvent;
