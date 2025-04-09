import express from 'express';
import { Voyage } from '../models/voyage.js';
import { Comment } from '../models/comment.js';
import { auth } from '../middleware/auth.js';
import mongoose from 'mongoose';
import { User } from '../models/user.js';

const router = express.Router();

// Middleware de débogage pour les routes de réaction
const debugReactionMiddleware = (req, res, next) => {
    console.log('====== DEBUG RÉACTION ======');
    console.log('Méthode:', req.method);
    console.log('URL:', req.originalUrl);
    console.log('Auth:', !!req.headers.authorization || !!req.headers['user-id']);
    console.log('Params ID:', req.params.id);
    console.log('===========================');
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
        const { type, userId: bodyUserId } = req.body; // 'like' ou 'dislike' et userId optionnel dans le corps

        if (!type || (type !== 'like' && type !== 'dislike')) {
            return res.status(400).json({ message: 'Type de réaction invalide' });
        }
        
        // Récupérer l'userId de plusieurs sources possibles
        let userId;
        if (req.user) {
            userId = req.user._id.toString();
        } else if (req.headers['user-id']) {
            userId = req.headers['user-id'];
        } else if (bodyUserId) {
            userId = bodyUserId;
        } else {
            return res.status(400).json({ message: 'ID utilisateur requis' });
        }
        
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
        
        // Formater la réponse pour le client
        res.json({
            likes: voyage.reactions.likes,
            dislikes: voyage.reactions.dislikes,
            reaction: type,
            message: 'Réaction mise à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour des réactions:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des réactions' });
    }
});

// Route pour obtenir les réactions d'un voyage
router.get('/:id/reaction', debugReactionMiddleware, async (req, res) => {
    try {
        // Récupérer le voyage
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }

        // S'assurer que les réactions existent
        const reactions = voyage.reactions || { likes: 0, dislikes: 0, userReactions: [] };
        
        // Récupérer l'userId s'il est disponible
        let userId;
        if (req.user) {
            userId = req.user._id.toString();
        } else if (req.headers['user-id']) {
            userId = req.headers['user-id'];
        }
        
        // Trouver la réaction de l'utilisateur si userId disponible
        let userReaction = null;
        if (userId) {
            userReaction = reactions.userReactions?.find(reaction => reaction.userId === userId);
        }
        
        // Retourner la réponse
        res.json({ 
            likes: reactions.likes || 0,
            dislikes: reactions.dislikes || 0,
            reaction: userReaction ? userReaction.type : null
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des réactions:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des réactions' });
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

// Route pour obtenir les commentaires d'un voyage
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de voyage invalide' });
        }

        // Vérifier si le voyage existe
        const voyage = await Voyage.findById(id);
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }

        // Récupérer les commentaires
        const comments = await Comment.find({ voyageId: id })
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
    }
});

// Route pour ajouter un commentaire à un voyage
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de voyage invalide' });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Le contenu du commentaire est requis' });
        }

        // Vérifier si le voyage existe
        const voyage = await Voyage.findById(id);
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }

        // Récupérer l'utilisateur à partir du token
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({ message: 'Utilisateur non authentifié' });
        }

        // Afficher les informations disponibles pour le débogage
        console.log('Informations utilisateur disponibles pour le commentaire:', {
            userId: currentUser.userId,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            fullObject: JSON.stringify(currentUser)
        });

        // Essayer de récupérer l'utilisateur complet depuis la base de données pour garantir les données les plus récentes
        let userName = currentUser.username || 'Utilisateur';
        try {
            // Si nous avons l'identifiant de l'utilisateur, essayons de récupérer son profil complet
            if (currentUser.userId) {
                const userFromDb = await User.findById(currentUser.userId).select('username');
                if (userFromDb && userFromDb.username) {
                    userName = userFromDb.username;
                    console.log('Nom d\'utilisateur récupéré depuis la base de données:', userName);
                } else {
                    console.log('Utilisateur non trouvé ou sans nom d\'utilisateur, utilisation de la valeur du token:', userName);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du profil utilisateur:', error);
            console.log('Continuation avec le nom d\'utilisateur du token:', userName);
        }

        // Créer le commentaire
        const comment = new Comment({
            voyageId: id,
            userId: userId || currentUser.userId,
            userName: userName, // Utiliser le nom d'utilisateur récupéré
            content
        });

        const savedComment = await comment.save();

        console.log('Commentaire enregistré avec les informations:', {
            voyageId: savedComment.voyageId,
            userId: savedComment.userId,
            userName: savedComment.userName,
            content: savedComment.content.substring(0, 30) + (savedComment.content.length > 30 ? '...' : '')
        });

        // Mettre à jour le compteur de commentaires dans le voyage
        // S'assurer que commentCount existe ou initialiser à 0
        if (voyage.commentCount === undefined) {
            voyage.commentCount = 0;
        }
        voyage.commentCount += 1;
        await voyage.save();

        // Log pour débogage
        console.log(`Compteur de commentaires mis à jour pour le voyage ${id}: ${voyage.commentCount}`);

        res.status(201).json(savedComment);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
    }
});

