import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['locale', 'voyage'],
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['culture', 'aventure', 'gastronomie', 'bien-etre'],
    required: function() {
      return this.type === 'locale';
    }
  },
  isWeekendOnly: {
    type: Boolean,
    default: false
  },
  voyageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voyage',
    required: function() {
      return this.type === 'voyage';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Activity = mongoose.model('Activity', activitySchema);
