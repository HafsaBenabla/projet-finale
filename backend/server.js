import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Activity } from './models/activity.js';
import { Voyage } from './models/voyage.js';
import { Agency } from './models/agency.js';

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

app.post('/api/voyages', async (req, res) => {
  const voyage = new Voyage(req.body);
  try {
    const newVoyage = await voyage.save();
    res.status(201).json(newVoyage);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// Routes pour les agences
app.get('/api/agencies', async (req, res) => {
  try {
    const agencies = await Agency.find();
    res.json(agencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/agencies', async (req, res) => {
  console.log('Requête reçue pour ajouter une agence:', req.body);
  const agency = new Agency(req.body);
  try {
    console.log('Tentative de sauvegarde de l\'agence:', agency);
    const newAgency = await agency.save();
    console.log('Agence sauvegardée avec succès:', newAgency);
    res.status(201).json(newAgency);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'agence:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
