import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import { Reservation } from '../models/Reservation.js';
import { Voyage } from '../models/voyage.js';
import mongoose from 'mongoose';

const router = express.Router();

// Créer une nouvelle réservation
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== Début de la création d\'une réservation ===');
    console.log('Requête reçue:', req.body);
    console.log('Headers de la requête:', req.headers);
    
    const { type, voyageId, nombrePersonnes } = req.body;
    
    console.log('Données extraites:', { type, voyageId, nombrePersonnes });

    if (type === 'voyage') {
      console.log('Recherche du voyage avec l\'ID:', voyageId);
      const voyage = await Voyage.findById(voyageId);
      
      if (!voyage) {
        console.log('Voyage non trouvé avec l\'ID:', voyageId);
        return res.status(404).json({ message: 'Voyage non trouvé' });
      }
      
      console.log('Voyage trouvé:', {
        id: voyage._id,
        title: voyage.title,
        availableSpots: voyage.availableSpots
      });
      
      if (voyage.availableSpots < nombrePersonnes) {
        console.log('Pas assez de places disponibles:', {
          demandé: nombrePersonnes,
          disponible: voyage.availableSpots
        });
        return res.status(400).json({ message: 'Pas assez de places disponibles' });
      }
    }

    // Debugging de l'utilisateur reçu du token
    console.log('User dans le token:', req.user);
    console.log('Type du userId:', typeof req.user.userId);
    console.log('Valeur du userId:', req.user.userId);
    
    // Convertir l'ID utilisateur en ObjectId
    console.log('Tentative de conversion du userId en ObjectId:', req.user.userId);
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.userId);
      console.log('Conversion réussie:', userId);
    } catch (err) {
      console.error('Erreur lors de la conversion du userId en ObjectId:', err);
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }
    
    // Construire l'objet de réservation avec des logs
    const reservationData = {
      user: userId,
      type,
      voyage: type === 'voyage' ? voyageId : undefined,
      activite: type === 'activite' ? req.body.activiteId : undefined,
      nombrePersonnes,
      statut: 'confirmé'
    };
    
    console.log('Données de la réservation à créer:', reservationData);
    
    const reservation = new Reservation(reservationData);
    console.log('Objet reservation créé:', reservation);

    console.log('Tentative de sauvegarde de la réservation...');
    const nouvelleReservation = await reservation.save();
    console.log('Réservation sauvegardée avec succès:', nouvelleReservation);
    
    await nouvelleReservation.populate('voyage');
    await nouvelleReservation.populate('user');
    console.log('Réservation après population:', nouvelleReservation);

    res.status(201).json(nouvelleReservation);
  } catch (error) {
    console.error('=== ERREUR lors de la création de réservation ===');
    console.error('Message d\'erreur:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Détails de l\'erreur:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Erreur de validation MongoDB:');
      for (let field in error.errors) {
        console.error(`- Champ "${field}": ${error.errors[field].message}`);
      }
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Obtenir toutes les réservations d'un utilisateur
router.get('/user', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('voyage')
      .populate('activite')
      .sort({ dateReservation: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Annuler une réservation
router.patch('/:id/annuler', auth, async (req, res) => {
  try {
    console.log('Tentative de modification du statut d\'une réservation:', {
      reservationId: req.params.id,
      userId: req.user.userId || req.user._id
    });

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user.userId || req.user._id
    });

    if (!reservation) {
      console.log('Réservation non trouvée');
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    if (reservation.statut === 'annulé') {
      console.log('La réservation est déjà annulée');
      return res.status(400).json({ message: 'La réservation est déjà annulée' });
    }

    // Si c'est une réservation de voyage, mettre à jour le nombre de places disponibles
    if (reservation.type === 'voyage') {
      try {
        // Analyser en détail l'objet réservation et les références
        console.log('Détails complets de la réservation:', JSON.stringify(reservation, null, 2));
        console.log('Type de la propriété voyage:', typeof reservation.voyage);
        
        // Identifier l'ID du voyage de différentes manières possibles
        const voyageId = reservation.voyage ? 
                        (typeof reservation.voyage === 'object' ? 
                          reservation.voyage._id : reservation.voyage) : 
                        null;
        
        console.log('ID du voyage extrait:', voyageId);
        
        if (!voyageId) {
          console.log('Impossible de trouver l\'ID du voyage dans la réservation');
          // Essayer de récupérer la réservation complète avec populate
          const reservationComplete = await Reservation.findById(reservation._id)
            .populate('voyage');
          console.log('Réservation après populate:', reservationComplete);
          
          if (reservationComplete && reservationComplete.voyage) {
            console.log('ID du voyage trouvé après populate:', 
              typeof reservationComplete.voyage === 'object' ? 
                reservationComplete.voyage._id : 
                reservationComplete.voyage);
          }
        }
        
        // Trouver et mettre à jour le voyage
        if (voyageId) {
          console.log('Recherche du voyage avec ID:', voyageId);
          const voyage = await Voyage.findById(voyageId);
          
          if (voyage) {
            console.log('Voyage trouvé:', {
              id: voyage._id,
              title: voyage.title,
              availableSpots: voyage.availableSpots,
              maxPlaces: voyage.maxPlaces
            });
            
            // Enregistrer l'état initial
            const placesInitiales = voyage.availableSpots;
            
            // Incrémenter le nombre de places disponibles
            voyage.availableSpots += reservation.nombrePersonnes;
            
            // Vérifier que le nombre de places disponibles ne dépasse pas le maximum
            if (voyage.availableSpots > voyage.maxPlaces) {
              console.log('Correction: le nombre de places dépasserait le maximum', {
                calculé: voyage.availableSpots,
                maximum: voyage.maxPlaces
              });
              voyage.availableSpots = voyage.maxPlaces;
            }
            
            // Mettre à jour directement dans la base de données pour éviter les problèmes de validation
            const updateResult = await Voyage.updateOne(
              { _id: voyageId },
              { $set: { availableSpots: voyage.availableSpots } }
            );
            
            console.log('Résultat de la mise à jour:', updateResult);
            console.log('Places disponibles mises à jour:', {
              avant: placesInitiales,
              après: voyage.availableSpots,
              différence: voyage.availableSpots - placesInitiales,
              personnes: reservation.nombrePersonnes
            });
            
            // Vérifier que la mise à jour a bien été effectuée
            const voyageVerif = await Voyage.findById(voyageId);
            console.log('Vérification après mise à jour:', {
              availableSpots: voyageVerif.availableSpots
            });
          } else {
            console.log('Voyage non trouvé avec l\'ID:', voyageId);
          }
        } else {
          console.log('Aucun ID de voyage valide trouvé pour mettre à jour les places');
        }
      } catch (error) {
        console.error('Erreur détaillée lors de la mise à jour des places disponibles:', {
          message: error.message,
          stack: error.stack
        });
        // On continue même si la mise à jour des places échoue
      }
    }

    // Mettre à jour le statut de la réservation
    const reservationMiseAJour = await Reservation.findOneAndUpdate(
      { _id: req.params.id },
      { statut: 'annulé' },
      { new: true }
    ).populate('voyage');

    console.log('Réservation mise à jour avec succès:', reservationMiseAJour);
    res.json(reservationMiseAJour);
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la réservation:', error);
    res.status(400).json({ message: error.message });
  }
});

// Récupérer toutes les réservations de voyages d'un utilisateur
router.get('/voyages/:userId', auth, async (req, res) => {
  try {
    console.log('=== Début de la récupération des réservations de voyages ===');
    console.log('Paramètres de la requête:', {
      paramsUserId: req.params.userId,
      authUserId: req.user.userId,
      authUser: req.user,
      headers: req.headers,
      method: req.method,
      url: req.url
    });

    // Vérifier que l'utilisateur demande ses propres réservations
    if (req.params.userId !== req.user.userId) {
      console.log('Tentative d\'accès non autorisé aux réservations');
      console.log('Comparaison des IDs:', {
        paramsUserId: req.params.userId,
        authUserId: req.user.userId,
        match: req.params.userId === req.user.userId
      });
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à voir ces réservations" });
    }

    // Convertir l'ID utilisateur en ObjectId pour les requêtes MongoDB
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.params.userId);
      console.log('ID utilisateur converti en ObjectId pour la recherche:', userObjectId);
    } catch (err) {
      console.error('Erreur lors de la conversion de l\'ID utilisateur:', err);
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    console.log('Recherche des réservations avec les critères:', {
      user: userObjectId,
      type: 'voyage'
    });

    // Vérifier d'abord si l'utilisateur existe dans la base de données des réservations
    const reservationCount = await Reservation.countDocuments({
      user: userObjectId,
      type: 'voyage'
    });
    console.log(`Nombre total de réservations trouvées: ${reservationCount}`);

    const reservations = await Reservation.find({
      user: userObjectId,
      type: 'voyage'
    })
    .populate({
      path: 'voyage',
      select: 'title destination price description image duration'
    })
    .sort({ dateReservation: -1 });

    // Formater les URLs des images
    const formattedReservations = reservations.map(reservation => {
      const reservationObj = reservation.toObject();
      if (reservationObj.voyage && reservationObj.voyage.image) {
        if (reservationObj.voyage.image.includes('/uploads/')) {
          if (!reservationObj.voyage.image.startsWith('http')) {
            reservationObj.voyage.image = `http://localhost:5000${reservationObj.voyage.image}`;
          }
        }
      }
      return reservationObj;
    });

    console.log('=== Résultats de la recherche ===');
    console.log('Nombre de réservations:', formattedReservations.length);
    console.log('Détails des réservations:', JSON.stringify(formattedReservations, null, 2));

    // Vérifier si les voyages ont été correctement peuplés
    const reservationsWithMissingVoyages = formattedReservations.filter(r => !r.voyage);
    if (reservationsWithMissingVoyages.length > 0) {
      console.log('Attention: Certaines réservations n\'ont pas de voyage associé:', 
        reservationsWithMissingVoyages.map(r => ({
          reservationId: r._id,
          userId: r.user,
          voyageId: r.voyage
        }))
      );
    }

    res.json(formattedReservations);
  } catch (err) {
    console.error('Erreur détaillée lors de la récupération des réservations:', {
      message: err.message,
      stack: err.stack,
      userId: req.params.userId,
      authUser: req.user
    });
    res.status(500).json({ 
      message: "Erreur lors de la récupération des réservations de voyages",
      details: err.message 
    });
  }
});

// Récupérer toutes les réservations d'activités d'un utilisateur
router.get('/activites/:userId', auth, async (req, res) => {
  try {
    console.log('Récupération des réservations d\'activités');
    console.log('Paramètres de la requête:', {
      paramsUserId: req.params.userId,
      authUserId: req.user.userId,
      authUser: req.user
    });

    // Vérifier que l'utilisateur demande ses propres réservations
    if (req.params.userId !== req.user.userId) {
      console.log('Tentative d\'accès non autorisé aux réservations');
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à voir ces réservations" });
    }

    // Convertir l'ID utilisateur en ObjectId pour les requêtes MongoDB
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(req.params.userId);
      console.log('ID utilisateur converti en ObjectId pour la recherche d\'activités:', userObjectId);
    } catch (err) {
      console.error('Erreur lors de la conversion de l\'ID utilisateur pour les activités:', err);
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }
    
    const reservations = await Reservation.find({
      user: userObjectId,
      type: 'activite'
    })
    .populate('activite')
    .sort({ dateReservation: -1 });

    console.log('Réservations trouvées:', JSON.stringify(reservations, null, 2));
    res.json(reservations);
  } catch (err) {
    console.error('Erreur détaillée lors de la récupération des réservations:', {
      message: err.message,
      stack: err.stack,
      userId: req.params.userId,
      authUser: req.user
    });
    res.status(500).json({ 
      message: "Erreur lors de la récupération des réservations d'activités",
      details: err.message 
    });
  }
});

// Annuler une réservation
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Tentative d\'annulation de réservation:', {
      reservationId: req.params.id,
      userId: req.user.userId
    });

    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    const reservationUserId = reservation.user.toString();
    const tokenUserId = req.user.userId;
    
    console.log('Comparaison des IDs pour autorisation:', {
      reservationUserId,
      tokenUserId,
      reservationUserIdType: typeof reservationUserId,
      tokenUserIdType: typeof tokenUserId
    });

    // Vérifier si l'ID utilisateur du token correspond à l'ID utilisateur de la réservation
    if (reservationUserId !== tokenUserId) {
      console.log('Tentative d\'annulation non autorisée - IDs ne correspondent pas');
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à annuler cette réservation" });
    }

    // Si c'est une réservation de voyage, mettre à jour le nombre de places disponibles
    if (reservation.type === 'voyage') {
      try {
        // Analyser en détail l'objet réservation et les références
        console.log('Détails complets de la réservation:', JSON.stringify(reservation, null, 2));
        console.log('Type de la propriété voyage:', typeof reservation.voyage);
        
        // Identifier l'ID du voyage de différentes manières possibles
        const voyageId = reservation.voyage ? 
                        (typeof reservation.voyage === 'object' ? 
                          reservation.voyage._id : reservation.voyage) : 
                        null;
        
        console.log('ID du voyage extrait:', voyageId);
        
        if (!voyageId) {
          console.log('Impossible de trouver l\'ID du voyage dans la réservation');
          // Essayer de récupérer la réservation complète avec populate
          const reservationComplete = await Reservation.findById(reservation._id)
            .populate('voyage');
          console.log('Réservation après populate:', reservationComplete);
          
          if (reservationComplete && reservationComplete.voyage) {
            console.log('ID du voyage trouvé après populate:', 
              typeof reservationComplete.voyage === 'object' ? 
                reservationComplete.voyage._id : 
                reservationComplete.voyage);
          }
        }
        
        // Trouver et mettre à jour le voyage
        if (voyageId) {
          console.log('Recherche du voyage avec ID:', voyageId);
          const voyage = await Voyage.findById(voyageId);
          
          if (voyage) {
            console.log('Voyage trouvé:', {
              id: voyage._id,
              title: voyage.title,
              availableSpots: voyage.availableSpots,
              maxPlaces: voyage.maxPlaces
            });
            
            // Enregistrer l'état initial
            const placesInitiales = voyage.availableSpots;
            
            // Incrémenter le nombre de places disponibles
            voyage.availableSpots += reservation.nombrePersonnes;
            
            // Vérifier que le nombre de places disponibles ne dépasse pas le maximum
            if (voyage.availableSpots > voyage.maxPlaces) {
              console.log('Correction: le nombre de places dépasserait le maximum', {
                calculé: voyage.availableSpots,
                maximum: voyage.maxPlaces
              });
              voyage.availableSpots = voyage.maxPlaces;
            }
            
            // Mettre à jour directement dans la base de données pour éviter les problèmes de validation
            const updateResult = await Voyage.updateOne(
              { _id: voyageId },
              { $set: { availableSpots: voyage.availableSpots } }
            );
            
            console.log('Résultat de la mise à jour:', updateResult);
            console.log('Places disponibles mises à jour:', {
              avant: placesInitiales,
              après: voyage.availableSpots,
              différence: voyage.availableSpots - placesInitiales,
              personnes: reservation.nombrePersonnes
            });
            
            // Vérifier que la mise à jour a bien été effectuée
            const voyageVerif = await Voyage.findById(voyageId);
            console.log('Vérification après mise à jour:', {
              availableSpots: voyageVerif.availableSpots
            });
          } else {
            console.log('Voyage non trouvé avec l\'ID:', voyageId);
          }
        } else {
          console.log('Aucun ID de voyage valide trouvé pour mettre à jour les places');
        }
      } catch (error) {
        console.error('Erreur détaillée lors de la mise à jour des places disponibles:', {
          message: error.message,
          stack: error.stack
        });
        // On continue même si la mise à jour des places échoue
      }
    }
    
    // Supprimer la réservation
    await reservation.deleteOne();
    console.log('Réservation annulée avec succès');
    res.json({ message: "Réservation annulée avec succès" });
  } catch (err) {
    console.error('Erreur lors de l\'annulation de la réservation:', {
      message: err.message,
      stack: err.stack,
      reservationId: req.params.id,
      userId: req.user.userId
    });
    res.status(500).json({ message: "Erreur lors de l'annulation de la réservation" });
  }
});

