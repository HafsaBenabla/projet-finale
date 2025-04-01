import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Activity } from './models/activity.js';
import { Voyage } from './models/voyage.js';
import { Agency } from './models/agency.js';
import { Reservation } from './models/reservation.js';
import { User } from './models/user.js';
import authRoutes from './routes/auth.js';
import reservationsRoutes from './routes/reservations.js';
import voyagesRoutes from './routes/voyages.js';
import contactRoutes from './routes/contact.js';
import usersRoutes from './routes/users.js';
import activitiesRoutes from './routes/activities.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Configuration CORS détaillée
app.use(cors({
  origin: true, // Permet toutes les origines en développement
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging pour déboguer
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/voyages', voyagesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/activities', activitiesRoutes);

// Création du dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de Multer avec plus de logs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Upload destination directory:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Servir les fichiers statiques du dossier uploads avec CORS
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Route pour l'upload d'images
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log('Fichier reçu:', req.file);
  if (!req.file) {
    console.error('Aucun fichier n\'a été uploadé');
    return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
  }

  // Construire l'URL complète de l'image
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  console.log('URL de l\'image générée:', imageUrl);
  res.json({ imageUrl });
});

// Configuration de la connexion MongoDB avec plus de logs
mongoose.connect('mongodb+srv://admin:admin@cluster0.bedq1.mongodb.net/maghrebxplore?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database Name:', mongoose.connection.name);
    // Lister les collections existantes
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error listing collections:', err);
        return;
      }
      console.log('Available collections:', collections.map(c => c.name));
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Arrêter l'application si la connexion échoue
  });

