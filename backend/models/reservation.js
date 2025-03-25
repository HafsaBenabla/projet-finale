import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['voyage', 'activite'],
    required: true
  },
  voyage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voyage',
    required: function() {
      return this.type === 'voyage';
    }
  },
  activite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activite',
    required: function() {
      return this.type === 'activite';
    }
  },
  dateReservation: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['confirmé', 'en_attente', 'annulé'],
    default: 'confirmé'
  }
}, {
  timestamps: true
});

// Vérifier si le modèle existe déjà avant de le créer
export const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
