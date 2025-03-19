import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  voyageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voyage',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  numberOfPersons: {
    type: Number,
    required: true,
    min: 1
  },
  departureDate: {
    type: Date,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmée', 'en attente', 'annulée'],
    default: 'confirmée'
  }
});

export const Reservation = mongoose.model('Reservation', reservationSchema);
