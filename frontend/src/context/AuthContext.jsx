import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Définition de l'email administrateur pour toute l'application
  const ADMIN_EMAIL = 'benablahafsa@gmail.com';
  
  // États initiaux simplifiés
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Initialisation au chargement du composant
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Récupérer token et user depuis localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('AuthProvider: Initialisation de l\'authentification');
        
        if (!storedToken || !storedUser) {
          console.log('AuthProvider: Aucune donnée d\'authentification trouvée');
          setLoading(false);
          return;
        }
        
        try {
          // Vérifier si les données utilisateur sont valides
          const parsedUser = JSON.parse(storedUser);
          
          // Vérifier le statut admin
          const isAdmin = parsedUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
          
          // Mettre à jour l'état avec les données stockées
          setToken(storedToken);
          setUser({ ...parsedUser, isAdmin });
          setIsAuthenticated(true);
          
          console.log('AuthProvider: Authentification initialisée depuis localStorage');
          
          // Vérifier avec le backend en arrière-plan (ne bloque pas le chargement)
          validateTokenWithBackend(storedToken);
        } catch (error) {
          console.error('AuthProvider: Erreur de parsing des données utilisateur:', error);
          resetAuthState();
        }
      } catch (error) {
        console.error('AuthProvider: Erreur lors de l\'initialisation:', error);
        resetAuthState();
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Fonction pour valider le token avec le backend
  const validateTokenWithBackend = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.log('AuthProvider: Token invalide selon le backend');
        resetAuthState();
        return;
      }
      
      const { user: userData } = await response.json();
      
      // Vérifier si l'utilisateur est administrateur
      const isAdmin = userData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      // Mettre à jour avec les données fraîches du backend
      const updatedUser = { 
        ...userData, 
        isAdmin,
        userId: userData.id || userData._id
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('AuthProvider: Token validé avec le backend');
    } catch (error) {
      console.error('AuthProvider: Erreur lors de la validation du token:', error);
      // On ne réinitialise pas l'état en cas d'erreur de connexion pour permettre
      // à l'application de fonctionner même hors ligne
    }
  };
  
  // Fonction pour réinitialiser l'état d'authentification
  const resetAuthState = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const login = (userData, newToken) => {
    if (!userData || !newToken) {
      console.error('AuthProvider: Données de connexion invalides');
      return;
    }
    
    try {
      // Vérifier le statut admin
      const isAdmin = userData.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      
      // Normaliser les données utilisateur
      const normalizedUser = { 
        ...userData, 
        isAdmin,
        userId: userData._id || userData.id || userData.userId
      };
      
      // Mettre à jour l'état
      setUser(normalizedUser);
      setToken(newToken);
      setIsAuthenticated(true);
      setAuthError(null);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('token', newToken);
      
      console.log('AuthProvider: Utilisateur connecté avec succès');
    } catch (error) {
      console.error('AuthProvider: Erreur lors de la connexion:', error);
      setAuthError('Erreur lors de la connexion');
    }
  };

  const logout = () => {
    console.log('AuthProvider: Déconnexion');
    resetAuthState();
  };

  // Fonction pour mettre à jour les informations de l'utilisateur
  const updateUserProfile = (updatedUserData) => {
    try {
      if (!user || !updatedUserData) {
        throw new Error('Données utilisateur manquantes');
      }
      
      // Préserver les propriétés importantes
      const updatedUser = {
        ...updatedUserData,
        userId: user.userId || user._id || user.id,
        isAdmin: updatedUserData.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('AuthProvider: Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading,
      isAuthenticated,
      authError,
      updateUserProfile,
      isAdmin: user?.isAdmin || false,
      adminEmail: ADMIN_EMAIL
    }}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="ml-3">Chargement...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
}; 