import express from 'express';
import { User } from '../models/user.js';
import { Comment } from '../models/comment.js';
import { adminAuth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware pour vérifier que l'utilisateur est admin
router.use(adminAuth);

// Route pour synchroniser les noms d'utilisateur dans les commentaires
router.post('/sync-usernames', async (req, res) => {
    try {
        console.log('Début de la synchronisation des noms d\'utilisateur dans les commentaires...');
        
        // Récupérer tous les utilisateurs
        const users = await User.find().select('_id username email');
        console.log(`${users.length} utilisateurs trouvés`);
        
        // Créer un map des utilisateurs pour un accès rapide
        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user.username;
        });
        
        // Récupérer tous les commentaires
        const comments = await Comment.find();
        console.log(`${comments.length} commentaires trouvés`);
        
        let updatedCount = 0;
        let errorCount = 0;
        
        // Mettre à jour les commentaires
        for (const comment of comments) {
            try {
                // Récupérer l'ID utilisateur du commentaire
                const userId = comment.userId?.toString();
                
                // Si l'ID utilisateur existe et qu'on a un nom d'utilisateur pour cet ID
                if (userId && userMap[userId]) {
                    // Si le nom d'utilisateur actuel est différent du nouveau
                    if (comment.userName !== userMap[userId]) {
                        // Mettre à jour le nom d'utilisateur
                        comment.userName = userMap[userId];
                        await comment.save();
                        updatedCount++;
                        console.log(`Commentaire ${comment._id} mis à jour: ${comment.userName}`);
                    }
                } else {
                    console.log(`Impossible de trouver un utilisateur pour le commentaire ${comment._id} (userId: ${userId})`);
                }
            } catch (error) {
                console.error(`Erreur lors de la mise à jour du commentaire ${comment._id}:`, error);
                errorCount++;
            }
        }
        
        res.json({
            message: 'Synchronisation des noms d\'utilisateur terminée',
            stats: {
                totalUsers: users.length,
                totalComments: comments.length,
                updatedComments: updatedCount,
                errorCount: errorCount
            }
        });
    } catch (error) {
        console.error('Erreur lors de la synchronisation des noms d\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur lors de la synchronisation des noms d\'utilisateur', error: error.message });
    }
});

export default router; 