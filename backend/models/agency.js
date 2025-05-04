import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le nom de l'agence est requis"]
    },
    address: {
        type: String,
        required: [true, "L'adresse de l'agence est requise"]
    },
    city: {
        type: String,
        required: [true, "La ville de l'agence est requise"]
    },
    phone: {
        type: String,
        required: [true, "Le numéro de téléphone est requis"]
    },
    email: {
        type: String,
        required: [true, "L'email est requis"],
        unique: true
    },
    description: {
        type: String,
        required: [true, "La description est requise"]
    },
    type: {
        type: String,
        required: [true, "Le type d'agence est requis"],
        enum: {
            values: ['voyage', 'activite'],
            message: "Le type d'agence doit être 'voyage' ou 'activite'"
        }
    },
    image: {
        type: String,
        required: [true, "L'URL de l'image est requise"],
        validate: {
            validator: function(v) {
                return v && v.trim().length > 0;
            },
            message: "L'URL de l'image ne peut pas être vide"
        }
    },
    stars: {
        type: Number,
        required: [true, "Le nombre d'étoiles est requis"],
        min: [0, "Le nombre d'étoiles ne peut pas être inférieur à 0"],
        max: [5, "Le nombre d'étoiles ne peut pas être supérieur à 5"],
        validate: {
            validator: function(v) {
                // Accepte les nombres entiers et les demi-nombres (ex: 1, 1.5, 2, 2.5, etc.)
                return v >= 0 && v <= 5 && (v * 2) % 1 === 0;
            },
            message: "Le nombre d'étoiles doit être un nombre entier ou un demi-nombre entre 0 et 5"
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pre-save pour s'assurer que les champs requis sont présents
agencySchema.pre('save', function(next) {
    if (!this.image || !this.stars || !this.type) {
        next(new Error('Les champs image, stars et type sont obligatoires'));
    }
    next();
});

export const Agency = mongoose.model('Agency', agencySchema); 