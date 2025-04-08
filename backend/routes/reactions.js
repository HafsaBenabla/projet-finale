import express from 'express';
import { Voyage } from '../models/voyage.js';
import { verifyToken } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Route pour obtenir les réactions d'un voyage
router.get('/voyage/:voyageId', async (req, res) => {
  try {
    const { voyageId } = req.params;
    
    // Trouver le voyage
    const voyage = await Voyage.findById(voyageId);
    
    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }
    
    // Envoyer les statistiques des réactions
    const reactions = voyage.reactions || { likes: 0, dislikes: 0, userReactions: [] };
    res.json({
      likes: reactions.likes || 0,
      dislikes: reactions.dislikes || 0
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour obtenir la réaction d'un utilisateur pour un voyage
router.get('/user/:voyageId', verifyToken, async (req, res) => {
  try {
    const { voyageId } = req.params;
    const userId = req.user.userId;
    
    console.log('Récupération de réaction utilisateur:', {
      voyageId,
      userId
    });
    
    // Trouver le voyage
    const voyage = await Voyage.findById(voyageId);
    
    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }
    
    // Trouver la réaction de l'utilisateur
    let userReaction = null;
    if (voyage.reactions && voyage.reactions.userReactions) {
      userReaction = voyage.reactions.userReactions.find(
        reaction => reaction.userId === userId
      );
      
      console.log('Réaction trouvée:', userReaction || 'Aucune');
    }
    
    res.json(userReaction || { type: null });
  } catch (error) {
    console.error('Erreur lors de la récupération de la réaction utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour ajouter/modifier/supprimer une réaction
router.post('/', verifyToken, async (req, res) => {
  try {
    const { voyageId, type } = req.body;
    const userId = req.user.userId;
    
    console.log('Traitement de réaction:', {
      voyageId,
      type,
      userId
    });
    
    // Validation des entrées
    if (!voyageId || !type || !['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Données de réaction invalides' });
    }
    
    // Vérifier que voyageId est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(voyageId)) {
      return res.status(400).json({ message: 'ID de voyage invalide' });
    }
    
    // Trouver le voyage
    const voyage = await Voyage.findById(voyageId);
    
    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }
    
    // Initialiser l'objet reactions s'il n'existe pas
    if (!voyage.reactions) {
      voyage.reactions = {
        likes: 0,
        dislikes: 0,
        userReactions: []
      };
    }
    
    // Vérifier si l'utilisateur a déjà réagi
    const existingReactionIndex = voyage.reactions.userReactions.findIndex(
      reaction => reaction.userId === userId
    );
    
    console.log('Réaction existante:', existingReactionIndex !== -1);
    
    // Si l'utilisateur a déjà réagi avec le même type, supprimer la réaction (toggle)
    if (existingReactionIndex !== -1) {
      const existingReaction = voyage.reactions.userReactions[existingReactionIndex];
      
      if (existingReaction.type === type) {
        // Supprimer la réaction (un clic sur le même bouton = annulation)
        voyage.reactions[type + 's'] = Math.max(0, voyage.reactions[type + 's'] - 1);
        voyage.reactions.userReactions.splice(existingReactionIndex, 1);
        console.log(`Réaction ${type} supprimée pour l'utilisateur ${userId}`);
      } else {
        // Changer de type de réaction (like -> dislike ou dislike -> like)
        voyage.reactions[existingReaction.type + 's'] = Math.max(0, voyage.reactions[existingReaction.type + 's'] - 1);
        voyage.reactions[type + 's']++;
        existingReaction.type = type;
        console.log(`Réaction changée pour l'utilisateur ${userId}: ${existingReaction.type} -> ${type}`);
      }
    } else {
      // Ajouter une nouvelle réaction
      voyage.reactions[type + 's']++;
      voyage.reactions.userReactions.push({ userId, type });
      console.log(`Nouvelle réaction ${type} ajoutée pour l'utilisateur ${userId}`);
    }
    
    // Sauvegarder les changements
    await voyage.save();
    
    // Renvoyer les nouvelles statistiques
    res.json({
      message: 'Réaction enregistrée avec succès',
      likes: voyage.reactions.likes,
      dislikes: voyage.reactions.dislikes,
      userReaction: { type }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 