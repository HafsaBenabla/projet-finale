import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('Tentative d\'inscription avec l\'email:', email);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? "Cet email est déjà utilisé" 
          : "Ce nom d'utilisateur est déjà pris" 
      });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      username,
      email,
      password
    });

    // Si l'email est benablahafsa@gmail.com, attribuer le rôle admin
    // Comparaison insensible à la casse
    const adminEmail = 'benablahafsa@gmail.com';
    if (email.toLowerCase() === adminEmail.toLowerCase()) {
      user.role = 'admin';
      console.log(`Rôle administrateur attribué lors de l'inscription à l'email ${email} (admin email: ${adminEmail})`);
    }

    await user.save();

    console.log('Création du token JWT avec les données:', {
      _id: user._id,
      _idType: typeof user._id,
      _idString: user._id.toString(),
      role: user.role
    });
    
    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "Compte créé avec succès",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      message: "Erreur lors de la création du compte",
      error: error.message 
    });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Tentative de connexion avec l\'email:', email);

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Si c'est l'utilisateur spécifique avec l'email benablahafsa@gmail.com
    // alors on s'assure qu'il a le rôle d'administrateur
    // Comparaison insensible à la casse
    const adminEmail = 'benablahafsa@gmail.com';
    if (email.toLowerCase() === adminEmail.toLowerCase()) {
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log(`Rôle administrateur attribué lors de la connexion à l'email ${email} (admin email: ${adminEmail})`);
      }
    }

    console.log('Connexion réussie - Création du token JWT avec les données:', {
      _id: user._id,
      _idType: typeof user._id,
      _idString: user._id.toString(),
      role: user.role,
      email: user.email
    });
    
    // Générer le token JWT avec l'ID utilisateur sous forme de chaîne
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        role: user.role, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token JWT généré avec ID utilisateur:', user._id.toString());

    res.json({
      message: "Connexion réussie",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      message: "Erreur lors de la connexion",
      error: error.message 
    });
  }
});

// Route pour vérifier le token JWT
router.get('/verify-token', async (req, res) => {
  try {
    console.log('Requête de vérification de token reçue');
    const authHeader = req.headers.authorization;
    console.log('Header d\'autorisation:', authHeader ? 'Présent' : 'Absent');
    
    const token = authHeader?.split(' ')[1];
    if (!token) {
      console.log('Pas de token fourni dans la requête');
      return res.status(401).json({ message: "Token non fourni" });
    }

    console.log('Décodage du token JWT...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token décodé:', {
      userId: decoded.userId,
      role: decoded.role,
      exp: decoded.exp
    });

    console.log('Recherche de l\'utilisateur avec l\'ID:', decoded.userId);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('Utilisateur non trouvé dans la base de données');
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log('Utilisateur trouvé:', {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(401).json({ message: "Token invalide" });
  }
});

export default router; 