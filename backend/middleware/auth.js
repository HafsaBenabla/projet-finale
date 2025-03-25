import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

export const auth = async (req, res, next) => {
  try {
    console.log('Vérification du token d\'authentification');
    console.log('Headers reçus:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Aucun header d\'autorisation trouvé');
      return res.status(401).json({ message: "Authentification requise" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token non trouvé dans le header d\'autorisation');
      return res.status(401).json({ message: "Token d'authentification manquant" });
    }

    console.log('Token trouvé, tentative de vérification');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token décodé avec succès:', {
      userId: decoded.userId,
      role: decoded.role
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur détaillée lors de l\'authentification:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
      stack: error.stack
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
 
export const adminAuth = async (req, res, next) => {
  try {
    console.log('Vérification des droits administrateur');
    console.log('Headers reçus:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Aucun header d\'autorisation trouvé');
      return res.status(401).json({ message: "Authentification requise" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token non trouvé dans le header d\'autorisation');
      return res.status(401).json({ message: "Token d'authentification manquant" });
    }

    console.log('Token trouvé, tentative de vérification');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token décodé avec succès:', {
      userId: decoded.userId,
      role: decoded.role
    });

    if (decoded.role !== 'admin') {
      console.log('Tentative d\'accès administrateur non autorisée');
      return res.status(403).json({ 
        message: "Accès non autorisé. Droits d'administrateur requis.",
        error: "INSUFFICIENT_PERMISSIONS"
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur détaillée lors de l\'authentification admin:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
      stack: error.stack
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