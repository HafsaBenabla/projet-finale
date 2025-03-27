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
  nombrePersonnes: {
    type: Number,
    required: true,
    min: 1
  },
  dateReservation: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['confirmé', 'en_attente', 'annulé'],
    default: 'confirmé'
  },
  annulePar: {
    type: String,
    enum: ['user', 'admin'],
    default: null
  },
  dateModification: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Middleware pour mettre à jour les places disponibles lors de la création d'une réservation
reservationSchema.pre('save', async function(next) {
  if (this.isNew && this.type === 'voyage' && this.statut === 'confirmé') {
    const voyage = await mongoose.model('Voyage').findById(this.voyage);
    if (voyage) {
      if (voyage.availableSpots < this.nombrePersonnes) {
        throw new Error('Pas assez de places disponibles');
      }
      voyage.availableSpots -= this.nombrePersonnes;
      await voyage.save();
    }
  }
  next();
});

// Middleware pour mettre à jour les places disponibles lors de l'annulation d'une réservation
reservationSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.statut === 'annulé') {
    const reservation = await this.model.findOne(this.getQuery());
    if (reservation && reservation.type === 'voyage' && reservation.statut !== 'annulé') {
      const voyage = await mongoose.model('Voyage').findById(reservation.voyage);
      if (voyage) {
        voyage.availableSpots += reservation.nombrePersonnes;
        await voyage.save();
      }
    }
  }
  next();
});

// Vérifier si le modèle existe déjà avant de le créer
export const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
