import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  voyageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voyage',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Comment = mongoose.model('Comment', commentSchema); 