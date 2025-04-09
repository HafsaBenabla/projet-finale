import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

/**
 * Middleware de vérification du token JWT
 * Décode le token et ajoute les informations de l'utilisateur à l'objet req
 * Version plus tolérante qui ne bloque pas la requête en cas d'erreur
 */
export const verifyToken = async (req, res, next) => {
  console.log('--- Vérification du token ---');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Header d\'autorisation:', authHeader);
  
  if (!authHeader) {
    console.log('Aucun header d\'autorisation trouvé');
    req.authFailed = true;
    req.authError = 'NO_AUTH_HEADER';
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Token introuvable dans le header');
    req.authFailed = true;
    req.authError = 'NO_TOKEN_PROVIDED';
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token vérifié avec succès:', decoded);
    
    // Extraire les données utilisateur du token
    const userData = decoded;
    console.log('Données utilisateur extraites:', userData);
    
    // Stocker l'utilisateur dans la requête
    req.user = decoded;
    // Ajouter explicitement req.userId pour faciliter l'accès
    req.userId = decoded.userId;
    
    console.log('UserId extrait:', req.userId);
    console.log('Authentification réussie pour l\'utilisateur:', req.user.username || req.user.email || req.userId);
    next();
  } catch (error) {
    console.log('Erreur lors de la vérification du token:', error.message);
    
    // Gérer l'expiration du token
    if (error.name === 'TokenExpiredError') {
      const decodedToken = jwt.decode(token);
      console.log('Token expiré:', decodedToken);
      
      const expiryTime = new Date(decodedToken.exp * 1000);
      const currentTime = new Date();
      const timeDiff = (currentTime - expiryTime) / 1000;
      
      console.log(`Token expiré depuis ${timeDiff} secondes`);
      
      // Si le token est expiré depuis moins de 60 secondes, on continue quand même
      if (timeDiff < 60) {
        console.log('Token expiré depuis moins de 60 secondes, on continue');
        req.user = decodedToken;
        // Ajouter également req.userId pour les tokens récemment expirés
        req.userId = decodedToken.userId;
        console.log('UserId extrait (token expiré):', req.userId);
        req.tokenExpired = true;
        return next();
      }
      
      req.authFailed = true;
      req.authError = 'TOKEN_EXPIRED';
      return next();
    }
    
    console.log('Erreur d\'authentification:', error);
    req.authFailed = true;
    req.authError = error.message;
    next();
  }
};

/**
 * Middleware d'authentification standard
 * Décode le token et vérifie que l'utilisateur est connecté
 */
export const auth = async (req, res, next) => {
  console.log('=== Middleware d\'authentification standard ===');
  
  const authHeader = req.headers['authorization'];
  console.log('Header d\'autorisation:', authHeader);
  
  if (!authHeader) {
    console.log('Aucun header d\'autorisation trouvé');
    return res.status(401).json({ message: 'Aucun token d\'authentification trouvé', error: 'NO_AUTH_HEADER' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Token introuvable dans le header');
    return res.status(401).json({ message: 'Token non fourni', error: 'NO_TOKEN_PROVIDED' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token vérifié avec succès:', decoded);
    
    // Stocker l'utilisateur dans la requête
    req.user = decoded;
    // Définir explicitement req.userId
    req.userId = decoded.userId;
    
    console.log('UserId extrait:', req.userId);
    console.log('Authentification réussie pour l\'utilisateur:', req.user.username || req.user.email || req.userId);
    next();
  } catch (error) {
    console.log('Erreur lors de la vérification du token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré', error: 'TOKEN_EXPIRED' });
    }
    
    return res.status(401).json({ message: 'Token invalide', error: error.message });
  }
};
 
/**
 * Middleware d'authentification administrateur
 * Décode le token et vérifie que l'utilisateur a le rôle d'administrateur
 */
export const adminAuth = async (req, res, next) => {
  console.log('=== Middleware d\'authentification admin ===');
  
  const authHeader = req.headers['authorization'];
  console.log('Header d\'autorisation:', authHeader);
  
  if (!authHeader) {
    console.log('Aucun header d\'autorisation trouvé');
    return res.status(401).json({ message: 'Aucun token d\'authentification trouvé', error: 'NO_AUTH_HEADER' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Token introuvable dans le header');
    return res.status(401).json({ message: 'Token non fourni', error: 'NO_TOKEN_PROVIDED' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token vérifié avec succès:', decoded);
    
    // Vérifier si l'utilisateur est admin
    if (decoded.role !== 'admin') {
      console.log('Accès refusé: l\'utilisateur n\'est pas admin');
      return res.status(403).json({ message: 'Accès refusé', error: 'NOT_ADMIN' });
    }
    
    // Stocker l'utilisateur dans la requête
    req.user = decoded;
    // Définir explicitement req.userId
    req.userId = decoded.userId;
    
    console.log('UserId extrait (admin):', req.userId);
    console.log('Authentification admin réussie pour l\'utilisateur:', req.user.username || req.user.email || req.userId);
    next();
  } catch (error) {
    console.log('Erreur lors de la vérification du token admin:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré', error: 'TOKEN_EXPIRED' });
    }
    
    return res.status(401).json({ message: 'Token invalide', error: error.message });
  }
}; 