// Route pour récupérer tous les voyages
app.get('/api/voyages', async (req, res) => {
  try {
    const voyages = await Voyage.find()
      .populate({
        path: 'activities',
        select: 'name description price image duration maxParticipants'
      })
      .sort({ createdAt: -1 });

    // Formater les URLs des images pour les voyages et leurs activités
    const formattedVoyages = voyages.map(voyage => {
      const voyageObj = voyage.toObject();
      
      // Formater l'URL de l'image du voyage
      if (voyageObj.image && voyageObj.image.includes('/uploads/')) {
        if (!voyageObj.image.startsWith('http')) {
          voyageObj.image = `http://localhost:${PORT}${voyageObj.image}`;
        }
      }

      // Formater les URLs des images des activités
      if (voyageObj.activities) {
        voyageObj.activities = voyageObj.activities.map(activity => {
          if (activity.image && activity.image.includes('/uploads/')) {
            if (!activity.image.startsWith('http')) {
              activity.image = `http://localhost:${PORT}${activity.image}`;
            }
          }
          return activity;
        });
      }

      return voyageObj;
    });

    res.json(formattedVoyages);
  } catch (error) {
    console.error('Erreur lors de la récupération des voyages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer un voyage spécifique
app.get('/api/voyages/:id', async (req, res) => {
  try {
    console.log('Récupération du voyage avec ID:', req.params.id);
    
    // Récupérer le voyage avec toutes ses activités
    const voyage = await Voyage.findById(req.params.id)
      .populate({
        path: 'activities',
        model: 'Activity',
        select: 'name description price image duration maxParticipants type city category'
      });

    if (!voyage) {
      console.log('Voyage non trouvé');
      return res.status(404).json({ error: 'Voyage non trouvé' });
    }

    // Vérifier également les activités directement liées à ce voyage
    const linkedActivities = await Activity.find({ 
      voyageId: req.params.id,
      type: 'voyage'
    });
    
    console.log('Activités trouvées via populate:', voyage.activities.length);
    console.log('Activités trouvées via recherche directe:', linkedActivities.length);

    // Fusionner les activités si nécessaire
    const allActivityIds = new Set([
      ...voyage.activities.map(a => a._id.toString()),
      ...linkedActivities.map(a => a._id.toString())
    ]);

    // Formater les URLs des images
    const voyageObj = voyage.toObject();
    
    // Formater l'URL de l'image du voyage
    if (voyageObj.image && voyageObj.image.includes('/uploads/')) {
      if (!voyageObj.image.startsWith('http')) {
        voyageObj.image = `http://localhost:${PORT}${voyageObj.image}`;
      }
    }

    // Fusionner et formater toutes les activités
    const allActivities = Array.from(allActivityIds).map(id => {
      const activity = [...voyage.activities, ...linkedActivities]
        .find(a => a._id.toString() === id);
      
      if (!activity) return null;

      const formattedActivity = activity.toObject ? activity.toObject() : activity;
      
      if (formattedActivity.image && formattedActivity.image.includes('/uploads/')) {
        if (!formattedActivity.image.startsWith('http')) {
          formattedActivity.image = `http://localhost:${PORT}${formattedActivity.image}`;
        }
      }
      
      return formattedActivity;
    }).filter(Boolean);

    voyageObj.activities = allActivities;

    console.log('Nombre total d\'activités après fusion:', allActivities.length);
    console.log('Détails des activités:', allActivities.map(act => ({
      id: act._id,
      name: act.name,
      type: act.type
    })));

    res.json(voyageObj);
  } catch (error) {
    console.error('Erreur lors de la récupération du voyage:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voyages', async (req, res) => {
  try {
    console.log('1. Données reçues pour l\'ajout d\'un voyage:', req.body);
    const voyageData = { ...req.body };

    // Formater l'URL de l'image si nécessaire
    if (voyageData.image) {
      if (voyageData.image.includes('/uploads/')) {
        // Si l'image est déjà une URL complète, on la garde telle quelle
        if (!voyageData.image.startsWith('http')) {
          voyageData.image = `/uploads/${voyageData.image.split('/uploads/')[1]}`;
        }
      }
      console.log('2. URL de l\'image formatée:', voyageData.image);
    }

    const voyage = new Voyage(voyageData);
    const newVoyage = await voyage.save();
    console.log('3. Voyage sauvegardé avec succès:', newVoyage);

    // Construire l'URL complète pour l'image dans la réponse
    const voyageResponse = newVoyage.toObject();
    if (voyageResponse.image && voyageResponse.image.startsWith('/uploads/')) {
      voyageResponse.image = `http://localhost:${PORT}${voyageResponse.image}`;
    }

    res.status(201).json(voyageResponse);
  } catch (error) {
    console.error('Erreur lors de la création du voyage:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

app.delete('/api/voyages/:id', async (req, res) => {
  try {
    const voyage = await Voyage.findByIdAndDelete(req.params.id);
    if (!voyage) {
      return res.status(404).json({ message: "Voyage non trouvé" });
    }
    res.json({ message: "Voyage supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes pour les réservations
app.post('/api/reservations', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { voyageId, clientName, email, phone, numberOfPersons, departureDate } = req.body;

    // Vérifier et mettre à jour le voyage en une seule opération atomique
    const updatedVoyage = await Voyage.findOneAndUpdate(
      {
        _id: voyageId,
        availableSpots: { $gte: numberOfPersons }
      },
      {
        $inc: { availableSpots: -numberOfPersons }
      },
      {
        new: true,
        session,
        runValidators: false // Désactiver la validation pour cette mise à jour
      }
    );

    if (!updatedVoyage) {
      throw new Error('Voyage non trouvé ou places insuffisantes');
    }

    // Créer la réservation
    const reservation = new Reservation({
      voyageId,
      clientName,
      email,
      phone,
      numberOfPersons,
      departureDate,
      status: 'confirmée'
    });
    await reservation.save({ session });

    await session.commitTransaction();
    res.status(201).json({ 
      message: 'Réservation effectuée avec succès',
      reservation,
      availableSpots: updatedVoyage.availableSpots
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

// Routes pour les agences
app.get('/api/agencies', async (req, res) => {
  try {
    const { city, email } = req.query;
    console.log('Recherche des agences pour la ville:', city, 'et email:', email);
    
    let query = {};
    if (city) {
      // Gérer les différentes orthographes de Marrakech
      let cityNames = [city];
      if (city.toLowerCase().includes('marackech') || 
          city.toLowerCase().includes('marakech') || 
          city.toLowerCase().includes('marrakesh')) {
        cityNames = ['Marrakech', 'Marackech', 'Marakech', 'Marrakesh'];
      }
      
      // Recherche avec les différentes orthographes possibles
      query = {
        $or: [
          { city: { $in: cityNames.map(name => new RegExp('^' + name + '$', 'i')) } },
          { city: "Toutes les villes du Maroc" }
        ]
      };
    }
    if (email) {
      query.email = email;
    }
    
    console.log('Query MongoDB:', JSON.stringify(query, null, 2));
    const agencies = await Agency.find(query);
    console.log('Nombre d\'agences trouvées:', agencies.length);
    
    // Assurez-vous que chaque agence a une image et construisez l'URL complète
    const agenciesWithImages = agencies.map(agency => {
      const agencyObj = agency.toObject();
      if (!agencyObj.image || agencyObj.image.trim() === '') {
        agencyObj.image = "https://images.pexels.com/photos/1537008/pexels-photo-1537008.jpeg";
      } else if (agencyObj.image.startsWith('/uploads/')) {
        // Construire l'URL complète pour les images uploadées
        agencyObj.image = `http://localhost:${PORT}${agencyObj.image}`;
      }
      return agencyObj;
    });
    
    res.json(agenciesWithImages);
  } catch (error) {
    console.error('Erreur lors de la récupération des agences:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/agencies', async (req, res) => {
  try {
    console.log('1. Données reçues pour l\'ajout d\'une agence:', req.body);
    const { name, address, city, phone, email, description, image, stars } = req.body;

    // Vérification des champs requis
    if (!name || !address || !city || !phone || !email || !description || !image || !stars) {
      console.log('2. Champs manquants:', {
        name: !name,
        address: !address,
        city: !city,
        phone: !phone,
        email: !email,
        description: !description,
        image: !image,
        stars: !stars
      });
      return res.status(400).json({ 
        message: "Tous les champs sont requis",
        missingFields: Object.entries({ name, address, city, phone, email, description, image, stars })
          .filter(([_, value]) => !value)
          .map(([key]) => key)
      });
    }

    // Normaliser le nom de la ville (première lettre en majuscule, reste en minuscule)
    const normalizedCity = city.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    // Vérifier si l'email existe déjà
    console.log('3. Vérification de l\'email:', email);
    const existingAgency = await Agency.findOne({ email });
    if (existingAgency) {
      console.log('4. Email déjà existant:', existingAgency);
      return res.status(400).json({ 
        message: "Une agence avec cet email existe déjà",
        field: "email"
      });
    }

    // Validation de l'URL de l'image
    if (!image || image.trim().length === 0) {
      console.log('5. URL de l\'image invalide');
      return res.status(400).json({ message: "L'URL de l'image est requise" });
    }

    // Validation et conversion des étoiles
    const starsNumber = parseFloat(stars);
    console.log('6. Conversion des étoiles:', { original: stars, converted: starsNumber });
    if (isNaN(starsNumber) || starsNumber < 0 || starsNumber > 5 || (starsNumber * 2) % 1 !== 0) {
      return res.status(400).json({ message: "Le nombre d'étoiles doit être un nombre entier ou un demi-nombre entre 0 et 5" });
    }

    // Création de l'objet agence avec tous les champs requis
    const agencyData = new Agency({
      name: name.trim(),
      address: address.trim(),
      city: normalizedCity,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      description: description.trim(),
      image: image.trim(),
      stars: starsNumber,
      createdAt: new Date()
    });

    console.log('7. Données de l\'agence avant sauvegarde:', agencyData);

    // Sauvegarde de l'agence
    const savedAgency = await agencyData.save();
    console.log('8. Agence sauvegardée avec succès:', savedAgency);

    res.status(201).json({ 
      message: 'Agence ajoutée avec succès', 
      agency: savedAgency 
    });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'ajout de l\'agence:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors,
      stack: error.stack
    });
    
    // Gestion des différents types d'erreurs
    if (error.code === 11000) {
      // Erreur de doublon (email déjà utilisé)
      return res.status(400).json({ 
        message: "Une agence avec cet email existe déjà",
        field: "email"
      });
    } else if (error.name === 'ValidationError') {
      // Erreur de validation du schéma
      return res.status(400).json({ 
        message: "Erreur de validation",
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    // Autres types d'erreurs
    res.status(500).json({ 
      message: 'Erreur lors de l\'ajout de l\'agence',
      details: error.message
    });
  }
});

app.delete('/api/agencies/:id', async (req, res) => {
  try {
    const agency = await Agency.findByIdAndDelete(req.params.id);
    if (!agency) {
      return res.status(404).json({ message: "Agence non trouvée" });
    }
    res.json({ message: "Agence supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour mettre à jour une agence
app.put('/api/agencies/:id', async (req, res) => {
  try {
    const { image, stars } = req.body;
    
    // Validation de l'URL de l'image
    if (!image || image.trim().length === 0) {
      return res.status(400).json({ message: "L'URL de l'image est requise" });
    }

    // Validation et conversion des étoiles
    const starsNumber = parseFloat(stars);
    if (isNaN(starsNumber) || starsNumber < 0 || starsNumber > 5 || (starsNumber * 2) % 1 !== 0) {
      return res.status(400).json({ message: "Le nombre d'étoiles doit être un nombre entier ou un demi-nombre entre 0 et 5" });
    }

    const updatedAgency = await Agency.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          image: image.trim(),
          stars: starsNumber
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedAgency) {
      return res.status(404).json({ message: "Agence non trouvée" });
    }

    res.json({ 
      message: "Agence mise à jour avec succès",
      agency: updatedAgency
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'agence:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: error.message,
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'agence' });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
