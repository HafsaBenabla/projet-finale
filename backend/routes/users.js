import express from 'express';
import { User } from '../models/user.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Route pour mettre à jour le profil utilisateur
router.patch('/:id', auth, async (req, res) => {
  try {
    console.log('=== Tentative de mise à jour du profil utilisateur ===', {
      userId: req.params.id,
      authUserId: req.user.userId || req.user._id,
      requestBody: req.body
    });

    // Vérifier que l'utilisateur ne modifie que son propre profil
    const requestedUserId = req.params.id;
    const authUserId = req.user.userId || req.user._id.toString();
    
    console.log('Comparaison des IDs utilisateur:', {
      requestedUserId,
      authUserId,
      match: requestedUserId === authUserId
    });

    if (requestedUserId !== authUserId && req.user.role !== 'admin') {
      console.log('Tentative non autorisée de mise à jour de profil');
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce profil" });
    }

    // Vérifier que l'utilisateur existe
    const user = await User.findById(requestedUserId);
    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log('Utilisateur trouvé, préparation de la mise à jour');

    // Champs autorisés pour la mise à jour
    const allowedUpdates = ['phone', 'address', 'firstName', 'lastName'];
    const updates = {};

    // Ne mettre à jour que les champs fournis et autorisés
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = value;
      }
    }

    console.log('Champs à mettre à jour:', updates);

    // Si aucun champ valide à mettre à jour
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Aucun champ valide à mettre à jour" });
    }

    // Mettre à jour les champs spécifiés
    const updatedUser = await User.findByIdAndUpdate(
      requestedUserId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('Erreur lors de la mise à jour du profil');
      return res.status(400).json({ message: "Erreur lors de la mise à jour du profil" });
    }

    console.log('Profil mis à jour avec succès:', {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      // Nouveaux champs mis à jour
      phone: updatedUser.phone,
      address: updatedUser.address,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName
    });

    res.json({
      message: "Profil mis à jour avec succès",
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Route pour récupérer les informations du profil utilisateur
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('=== Tentative de récupération du profil utilisateur ===', {
      userId: req.params.id,
      authUserId: req.user.userId || req.user._id
    });

    // Vérifier que l'utilisateur ne consulte que son propre profil
    const requestedUserId = req.params.id;
    const authUserId = req.user.userId || req.user._id.toString();
    
    if (requestedUserId !== authUserId && req.user.role !== 'admin') {
      console.log('Tentative non autorisée de consultation de profil');
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à consulter ce profil" });
    }

    // Récupérer les informations de l'utilisateur (sans le mot de passe)
    const user = await User.findById(requestedUserId).select('-password');
    
    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log('Profil récupéré avec succès');
    
    res.json({
      user
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

export default router; 