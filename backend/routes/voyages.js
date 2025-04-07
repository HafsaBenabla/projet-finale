import express from 'express';
import { Voyage } from '../models/voyage.js';
import { auth } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware de débogage pour les routes de réaction
const debugReactionMiddleware = (req, res, next) => {
    console.log('====== DEBUG RÉACTION ======');
    console.log('Méthode:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Params:', req.params);
    console.log('User:', req.user);
    console.log('===========================');
    
    // Capture la méthode send originale
    const originalSend = res.send;
    
    // Remplace la méthode send pour intercepter les réponses
    res.send = function (body) {
        console.log('====== RÉPONSE RÉACTION ======');
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
        console.log('==============================');
        
        // Restaure la méthode send originale et l'appelle
        res.send = originalSend;
        return res.send(body);
    };
    
    next();
};

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
    console.log('==== DÉBUT CRÉATION VOYAGE ====');
    console.log('Données reçues complètes:', req.body);
    console.log('Champs hébergement reçus:', {
        hebergement: req.body.hebergement,
        hebergementImage: req.body.hebergementImage,
        typeHebergementImage: typeof req.body.hebergementImage,
        hebergementImageLength: req.body.hebergementImage?.length,
        hebergementImageStartsWithHttp: req.body.hebergementImage?.startsWith('http')
    });
    console.log('Champs dates reçus:', {
        departureDate: req.body.departureDate,
        returnDate: req.body.returnDate,
        departureDateType: typeof req.body.departureDate,
        returnDateType: typeof req.body.returnDate
    });
    
    // Vérifier et convertir les dates si nécessaire
    if (req.body.departureDate) {
        try {
            // Vérifier si la date est valide
            const date = new Date(req.body.departureDate);
            if (isNaN(date.getTime())) {
                console.error('Format de date de départ invalide:', req.body.departureDate);
            } else {
                console.log('Date de départ valide:', date);
            }
        } catch (error) {
            console.error('Erreur lors du traitement de la date de départ:', error);
        }
    }
    
    if (req.body.returnDate) {
        try {
            // Vérifier si la date est valide
            const date = new Date(req.body.returnDate);
            if (isNaN(date.getTime())) {
                console.error('Format de date de retour invalide:', req.body.returnDate);
            } else {
                console.log('Date de retour valide:', date);
            }
        } catch (error) {
            console.error('Erreur lors du traitement de la date de retour:', error);
        }
    }
    
    const voyage = new Voyage(req.body);
    try {
        console.log('Objet Voyage avant sauvegarde:', {
            hebergement: voyage.hebergement,
            hebergementImage: voyage.hebergementImage,
            departureDate: voyage.departureDate,
            returnDate: voyage.returnDate
        });
        
        const newVoyage = await voyage.save();
        console.log('Voyage créé avec succès:', {
            id: newVoyage._id,
            hebergement: newVoyage.hebergement,
            hebergementImage: newVoyage.hebergementImage,
            departureDate: newVoyage.departureDate,
            returnDate: newVoyage.returnDate
        });
        console.log('==== FIN CRÉATION VOYAGE ====');
        res.status(201).json(newVoyage);
    } catch (error) {
        console.error('Erreur lors de la création du voyage:', error);
        res.status(400).json({ message: error.message });
    }
});

// Route pour réagir à un voyage (like/dislike)
router.post('/:id/reaction', debugReactionMiddleware, async (req, res) => {
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
router.get('/:id/reaction', debugReactionMiddleware, async (req, res) => {
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
        const userReaction = reactions.userReactions?.find(reaction => reaction.userId === userId);

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

// Route pour obtenir un voyage par son ID
router.get('/:id', async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id).populate('activities');
        
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        
        res.json(voyage);
    } catch (error) {
        console.error('Erreur lors de la récupération du voyage:', error);
        res.status(500).json({ message: error.message });
    }
});

// Route pour mettre à jour un voyage
router.put('/:id', auth, async (req, res) => {
    try {
        console.log('==== DÉBUT MISE À JOUR VOYAGE ====');
        console.log('ID du voyage à mettre à jour:', req.params.id);
        console.log('Données reçues complètes:', req.body);
        console.log('Champs hébergement reçus:', {
            hebergement: req.body.hebergement,
            hebergementImage: req.body.hebergementImage,
            typeHebergementImage: typeof req.body.hebergementImage,
            hebergementImageLength: req.body.hebergementImage?.length,
            hebergementImageStartsWithHttp: req.body.hebergementImage?.startsWith('http')
        });
        console.log('Champs dates reçus:', {
            departureDate: req.body.departureDate,
            returnDate: req.body.returnDate,
            departureDateType: typeof req.body.departureDate,
            returnDateType: typeof req.body.returnDate
        });

        // Vérifier si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID de voyage invalide' });
        }

        // Vérifier que le voyage existe
        const existingVoyage = await Voyage.findById(req.params.id);
        if (!existingVoyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }

        // Préparer les données à mettre à jour
        const updatedData = { ...req.body };
        
        // Vérifier et convertir les dates si nécessaire
        if (updatedData.departureDate) {
            try {
                // Vérifier si la date est valide
                const date = new Date(updatedData.departureDate);
                if (isNaN(date.getTime())) {
                    console.error('Format de date de départ invalide:', updatedData.departureDate);
                } else {
                    console.log('Date de départ valide:', date);
                }
            } catch (error) {
                console.error('Erreur lors du traitement de la date de départ:', error);
            }
        }
        
        if (updatedData.returnDate) {
            try {
                // Vérifier si la date est valide
                const date = new Date(updatedData.returnDate);
                if (isNaN(date.getTime())) {
                    console.error('Format de date de retour invalide:', updatedData.returnDate);
                } else {
                    console.log('Date de retour valide:', date);
                }
            } catch (error) {
                console.error('Erreur lors du traitement de la date de retour:', error);
            }
        }

        // Mettre à jour le voyage
        const updatedVoyage = await Voyage.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        ).populate('activities');

        console.log('Voyage mis à jour avec succès:', {
            id: updatedVoyage._id,
            title: updatedVoyage.title,
            hebergement: updatedVoyage.hebergement,
            hebergementImage: updatedVoyage.hebergementImage,
            departureDate: updatedVoyage.departureDate,
            returnDate: updatedVoyage.returnDate
        });
        console.log('==== FIN MISE À JOUR VOYAGE ====');

        res.json(updatedVoyage);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du voyage:', error);
        res.status(400).json({ message: error.message });
    }
});

// Route pour supprimer un voyage
router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('Tentative de suppression du voyage:', req.params.id);
        
        // Vérifier si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'ID de voyage invalide' });
        }

        // Supprimer le voyage
        const deletedVoyage = await Voyage.findByIdAndDelete(req.params.id);
        
        if (!deletedVoyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        
        console.log('Voyage supprimé avec succès:', {
            id: deletedVoyage._id,
            title: deletedVoyage.title
        });
        
        res.json({ message: 'Voyage supprimé avec succès', id: req.params.id });
    } catch (error) {
        console.error('Erreur lors de la suppression du voyage:', error);
        res.status(500).json({ message: error.message });
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