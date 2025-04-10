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
    ref: 'Activity',
    required: function() {
      return this.type === 'activite';
    }
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() {
      // Requis uniquement pour les activités qui ont des créneaux
      return this.type === 'activite';
    }
  },
  timeSlotInfo: {
    date: { type: Date },
    startTime: { type: String },
    endTime: { type: String }
  },
  clientInfo: {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String }
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
  },
  // Option pour contourner le middleware pre-save (non stockée en DB)
  _skipMiddleware: {
    type: Boolean,
    default: false,
    select: false
  }
}, {
  timestamps: true
});

// Middleware pour mettre à jour les places disponibles lors de la création d'une réservation
reservationSchema.pre('save', async function(next) {
  // Si on a explicitement demandé à contourner le middleware, on passe directement au suivant
  if (this._skipMiddleware) {
    console.log('Middleware pre-save contourné pour la réservation:', this._id);
    return next();
  }
  
  if (this.isNew && this.statut === 'confirmé') {
    if (this.type === 'voyage') {
      // Mise à jour des places pour un voyage
      const voyage = await mongoose.model('Voyage').findById(this.voyage);
      if (voyage) {
        if (voyage.availableSpots < this.nombrePersonnes) {
          throw new Error('Pas assez de places disponibles');
        }
        voyage.availableSpots -= this.nombrePersonnes;
        await voyage.save();
      }
    } else if (this.type === 'activite') {
      // Mise à jour des places pour une activité avec créneau horaire
      const activity = await mongoose.model('Activity').findById(this.activite);
      if (activity && activity.timeSlots && activity.timeSlots.length > 0) {
        // Trouver le créneau correspondant
        const timeSlotIndex = activity.timeSlots.findIndex(
          slot => slot._id.toString() === this.timeSlotId.toString()
        );
        
        if (timeSlotIndex !== -1) {
          // Vérifier les places disponibles
          if (activity.timeSlots[timeSlotIndex].availableSpots < this.nombrePersonnes) {
            throw new Error('Pas assez de places disponibles pour ce créneau');
          }
          
          // Mettre à jour les places disponibles
          activity.timeSlots[timeSlotIndex].availableSpots -= this.nombrePersonnes;
          await activity.save();
        }
      }
    }
  }
  next();
});

// Middleware pour mettre à jour les places disponibles lors de l'annulation d'une réservation
reservationSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.statut === 'annulé') {
    const reservation = await this.model.findOne(this.getQuery());
    if (reservation && reservation.statut !== 'annulé') {
      if (reservation.type === 'voyage') {
        // Restaurer les places pour un voyage
        const voyage = await mongoose.model('Voyage').findById(reservation.voyage);
        if (voyage) {
          voyage.availableSpots += reservation.nombrePersonnes;
          await voyage.save();
        }
      } else if (reservation.type === 'activite' && reservation.timeSlotId) {
        // Restaurer les places pour une activité avec créneau horaire
        const activity = await mongoose.model('Activity').findById(reservation.activite);
        if (activity && activity.timeSlots && activity.timeSlots.length > 0) {
          // Trouver le créneau correspondant
          const timeSlotIndex = activity.timeSlots.findIndex(
            slot => slot._id.toString() === reservation.timeSlotId.toString()
          );
          
          if (timeSlotIndex !== -1) {
            // Mettre à jour les places disponibles
            activity.timeSlots[timeSlotIndex].availableSpots += reservation.nombrePersonnes;
            await activity.save();
          }
        }
      }
    }
  }
  next();
});

// Vérifier si le modèle existe déjà avant de le créer
export const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
