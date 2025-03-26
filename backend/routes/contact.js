import express from 'express';

const router = express.Router();

// Route de simulation pour l'envoi d'email
// Nous utiliserons EmailJS côté client, donc cette route sert uniquement à des fins de test
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    console.log('Données du formulaire reçues:', { name, email, subject, message });
    
    // Validation des champs
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis'
      });
    }

    // Simulation d'envoi d'email réussi
    console.log(`
    ========== SIMULATION D'ENVOI D'EMAIL ==========
    À: benablahafsa@gmail.com
    De: ${name} <${email}>
    Sujet: ${subject}
    Message: ${message}
    =================================================
    `);
    
    // NOTE: Dans notre implementation finale, l'email sera envoyé directement
    // depuis le frontend avec EmailJS, sans passer par cette route
    
    // Simuler un délai pour rendre l'expérience plus réaliste
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.status(200).json({
      success: true,
      message: 'Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.'
    });
  } catch (error) {
    console.error('Erreur lors de la simulation d\'envoi d\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.'
    });
  }
});

export default router; 