// Route pour supprimer un commentaire
router.delete('/:voyageId/comments/:commentId', auth, async (req, res) => {
    try {
        const { voyageId, commentId } = req.params;
        console.log(`Requête de suppression reçue - voyageId: ${voyageId}, commentId: ${commentId}`);
        console.log(`Utilisateur authentifié: ${req.userId} (${req.user?.username || req.user?.email || 'Inconnu'})`);

        // Logging du token reçu pour débogage (masqué pour sécurité)
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const tokenParts = authHeader.split(' ');
            if (tokenParts.length > 1) {
                const token = tokenParts[1];
                console.log(`Token reçu: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
            } else {
                console.log('Format du header d\'autorisation invalide');
            }
        } else {
            console.log('Header d\'autorisation absent');
        }

        // Valider les IDs
        if (!mongoose.Types.ObjectId.isValid(voyageId) || !mongoose.Types.ObjectId.isValid(commentId)) {
            console.log('IDs invalides');
            return res.status(400).json({ message: 'ID de voyage ou de commentaire invalide' });
        }

        // Trouver le commentaire
        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            console.log('Commentaire non trouvé');
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }
        
        // Vérifier que le commentaire appartient au voyage spécifié
        if (comment.voyageId.toString() !== voyageId) {
            console.log(`Mismatch: commentaire.voyageId=${comment.voyageId}, paramVoyageId=${voyageId}`);
            return res.status(400).json({ message: 'Ce commentaire n\'appartient pas à ce voyage' });
        }

        // Récupérer l'ID utilisateur du token
        const currentUser = req.user;
        
        if (!currentUser) {
            console.log('Utilisateur non authentifié dans auth middleware');
            return res.status(401).json({ message: 'Utilisateur non authentifié. Veuillez vous reconnecter.' });
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
        await Comment.findByIdAndDelete(commentId);
        console.log(`Commentaire ${commentId} supprimé avec succès`);
        
        // Décrémenter le compteur de commentaires dans le voyage
        const voyage = await Voyage.findById(voyageId);
        if (voyage) {
            voyage.commentCount = Math.max(0, (voyage.commentCount || 1) - 1);
            await voyage.save();
            
            // Log pour débogage
            console.log(`Compteur de commentaires mis à jour après suppression pour le voyage ${voyageId}: ${voyage.commentCount}`);
        }

        res.json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du commentaire:', error);
        
        // Fournir des informations plus détaillées sur l'erreur
        let statusCode = 500;
        let message = 'Erreur lors de la suppression du commentaire';
        
        if (error.name === 'JsonWebTokenError') {
            statusCode = 401;
            message = 'Token invalide. Veuillez vous reconnecter.';
        } else if (error.name === 'TokenExpiredError') {
            statusCode = 401;
            message = 'Votre session a expiré. Veuillez vous reconnecter.';
        }
        
        res.status(statusCode).json({ message, error: error.message });
    }
});

export default router;