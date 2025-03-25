import express from 'express';
import { auth } from '../middleware/auth.js';
import { Reservation } from '../models/Reservation.js';
import { Voyage } from '../models/voyage.js';
import mongoose from 'mongoose';

const router = express.Router();

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

    console.log('Recherche des réservations avec les critères:', {
      user: req.params.userId,
      type: 'voyage'
    });

    // Vérifier d'abord si l'utilisateur existe dans la base de données des réservations
    const reservationCount = await Reservation.countDocuments({
      user: req.params.userId,
      type: 'voyage'
    });
    console.log(`Nombre total de réservations trouvées: ${reservationCount}`);

    const reservations = await Reservation.find({
      user: req.params.userId,
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

    const reservations = await Reservation.find({
      user: req.params.userId,
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

// Créer une nouvelle réservation
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Création d\'une nouvelle réservation:', {
      userId: req.user.userId,
      body: req.body,
      authUser: req.user
    });

    const { type, voyageId, dateReservation } = req.body;

    // Vérifier si le voyage existe
    const voyage = await Voyage.findById(voyageId);
    if (!voyage) {
      throw new Error('Voyage non trouvé');
    }

    // Créer la réservation
    const reservation = new Reservation({
      user: req.user.userId,
      type: 'voyage',
      voyage: voyageId,
      dateReservation: dateReservation || new Date(),
      statut: 'confirmé'
    });

    console.log('Tentative de sauvegarde de la réservation:', reservation);
    const savedReservation = await reservation.save({ session });
    console.log('Réservation sauvegardée avec succès:', savedReservation);

    // Populate the voyage details
    await savedReservation.populate('voyage');

    await session.commitTransaction();
    res.status(201).json(savedReservation);
  } catch (err) {
    await session.abortTransaction();
    console.error('Erreur lors de la création de la réservation:', {
      message: err.message,
      stack: err.stack,
      userId: req.user.userId,
      body: req.body
    });
    res.status(400).json({ 
      message: "Erreur lors de la création de la réservation",
      details: err.message 
    });
  } finally {
    session.endSession();
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

    if (reservation.user.toString() !== req.user.userId) {
      console.log('Tentative d\'annulation non autorisée:', {
        reservationUserId: reservation.user.toString(),
        requestUserId: req.user.userId
      });
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à annuler cette réservation" });
    }

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

export default router; 