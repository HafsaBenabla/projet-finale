import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Activity } from './models/activity.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://admin:admin@cluster0.bedq1.mongodb.net/maghrebxplore?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.get('/activities', async (req, res) => {
  try {
    const activities = await Activity.find();
    console.log('Retrieved activities:', activities);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/ajouter', async (req, res) => {
  const activity = new Activity(req.body);
  try {
    const newActivity = await activity.save();
    console.log('Created new activity:', newActivity);
    res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400).json({ message: error.message });
  }
});

// Nouvelle route pour supprimer une activité
app.delete('/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée" });
    }
    console.log('Deleted activity:', activity);
    res.json({ message: "Activité supprimée avec succès" });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
