import express from 'express';
import Comment from '../models/comment.js';
<<<<<<< HEAD
import { authenticateToken } from '../middleware/auth.js';
=======
import { auth } from '../middleware/auth.js';
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)

const router = express.Router();

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
<<<<<<< HEAD
router.post('/voyages/:voyageId/comments', authenticateToken, async (req, res) => {
  try {
    const { content, userId } = req.body;
    
    if (!content || !userId) {
      return res.status(400).json({ message: 'Contenu et ID utilisateur requis' });
=======
router.post('/voyages/:voyageId/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.userId;
    
    if (!content) {
      return res.status(400).json({ message: 'Contenu requis' });
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    }

    const comment = new Comment({
      content,
      voyageId: req.params.voyageId,
      userId,
      userName: req.user.name || 'Utilisateur'
    });

    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 