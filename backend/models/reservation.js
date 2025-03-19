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
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

export const Reservation = mongoose.model('Reservation', reservationSchema);
