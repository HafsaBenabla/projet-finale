import express from 'express';
import { Comment } from '../models/comment.js';
import { auth } from '../middleware/auth.js';
import { Voyage } from '../models/voyage.js';
import mongoose from 'mongoose';

const router = express.Router();

// Fonction pour synchroniser le compteur de commentaires
export const syncCommentCount = async () => {
  try {
    console.log('Synchronisation des compteurs de commentaires...');
    
    // Récupérer tous les voyages
    const voyages = await Voyage.find();
    
    // Pour chaque voyage, compter les commentaires et mettre à jour le compteur
    for (const voyage of voyages) {
      const commentCount = await Comment.countDocuments({ voyageId: voyage._id });
      
      // Ne mettre à jour que si le compteur est différent
      if (voyage.commentCount !== commentCount) {
        await Voyage.updateOne(
          { _id: voyage._id },
          { $set: { commentCount: commentCount } }
        );
        console.log(`Compteur de commentaires mis à jour pour le voyage ${voyage._id}: ${commentCount} commentaires`);
      }
    }
    
    console.log('Synchronisation des compteurs de commentaires terminée');
  } catch (error) {
    console.error('Erreur lors de la synchronisation des compteurs de commentaires:', error);
  }
};

// Récupérer tous les commentaires d'un voyage
router.get('/voyages/:voyageId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ voyageId: req.params.voyageId })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un commentaire
router.post('/voyages/:voyageId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;
    
    if (!content) {
      return res.status(400).json({ message: 'Contenu requis' });
    }

    // Créer le commentaire
    const comment = new Comment({
      content,
      voyageId: req.params.voyageId,
      userId,
      userName: req.user.name || 'Utilisateur'
    });

    // Sauvegarder le commentaire
    const newComment = await comment.save();
    
    // Incrémenter le compteur de commentaires dans le voyage
    await Voyage.findByIdAndUpdate(
      req.params.voyageId,
      { $inc: { commentCount: 1 } },
      { new: true }
    );

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Supprimer un commentaire
router.delete('/comments/:commentId', auth, async (req, res) => {
  try {
    console.log(`Requête de suppression de commentaire reçue - commentId: ${req.params.commentId}`);
    
    // Vérifier que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
      console.log('ID de commentaire invalide');
      return res.status(400).json({ message: 'ID de commentaire invalide' });
    }
    
    // Vérifier que l'utilisateur est autorisé à supprimer ce commentaire
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      console.log('Commentaire non trouvé');
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }
    
    // Récupérer l'ID utilisateur du token
    const currentUser = req.user;
    
    if (!currentUser) {
      console.log('Utilisateur non authentifié dans auth middleware');
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    
    // Récupérer tous les formats possibles d'ID utilisateur actuel
    const currentUserIds = [
      currentUser._id,
      currentUser._id?.toString(),
      currentUser.id,
      currentUser.id?.toString(),
      currentUser.userId,
      currentUser.userId?.toString()
    ].filter(Boolean); // Filtrer les valeurs null/undefined
    
    // Récupérer tous les formats possibles d'ID utilisateur du commentaire
    const commentUserIds = [
      comment.userId,
      typeof comment.userId === 'object' ? comment.userId.toString() : comment.userId
    ].filter(Boolean);
    
    console.log('Comparaison des IDs utilisateur:', {
      commentUserIds,
      currentUserIds,
      currentUser: JSON.stringify(currentUser)
    });
    
    // Vérifier s'il y a une correspondance d'ID
    let isAuthorized = false;
    
    // Vérifier chaque combinaison possible d'ID
    for (const commentUserId of commentUserIds) {
      for (const currentUserId of currentUserIds) {
        if (commentUserId === currentUserId) {
          isAuthorized = true;
          break;
        }
      }
      if (isAuthorized) break;
    }
    
    // Autoriser également si l'utilisateur est admin
    if (currentUser.role === 'admin') {
      console.log('Utilisateur admin autorisé à supprimer n\'importe quel commentaire');
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      console.log('Utilisateur non autorisé à supprimer ce commentaire');
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer le commentaire d\'un autre utilisateur' });
    }
    
    // Supprimer le commentaire
    await Comment.findByIdAndDelete(req.params.commentId);
    console.log(`Commentaire ${req.params.commentId} supprimé avec succès`);
    
    // Décrémenter le compteur de commentaires dans le voyage
    await Voyage.findByIdAndUpdate(
      comment.voyageId,
      { $inc: { commentCount: -1 } },
      { new: true }
    );
    
    console.log(`Compteur de commentaires mis à jour après suppression pour le voyage ${comment.voyageId}`);
    
    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 