// Obtenir toutes les réservations (pour admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    console.log('=== Début de la récupération de toutes les réservations (admin) ===');
    console.log('User dans le token:', req.user);
    
    // Récupérer toutes les réservations avec les informations associées
    const reservations = await Reservation.find()
      .populate('user', 'name email')
      .populate('voyage', 'title destination price duration image')
      .populate('activite', 'name city price duration image')
      .sort({ dateReservation: -1 });
    
    console.log(`${reservations.length} réservations trouvées au total`);
    
    // Formater les réservations pour l'affichage
    const formattedReservations = reservations.map(reservation => {
      const reservationObj = reservation.toObject();
      
      // Formatter les URLs des images si nécessaire
      if (reservationObj.voyage && reservationObj.voyage.image) {
        if (reservationObj.voyage.image.includes('/uploads/') && !reservationObj.voyage.image.startsWith('http')) {
          reservationObj.voyage.image = `http://localhost:5000${reservationObj.voyage.image}`;
        }
      }
      
      if (reservationObj.activite && reservationObj.activite.image) {
        if (reservationObj.activite.image.includes('/uploads/') && !reservationObj.activite.image.startsWith('http')) {
          reservationObj.activite.image = `http://localhost:5000${reservationObj.activite.image}`;
        }
      }
      
      return reservationObj;
    });
    
    res.json(formattedReservations);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations (admin):', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Erreur lors de la récupération des réservations",
      details: error.message 
    });
  }
});

