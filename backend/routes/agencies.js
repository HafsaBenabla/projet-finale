import express from 'express';
import { Agency } from '../models/agency.js';

const router = express.Router();

// Récupérer toutes les agences
router.get('/', async (req, res) => {
    try {
        const agencies = await Agency.find({}).sort({ name: 1 });
        res.json(agencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Créer une nouvelle agence
router.post('/', async (req, res) => {
    const agency = new Agency(req.body);
    try {
        const newAgency = await agency.save();
        res.status(201).json(newAgency);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Récupérer une agence par son ID
router.get('/:id', async (req, res) => {
    try {
        const agency = await Agency.findById(req.params.id);
        if (agency) {
            res.json(agency);
        } else {
            res.status(404).json({ message: 'Agence non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une agence
router.put('/:id', async (req, res) => {
    try {
        const agency = await Agency.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (agency) {
            res.json(agency);
        } else {
            res.status(404).json({ message: 'Agence non trouvée' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Supprimer une agence
router.delete('/:id', async (req, res) => {
    try {
        const agency = await Agency.findByIdAndDelete(req.params.id);
        if (agency) {
            res.json({ message: 'Agence supprimée avec succès' });
        } else {
            res.status(404).json({ message: 'Agence non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 