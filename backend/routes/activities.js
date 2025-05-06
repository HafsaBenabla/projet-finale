import express from 'express';
import { Activity } from '../models/Activity.js';
import { Voyage } from '../models/voyage.js';
import { Agency } from '../models/agency.js';

const router = express.Router();

// Récupérer toutes les activités
router.get('/', async (req, res) => {
  try {
    const { type, category, city } = req.query;
    const filter = {};

    // Appliquer les filtres si spécifiés
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (city) filter.city = city;

    const activities = await Activity.find(filter)
      .populate('voyageId', 'title destination')
      .populate('agencyId', 'name type description city stars image')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les activités d'une agence spécifique
router.get('/by-agency/:agencyId', async (req, res) => {
  try {
    const { agencyId } = req.params;
    console.log('Route /by-agency/:agencyId appelée avec ID:', agencyId);
    
    // Vérifier que l'agence existe
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      console.log('Agence non trouvée avec ID:', agencyId);
      return res.status(404).json({ message: "Agence non trouvée" });
    }
    console.log('Agence trouvée:', agency.name);

    // Récupérer toutes les activités de l'agence
    const activities = await Activity.find({ agencyId })
      .populate('voyageId', 'title destination')
      .populate('agencyId', 'name type description city stars image')
      .sort({ createdAt: -1 });

    console.log(`${activities.length} activités trouvées pour l'agence ${agency.name}`);
    res.json(activities);
  } catch (error) {
    console.error('Erreur lors de la récupération des activités de l\'agence:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer une activité par son ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Route /:id appelée avec ID:', req.params.id);
    const activity = await Activity.findById(req.params.id)
      .populate('voyageId', 'title destination')
      .populate('agencyId', 'name type description city stars image');
    
    if (!activity) {
      console.log('Activité non trouvée avec ID:', req.params.id);
      return res.status(404).json({ message: "Activité non trouvée" });
    }
    
    console.log('Activité trouvée:', activity.name);
    res.json(activity);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    res.status(500).json({ error: error.message });
  }
});

// Créer une nouvelle activité
router.post('/', async (req, res) => {
  try {
    console.log('Données reçues pour la création d\'activité:', req.body);
    
    const activityData = { ...req.body };
    
    // Vérifier que l'agence existe
    const agency = await Agency.findById(activityData.agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agence non trouvée' });
    }
    activityData.agencyName = agency.name;

    // Si c'est une activité de type voyage, vérifier que le voyage existe
    let voyage = null;
    if (activityData.type === 'voyage' && activityData.voyageId) {
      console.log('Vérification du voyage:', activityData.voyageId);
      voyage = await Voyage.findById(activityData.voyageId);
      if (!voyage) {
        return res.status(404).json({ error: 'Voyage non trouvé' });
      }
      console.log('Voyage trouvé:', voyage.title);
    }

    const activity = new Activity(activityData);
    const savedActivity = await activity.save();
    console.log('Activité sauvegardée:', savedActivity._id);

    // Si c'est une activité de voyage, l'ajouter au voyage correspondant
    if (savedActivity.type === 'voyage' && voyage) {
      console.log('Ajout de l\'activité au voyage:', voyage._id);
      
      if (!voyage.activities.includes(savedActivity._id)) {
        voyage.activities.push(savedActivity._id);
        await voyage.save();
        console.log('Voyage mis à jour avec succès');
      } else {
        console.log('L\'activité est déjà associée à ce voyage');
      }
    }

    res.status(201).json(savedActivity);
  } catch (error) {
    console.error('Erreur lors de la création de l\'activité:', error);
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour une activité existante
router.put('/:id', async (req, res) => {
  try {
    const activityData = { ...req.body };
    
    // Si l'agence a changé, vérifier la nouvelle agence
    if (activityData.agencyId) {
      const agency = await Agency.findById(activityData.agencyId);
      if (!agency) {
        return res.status(404).json({ error: 'Nouvelle agence non trouvée' });
      }
      activityData.agencyName = agency.name;
    }
    
    // Si le type ou le voyageId a changé, mettre à jour les références
    const oldActivity = await Activity.findById(req.params.id);
    if (!oldActivity) {
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    
    // Si l'activité change de voyage, mettre à jour les références
    if (activityData.voyageId && oldActivity.voyageId && 
        activityData.voyageId.toString() !== oldActivity.voyageId.toString()) {
      
      // Supprimer l'activité de l'ancien voyage
      await Voyage.findByIdAndUpdate(
        oldActivity.voyageId,
        { $pull: { activities: oldActivity._id } }
      );
      
      // Ajouter l'activité au nouveau voyage
      await Voyage.findByIdAndUpdate(
        activityData.voyageId,
        { $addToSet: { activities: oldActivity._id } }
      );
    }
    
    // Mettre à jour l'activité
    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id,
      activityData,
      { new: true, runValidators: true }
    ).populate('agencyId', 'name');
    
    if (!updatedActivity) {
      return res.status(404).json({ message: "Activité non trouvée" });
    }
    
    res.json(updatedActivity);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error);
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une activité
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ message: "Activité non trouvée" });
    }
    
    // Si l'activité est liée à un voyage, la retirer du voyage
    if (activity.voyageId) {
      await Voyage.findByIdAndUpdate(
        activity.voyageId,
        { $pull: { activities: activity._id } }
      );
    }
    
    // Supprimer l'activité
    await Activity.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Activité supprimée avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'activité:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 