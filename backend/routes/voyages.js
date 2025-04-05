import express from 'express';
import { Voyage } from '../models/voyage.js';
import { auth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Route pour obtenir tous les voyages
router.get('/', async (req, res) => {
    try {
        const voyages = await Voyage.find().populate('activities');
        res.json(voyages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour créer un nouveau voyage
router.post('/', auth, async (req, res) => {
    const voyage = new Voyage(req.body);
    try {
        const newVoyage = await voyage.save();
        res.status(201).json(newVoyage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route pour réagir à un voyage (like/dislike)
router.post('/:id/reaction', async (req, res) => {
    try {
        const { type } = req.body; // 'like' ou 'dislike'
        
        // Récupérer l'userId soit du token, soit des headers
        let userId;
        if (req.user) {
            // Si l'utilisateur est authentifié (middleware auth)
            userId = req.user._id.toString();
        } else if (req.headers['user-id']) {
            // Sinon, utiliser l'ID fourni dans les headers
            userId = req.headers['user-id'];
        } else {
            return res.status(400).json({ message: 'ID utilisateur requis' });
        }
        
        console.log(`Réaction reçue: voyage=${req.params.id}, userId=${userId}, type=${type}`);
        
        const voyage = await Voyage.findById(req.params.id);

        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }

        // S'assurer que les réactions existent
        if (!voyage.reactions) {
            voyage.reactions = {
                likes: 0,
                dislikes: 0,
                userReactions: []
            };
        }

        console.log(`État initial des réactions: likes=${voyage.reactions.likes}, dislikes=${voyage.reactions.dislikes}`);

        // Vérifier si l'utilisateur a déjà réagi
        const existingReaction = voyage.reactions.userReactions.find(
            reaction => reaction.userId === userId
        );

        // Si l'utilisateur a déjà réagi avec le même type, supprimer la réaction (toggle off)
        if (existingReaction && existingReaction.type === type) {
            // Décrémenter le compteur
            voyage.reactions[type + 's'] = Math.max(0, voyage.reactions[type + 's'] - 1);
            
            // Supprimer la réaction de l'utilisateur
            voyage.reactions.userReactions = voyage.reactions.userReactions.filter(
                reaction => reaction.userId !== userId
            );
            
            // Réponse après suppression
            await voyage.save();
            console.log(`Réaction supprimée: ${type}, likes=${voyage.reactions.likes}, dislikes=${voyage.reactions.dislikes}`);
            
            return res.json({
                likes: voyage.reactions.likes,
                dislikes: voyage.reactions.dislikes,
                reaction: null,
                message: 'Réaction supprimée avec succès'
            });
        }
        
        // Si l'utilisateur a déjà réagi avec un type différent, modifier sa réaction
        if (existingReaction) {
            // Décrémenter l'ancien compteur
            voyage.reactions[existingReaction.type + 's'] = Math.max(0, voyage.reactions[existingReaction.type + 's'] - 1);
            
            // Incrémenter le nouveau compteur
            voyage.reactions[type + 's']++;
            
            // Mettre à jour le type de réaction
            existingReaction.type = type;
        } else {
            // Ajouter une nouvelle réaction
            voyage.reactions[type + 's']++;
            voyage.reactions.userReactions.push({ userId, type });
        }

        await voyage.save();
        
        console.log(`État final des réactions: likes=${voyage.reactions.likes}, dislikes=${voyage.reactions.dislikes}`);
        
        // Formater la réponse pour le client
        res.json({
            likes: voyage.reactions.likes,
            dislikes: voyage.reactions.dislikes,
            reaction: type,
            message: 'Réaction mise à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des réactions:', error);
        res.status(400).json({ message: error.message });
    }
});

// Route pour obtenir les réactions d'un voyage
router.get('/:id/reaction', async (req, res) => {
    try {
        // Récupérer l'userId soit du token, soit des headers
        let userId;
        if (req.user) {
            // Si l'utilisateur est authentifié (middleware auth)
            userId = req.user._id.toString();
        } else if (req.headers['user-id']) {
            // Sinon, utiliser l'ID fourni dans les headers
            userId = req.headers['user-id'];
        } else {
            return res.status(400).json({ message: 'ID utilisateur requis' });
        }
        
        console.log(`Récupération des réactions: voyage=${req.params.id}, userId=${userId}`);
        
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }

        // S'assurer que les réactions existent
        const reactions = voyage.reactions || { likes: 0, dislikes: 0, userReactions: [] };
        
        // Trouver la réaction de l'utilisateur
        const userReaction = reactions.userReactions?.find(
            reaction => reaction.userId === userId
        );

        console.log(`Réactions récupérées: likes=${reactions.likes}, dislikes=${reactions.dislikes}, userReaction=${userReaction?.type || 'null'}`);
        
        res.json({ 
            likes: reactions.likes,
            dislikes: reactions.dislikes,
            reaction: userReaction ? userReaction.type : null 
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des réactions:', error);
        res.status(400).json({ message: error.message });
    }
});

// Route pour obtenir les voyages par agence
router.get('/by-agency/:agencyId', async (req, res) => {
    try {
        const { agencyId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(agencyId)) {
            return res.status(400).json({ message: 'ID d\'agence invalide' });
        }

        const voyages = await Voyage.find({ agencyId }).populate('activities');
        
        if (!voyages || voyages.length === 0) {
            return res.status(404).json({ message: 'Aucun voyage trouvé pour cette agence' });
        }
        
        res.json(voyages);
    } catch (error) {
        console.error('Erreur lors de la récupération des voyages par agence:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;