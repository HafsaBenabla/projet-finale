import mongoose from 'mongoose';

const voyageSchema = new mongoose.Schema({
    title: {
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
    destination: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    maxPlaces: {
        type: Number,
        required: true,
        default: 15
    },
    inclusions: [{
        type: String,
        required: true
    }],
    programme: [{
        type: String,
        required: true
    }],
    availableSpots: {
        type: Number,
        required: true,
        default: 15
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pour s'assurer que availableSpots ne dépasse pas maxPlaces
voyageSchema.pre('save', function(next) {
    if (this.availableSpots > this.maxPlaces) {
        this.availableSpots = this.maxPlaces;
    }
    next();
});

export const Voyage = mongoose.model('Voyage', voyageSchema);