// Route pour qu'un administrateur annule une réservation
router.patch('/admin/:id/cancel', adminAuth, async (req, res) => {
  try {
    console.log('=== Tentative d\'annulation admin de réservation ===');
    console.log('ID de réservation:', req.params.id);
    console.log('User dans le token:', req.user);
    
    // Récupérer la réservation
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      console.log('Réservation non trouvée');
      return res.status(404).json({ message: "Réservation non trouvée" });
    }
    
    console.log('Réservation trouvée:', JSON.stringify(reservation, null, 2));
    
    if (reservation.statut === 'annulé') {
      console.log('La réservation est déjà annulée');
      return res.status(400).json({ message: "Cette réservation est déjà annulée" });
    }
    
    // Si c'est une réservation de voyage, mettre à jour le nombre de places disponibles
    if (reservation.type === 'voyage') {
      try {
        // Analyser en détail l'objet réservation et les références
        console.log('Type de la propriété voyage:', typeof reservation.voyage);
        
        // Identifier l'ID du voyage de différentes manières possibles
        const voyageId = reservation.voyage ? 
                        (typeof reservation.voyage === 'object' ? 
                          reservation.voyage._id : reservation.voyage) : 
                        null;
        
        console.log('ID du voyage extrait:', voyageId);
        
        if (!voyageId) {
          console.log('Impossible de trouver l\'ID du voyage dans la réservation');
          // Essayer de récupérer la réservation complète avec populate
          const reservationComplete = await Reservation.findById(reservation._id)
            .populate('voyage');
          console.log('Réservation après populate:', reservationComplete);
          
          if (reservationComplete && reservationComplete.voyage) {
            console.log('ID du voyage trouvé après populate:', 
              typeof reservationComplete.voyage === 'object' ? 
                reservationComplete.voyage._id : 
                reservationComplete.voyage);
          }
        }
        
        // Trouver et mettre à jour le voyage
        if (voyageId) {
          console.log('Recherche du voyage avec ID:', voyageId);
          const voyage = await Voyage.findById(voyageId);
          
          if (voyage) {
            console.log('Voyage trouvé:', {
              id: voyage._id,
              title: voyage.title,
              availableSpots: voyage.availableSpots,
              maxPlaces: voyage.maxPlaces
            });
            
            // Enregistrer l'état initial
            const placesInitiales = voyage.availableSpots;
            
            // Incrémenter le nombre de places disponibles
            voyage.availableSpots += reservation.nombrePersonnes;
            
            // Vérifier que le nombre de places disponibles ne dépasse pas le maximum
            if (voyage.availableSpots > voyage.maxPlaces) {
              console.log('Correction: le nombre de places dépasserait le maximum', {
                calculé: voyage.availableSpots,
                maximum: voyage.maxPlaces
              });
              voyage.availableSpots = voyage.maxPlaces;
            }
            
            // Mettre à jour directement dans la base de données pour éviter les problèmes de validation
            const updateResult = await Voyage.updateOne(
              { _id: voyageId },
              { $set: { availableSpots: voyage.availableSpots } }
            );
            
            console.log('Résultat de la mise à jour:', updateResult);
            console.log('Places disponibles mises à jour:', {
              avant: placesInitiales,
              après: voyage.availableSpots,
              différence: voyage.availableSpots - placesInitiales,
              personnes: reservation.nombrePersonnes
            });
            
            // Vérifier que la mise à jour a bien été effectuée
            const voyageVerif = await Voyage.findById(voyageId);
            console.log('Vérification après mise à jour:', {
              availableSpots: voyageVerif.availableSpots
            });
          } else {
            console.log('Voyage non trouvé avec l\'ID:', voyageId);
          }
        } else {
          console.log('Aucun ID de voyage valide trouvé pour mettre à jour les places');
        }
      } catch (error) {
        console.error('Erreur détaillée lors de la mise à jour des places disponibles:', {
          message: error.message,
          stack: error.stack
        });
        // On continue même si la mise à jour des places échoue
      }
    }
    
    // Mettre à jour le statut de la réservation
    reservation.statut = 'annulé';
    reservation.dateModification = new Date();
    reservation.annulePar = 'admin';
    
    await reservation.save();
    
    console.log('Réservation annulée avec succès par l\'administrateur');
    
    // Récupérer la réservation mise à jour avec les informations associées
    const reservationMiseAJour = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('voyage', 'title destination price duration')
      .populate('activite', 'name city price duration');
    
    res.json({ 
      message: "Réservation annulée avec succès",
      reservation: reservationMiseAJour
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation admin de la réservation:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Erreur lors de l'annulation de la réservation",
      details: error.message
    });
  }
});

export default router; 