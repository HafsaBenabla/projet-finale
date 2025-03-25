// Route pour gérer les réactions
router.post('/:id/reactions', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, action } = req.body;
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(400).json({ message: 'ID utilisateur requis' });
    }

    const voyage = await Voyage.findById(id);
    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }

    // Initialiser les réactions si elles n'existent pas
    if (!voyage.reactions) {
      voyage.reactions = {
        likes: 0,
        dislikes: 0,
        userReactions: []
      };
    }

    // Trouver la réaction existante de l'utilisateur
    const existingReactionIndex = voyage.reactions.userReactions.findIndex(
      r => r.userId === userId
    );

    // Gérer l'ajout ou la suppression de la réaction
    if (action === 'add') {
      if (existingReactionIndex !== -1) {
        // Si l'utilisateur avait déjà une réaction différente, la mettre à jour
        const oldType = voyage.reactions.userReactions[existingReactionIndex].type;
        if (oldType !== type) {
          // Décrémenter l'ancien compteur
          voyage.reactions[`${oldType}s`] = Math.max(0, voyage.reactions[`${oldType}s`] - 1);
          // Incrémenter le nouveau compteur
          voyage.reactions[`${type}s`]++;
          // Mettre à jour le type de réaction
          voyage.reactions.userReactions[existingReactionIndex].type = type;
        }
      } else {
        // Ajouter une nouvelle réaction
        voyage.reactions.userReactions.push({ userId, type });
        voyage.reactions[`${type}s`]++;
      }
    } else if (action === 'remove' && existingReactionIndex !== -1) {
      // Supprimer la réaction
      const oldType = voyage.reactions.userReactions[existingReactionIndex].type;
      voyage.reactions[`${oldType}s`] = Math.max(0, voyage.reactions[`${oldType}s`] - 1);
      voyage.reactions.userReactions.splice(existingReactionIndex, 1);
    }

    await voyage.save();

    // Renvoyer les réactions mises à jour avec la réaction de l'utilisateur
    res.json({
      reactions: {
        likes: voyage.reactions.likes,
        dislikes: voyage.reactions.dislikes,
        userReaction: voyage.reactions.userReactions.find(r => r.userId === userId)?.type || null
      },
      message: 'Réaction mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des réactions:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour des réactions' });
  }
});

// Route pour récupérer les réactions d'un voyage
router.get('/:id/reactions', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['user-id'];

    if (!userId) {
      return res.status(400).json({ message: 'ID utilisateur requis' });
    }

    const voyage = await Voyage.findById(id);
    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }

    // S'assurer que les réactions existent
    const reactions = voyage.reactions || { likes: 0, dislikes: 0, userReactions: [] };
    
    // Trouver la réaction de l'utilisateur
    const userReaction = reactions.userReactions?.find(r => r.userId === userId)?.type || null;

    res.json({
      reactions: {
        likes: reactions.likes,
        dislikes: reactions.dislikes,
        userReaction
      },
      message: 'Réactions récupérées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des réactions' });
  }
}); 