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
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  agencyName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['culture', 'aventure', 'gastronomie', 'bien-etre', 'sport-sensations', 'nature-aventure'],
    required: function() {
      return this.type === 'locale';
    }
  },
  isWeekendOnly: {
    type: Boolean,
    default: false
  },
  timeSlots: [
    {
      date: {
        type: Date,
        required: function() {
          return this.parent().isWeekendOnly && this.parent().type === 'locale';
        }
      },
      startTime: {
        type: String,
        required: function() {
          return this.parent().isWeekendOnly && this.parent().type === 'locale';
        }
      },
      endTime: {
        type: String,
        required: function() {
          return this.parent().isWeekendOnly && this.parent().type === 'locale';
        }
      },
      availableSpots: {
        type: Number,
        required: function() {
          return this.parent().isWeekendOnly && this.parent().type === 'locale';
        }
      }
    }
  ],
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

// Vérifier si le modèle existe déjà pour éviter l'erreur OverwriteModelError
export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
