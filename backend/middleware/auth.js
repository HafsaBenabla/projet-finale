import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

<<<<<<< HEAD
export const auth = async (req, res, next) => {
  try {
    console.log('Vérification du token d\'authentification');
    console.log('Headers reçus:', req.headers);
    
=======
/**
 * Middleware de vérification du token JWT
 * Décode le token et ajoute les informations de l'utilisateur à l'objet req
 * Version plus tolérante qui ne bloque pas la requête en cas d'erreur
 */
export const verifyToken = async (req, res, next) => {
  try {
    console.log('=== Vérification du token ===');
    
    // Récupérer le header d'autorisation
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Aucun header d\'autorisation trouvé - mais on continue la requête');
      req.authFailed = true;
      req.authError = "NO_AUTH_HEADER";
      next();
      return;
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token non trouvé dans le header d\'autorisation - mais on continue la requête');
      req.authFailed = true;
      req.authError = "NO_TOKEN";
      next();
      return;
    }

    // Vérifier et décoder le token
    console.log('Token trouvé, tentative de vérification');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token décodé avec succès:', {
      userId: decoded.userId,
      role: decoded.role,
      exp: decoded.exp,
      now: Math.floor(Date.now() / 1000)
    });

    // Vérifier l'expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      // Calculer à quel point le token est expiré
      const expirationDelta = Math.floor(Date.now() / 1000) - decoded.exp;
      console.log(`Token expiré depuis ${expirationDelta} secondes`);
      
      // Si le token est expiré depuis moins de 60 secondes, on le tolère quand même
      // Cela permet de gérer les cas où les horloges des systèmes sont légèrement désynchronisées
      if (expirationDelta <= 60) {
        console.log('Token expiré récemment (moins de 60s), toléré');
        req.user = decoded;
        req.userId = decoded.userId;
        console.log('Données utilisateur extraites du token:', {
          reqUser: JSON.stringify(req.user),
          reqUserId: req.userId,
          decodedUserId: decoded.userId
        });
        next();
        return;
      }
      
      console.log('Token expiré (plus de 60s) - mais on continue la requête');
      req.authFailed = true;
      req.authError = "TOKEN_EXPIRED";
      next();
      return;
    }

    // Stocker les informations de l'utilisateur pour la suite de la requête
    req.user = decoded;
    
    // S'assurer que req.userId est également défini pour la compatibilité
    req.userId = decoded.userId;
    
    // Log détaillé pour déboguer
    console.log('Données utilisateur extraites du token:', {
      reqUser: JSON.stringify(req.user),
      reqUserId: req.userId,
      decodedUserId: decoded.userId
    });
    
    next();
  } catch (error) {
    console.error('Erreur détaillée lors de l\'authentification:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt
    });

    // Au lieu de bloquer avec une erreur 401, on continue mais on indique que l'auth a échoué
    req.authFailed = true;
    req.authError = error.name === 'TokenExpiredError' ? "TOKEN_EXPIRED" : 
                    error.name === 'JsonWebTokenError' ? "INVALID_TOKEN" : 
                    error.message;
    
    console.log('Erreur d\'authentification - mais on continue la requête');
    next();
  }
};

/**
 * Middleware d'authentification standard
 * Décode le token et vérifie que l'utilisateur est connecté
 */
export const auth = async (req, res, next) => {
  try {
    console.log('Vérification d\'authentification standard');
    
    // Récupérer le header d'autorisation
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Aucun header d\'autorisation trouvé');
      return res.status(401).json({ message: "Authentification requise" });
    }

<<<<<<< HEAD
=======
    // Extraire le token
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token non trouvé dans le header d\'autorisation');
      return res.status(401).json({ message: "Token d'authentification manquant" });
    }

<<<<<<< HEAD
=======
    // Vérifier et décoder le token
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    console.log('Token trouvé, tentative de vérification');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token décodé avec succès:', {
      userId: decoded.userId,
      role: decoded.role
    });

<<<<<<< HEAD
=======
    // Stocker les informations de l'utilisateur pour la suite de la requête
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur détaillée lors de l\'authentification:', {
      name: error.name,
      message: error.message,
<<<<<<< HEAD
      expiredAt: error.expiredAt,
      stack: error.stack
=======
      expiredAt: error.expiredAt
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Votre session a expiré. Veuillez vous reconnecter.",
        error: "TOKEN_EXPIRED"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Token invalide. Veuillez vous reconnecter.",
        error: "INVALID_TOKEN"
      });
    }

    res.status(401).json({ 
      message: "Erreur d'authentification",
      error: error.message
    });
  }
};
 
<<<<<<< HEAD
export const adminAuth = async (req, res, next) => {
  try {
    console.log('Vérification des droits administrateur');
    console.log('Headers reçus:', req.headers);
    
=======
/**
 * Middleware d'authentification administrateur
 * Décode le token et vérifie que l'utilisateur a le rôle d'administrateur
 */
export const adminAuth = async (req, res, next) => {
  try {
    console.log('Vérification des droits administrateur');
    
    // Récupérer le header d'autorisation
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Aucun header d\'autorisation trouvé');
      return res.status(401).json({ message: "Authentification requise" });
    }

<<<<<<< HEAD
=======
    // Extraire le token
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token non trouvé dans le header d\'autorisation');
      return res.status(401).json({ message: "Token d'authentification manquant" });
    }

<<<<<<< HEAD
=======
    // Vérifier et décoder le token
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    console.log('Token trouvé, tentative de vérification');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token décodé avec succès:', {
      userId: decoded.userId,
      role: decoded.role
    });

    // Vérification plus robuste du rôle admin (insensible à la casse)
    const userRole = decoded.role || '';
    const isAdmin = userRole.toLowerCase() === 'admin';
    
    console.log('Rôle brut:', userRole);
    console.log('Est admin:', isAdmin);
    
    if (!isAdmin) {
      console.log('Tentative d\'accès administrateur non autorisée');
      return res.status(403).json({ 
        message: "Accès non autorisé. Droits d'administrateur requis.",
        error: "INSUFFICIENT_PERMISSIONS"
      });
    }

<<<<<<< HEAD
=======
    // Stocker les informations de l'utilisateur pour la suite de la requête
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur détaillée lors de l\'authentification admin:', {
      name: error.name,
      message: error.message,
<<<<<<< HEAD
      expiredAt: error.expiredAt,
      stack: error.stack
=======
      expiredAt: error.expiredAt
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Votre session a expiré. Veuillez vous reconnecter.",
        error: "TOKEN_EXPIRED"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: "Token invalide. Veuillez vous reconnecter.",
        error: "INVALID_TOKEN"
      });
    }

    res.status(401).json({ 
      message: "Erreur d'authentification",
      error: error.message
    });
  }
}; 