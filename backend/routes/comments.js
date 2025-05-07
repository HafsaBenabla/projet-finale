import express from 'express';
import { Comment } from '../models/comment.js';
import { auth } from '../middleware/auth.js';
import { Voyage } from '../models/voyage.js';
import mongoose from 'mongoose';

const router = express.Router();

// Fonction pour synchroniser le compteur de commentaires
const syncCommentCount = async (voyageId) => {
  try {
    console.log('Synchronisation du compteur de commentaires pour le voyage:', voyageId);
    
    // Compter les commentaires pour ce voyage
    const commentCount = await Comment.countDocuments({ voyageId });
    
    // Mettre à jour le compteur dans le voyage
    await Voyage.findByIdAndUpdate(
      voyageId,
      { $set: { commentCount: commentCount } }
    );
    
    console.log(`Compteur de commentaires mis à jour: ${commentCount} commentaires`);
    return commentCount;
  } catch (error) {
    console.error('Erreur lors de la synchronisation du compteur:', error);
    throw error;
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
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commentaire non trouvé' });
    }

    // Vérifier l'autorisation
    const currentUser = req.user;
    let isAuthorized = false;

    // Convertir les IDs en chaînes pour la comparaison
    const commentUserIds = [comment.userId].map(String);
    const currentUserIds = [currentUser.userId, currentUser._id].map(String);

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

    // Sauvegarder le voyageId avant de supprimer le commentaire
    const voyageId = comment.voyageId;

    // Supprimer le commentaire
    await Comment.findByIdAndDelete(req.params.commentId);
    console.log(`Commentaire ${req.params.commentId} supprimé avec succès`);

    // Synchroniser le compteur de commentaires
    const newCommentCount = await syncCommentCount(voyageId);
    console.log(`Nouveau compteur de commentaires après synchronisation: ${newCommentCount}`);

    res.json({ 
      message: 'Commentaire supprimé avec succès',
      commentCount: newCommentCount
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les commentaires d'un utilisateur spécifique
router.get('/user/:userId/comments', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier que l'utilisateur demande ses propres commentaires ou est admin
    const currentUser = req.user;
    
    // Récupérer tous les formats possibles d'ID utilisateur actuel et requis
    const currentUserIds = [
      currentUser._id,
      currentUser._id?.toString(),
      currentUser.id,
      currentUser.id?.toString(),
      currentUser.userId,
      currentUser.userId?.toString()
    ].filter(Boolean);
    
    const requestedUserIds = [
      userId,
      userId.toString()
    ].filter(Boolean);
    
    // Vérifier si l'utilisateur demande ses propres commentaires
    let isAuthorized = false;
    
    // Vérifier chaque combinaison possible d'ID
    for (const currentId of currentUserIds) {
      for (const requestedId of requestedUserIds) {
        if (currentId === requestedId) {
          isAuthorized = true;
          break;
        }
      }
      if (isAuthorized) break;
    }
    
    // Autoriser également si l'utilisateur est admin
    if (currentUser.role === 'admin') {
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ message: 'Vous ne pouvez pas accéder aux commentaires d\'un autre utilisateur' });
    }
    
    // Récupérer tous les commentaires de l'utilisateur
    const comments = await Comment.find({ userId: { $in: requestedUserIds } })
      .sort({ createdAt: -1 });

    // Si aucun commentaire n'est trouvé, renvoyer un tableau vide avec un message explicatif
    if (!comments || comments.length === 0) {
      return res.json({
        data: [],
        message: "Vous n'avez pas encore publié de commentaires. Vos commentaires apparaîtront ici après avoir partagé votre expérience sur un voyage."
      });
    }
    
    // Joindre les informations des voyages aux commentaires
    const populatedComments = await Promise.all(comments.map(async (comment) => {
      try {
        const voyage = await Voyage.findById(comment.voyageId);
        return {
          ...comment.toObject(),
          voyage: voyage ? {
            _id: voyage._id,
            title: voyage.title,
            destination: voyage.destination,
            image: voyage.image
          } : null
        };
      } catch (error) {
        console.error(`Erreur lors de la récupération du voyage ${comment.voyageId}:`, error);
        return comment.toObject();
      }
    }));
    
    res.json({
      data: populatedComments,
      message: null
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route pour récupérer tous les commentaires (admin seulement)
router.get('/', auth, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const currentUser = req.user;
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé. Réservé aux administrateurs.' });
    }

    // Récupérer tous les commentaires
    const comments = await Comment.find().sort({ createdAt: -1 });

    // Regrouper les commentaires par voyage
    const commentsByVoyage = {};
    
    // Récupérer tous les voyages concernés
    const voyageIds = [...new Set(comments.map(comment => comment.voyageId))];
    const voyages = await Voyage.find({ _id: { $in: voyageIds } });
    const voyagesMap = new Map(voyages.map(v => [v._id.toString(), v]));

    // Organiser les commentaires par voyage
    for (const comment of comments) {
      const voyageId = comment.voyageId.toString();
      const voyage = voyagesMap.get(voyageId);
      
      if (!commentsByVoyage[voyageId]) {
        commentsByVoyage[voyageId] = {
          voyage: voyage ? {
            _id: voyage._id,
            title: voyage.title,
            destination: voyage.destination,
            image: voyage.image
          } : { _id: voyageId, title: 'Voyage inconnu', destination: 'Inconnue' },
          comments: []
        };
      }
      
      commentsByVoyage[voyageId].comments.push(comment);
    }

    // Convertir l'objet en tableau pour le frontend
    const result = Object.values(commentsByVoyage);
    
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération de tous les commentaires:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router; 