import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Activity } from './models/activity.js';
import { Voyage } from './models/voyage.js';
import { Agency } from './models/agency.js';
import { Reservation } from './models/reservation.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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

// Routes pour les activités
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/activities', async (req, res) => {
  console.log('Received activity data:', req.body);
  const activity = new Activity(req.body);
  try {
    console.log('Attempting to save activity:', activity);
    const newActivity = await activity.save();
    console.log('Activity saved successfully:', newActivity);
    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée" });
    }
    res.json({ message: "Activité supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes pour les voyages
app.get('/api/voyages', async (req, res) => {
  try {
    const voyages = await Voyage.find();
    res.json(voyages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/voyages/:id', async (req, res) => {
  try {
    const voyage = await Voyage.findById(req.params.id);
    if (!voyage) {
      return res.status(404).json({ message: "Voyage non trouvé" });
    }
    res.json(voyage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/voyages', async (req, res) => {
  try {
    const voyage = new Voyage(req.body);
    const newVoyage = await voyage.save();
    res.status(201).json(newVoyage);
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
      // Inclure les agences de la ville spécifique ET celles qui opèrent dans toutes les villes
      query = {
        $or: [
          { city: city },
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
    console.log('Données des agences avant envoi:', agencies.map(agency => ({
      id: agency._id,
      name: agency.name,
      city: agency.city,
      email: agency.email
    })));
    
    // Assurez-vous que chaque agence a une image
    const agenciesWithDefaultImage = agencies.map(agency => {
      const agencyObj = agency.toObject();
      if (!agencyObj.image || agencyObj.image.trim() === '') {
        agencyObj.image = "https://images.pexels.com/photos/1537008/pexels-photo-1537008.jpeg";
      }
      return agencyObj;
    });
    
    res.json(agenciesWithDefaultImage);
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
      city: city.trim(),
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
