// Route pour gérer les réactions
router.post('/:id/reactions', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, action } = req.body;

    const voyage = await Voyage.findById(id);
    if (!voyage) {
      return res.status(404).json({ message: 'Voyage non trouvé' });
    }

    // Initialiser les réactions si elles n'existent pas
    if (!voyage.reactions) {
      voyage.reactions = { likes: 0, dislikes: 0 };
    }

    // Mettre à jour le compteur approprié
    const increment = action === 'add' ? 1 : -1;
    if (type === 'like') {
      voyage.reactions.likes += increment;
    } else if (type === 'dislike') {
      voyage.reactions.dislikes += increment;
    }

    // S'assurer que les compteurs ne deviennent pas négatifs
    voyage.reactions.likes = Math.max(0, voyage.reactions.likes);
    voyage.reactions.dislikes = Math.max(0, voyage.reactions.dislikes);

    await voyage.save();
    res.json({ reactions: voyage.reactions });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des réactions:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour des réactions' });
  }
}); 