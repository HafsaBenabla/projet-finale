import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Définition de l'email administrateur pour toute l'application
  const ADMIN_EMAIL = 'benablahafsa@gmail.com';
  
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      console.log('AuthProvider: Tentative de récupération de l\'utilisateur depuis localStorage:', storedUser);
      if (!storedUser) return null;
      
      const parsedUser = JSON.parse(storedUser);
      console.log('AuthProvider: Utilisateur parsé:', parsedUser);
      
      // Vérifier si l'utilisateur est administrateur
      if (parsedUser && parsedUser.email) {
        const isAdmin = parsedUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        console.log('AuthProvider: Vérification admin:', { 
          email: parsedUser.email, 
          adminEmail: ADMIN_EMAIL,
          isAdmin 
        });
        
        // Ajouter la propriété isAdmin à l'objet utilisateur
        return { ...parsedUser, isAdmin };
      }
      
      return parsedUser;
    } catch (error) {
      console.error('AuthProvider: Erreur lors de la récupération de l\'utilisateur depuis localStorage:', error);
      localStorage.removeItem('user'); // Nettoyer en cas d'erreur
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Vérifier si un token est présent dans le localStorage
    const token = localStorage.getItem('token');
    console.log('AuthProvider: Token de connexion:', token ? 'présent' : 'absent');
    return !!token && !!user;
  });
  const [authError, setAuthError] = useState(null);

  // Vérifier le token et l'utilisateur au chargement
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        console.log('AuthProvider: Vérification du token:', storedToken ? 'présent' : 'absent');
        
        if (storedToken) {
          // Vérifier la validité du token avec le backend
          console.log('AuthProvider: Tentative de vérification du token avec le backend...');
          const response = await fetch('http://localhost:5000/api/auth/verify-token', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const { user: userData } = await response.json();
            console.log('AuthProvider: Utilisateur authentifié:', userData);
            
            // Mapper l'ID utilisateur
            const mappedUser = {
              ...userData,
              userId: userData.id // Mapper id vers userId
            };
            
            // Vérifier si l'utilisateur est administrateur
            const isAdmin = userData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            console.log('AuthProvider: Vérification admin:', { 
              email: userData.email, 
              adminEmail: ADMIN_EMAIL,
              isAdmin 
            });
            
            // Ajouter la propriété isAdmin à l'objet utilisateur
            const userWithAdmin = { ...mappedUser, isAdmin };
            
            setUser(userWithAdmin);
            setToken(storedToken);
            localStorage.setItem('user', JSON.stringify(userWithAdmin));
            localStorage.setItem('token', storedToken);
            console.log('AuthProvider: Authentification vérifiée avec succès', { userWithAdmin });
            setIsAuthenticated(true);
          } else {
            console.log('AuthProvider: Token invalide, déconnexion...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('AuthProvider: Aucun token trouvé dans le localStorage');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('AuthProvider: Erreur lors de la vérification du token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (userData, newToken) => {
    console.log('AuthProvider: Login appelé avec:', { userData, token: newToken });
    
    if (!userData || !newToken) {
      console.error('AuthProvider: Tentative de connexion avec des données invalides:', { userData, newToken });
      return;
    }
    
    try {
      // Vérifier si l'utilisateur est administrateur
      const isAdmin = userData.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      console.log('AuthProvider: Vérification admin lors de la connexion:', { 
        email: userData.email, 
        adminEmail: ADMIN_EMAIL,
        isAdmin 
      });
      
      // Ajouter la propriété isAdmin et userId à l'objet utilisateur
      const userWithAdmin = { 
        ...userData, 
        isAdmin,
        userId: userData._id || userData.id // Normaliser l'ID
      };
      
      console.log('AuthProvider: Stockage des données utilisateur:', userWithAdmin);
      setUser(userWithAdmin);
      setToken(newToken);
      
      // Stocker dans localStorage
      localStorage.setItem('user', JSON.stringify(userWithAdmin));
      localStorage.setItem('token', newToken);
      
      console.log('AuthProvider: Utilisateur connecté avec succès');
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('AuthProvider: Erreur lors de la connexion:', error);
      setAuthError(error.message);
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logout appelé');
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('AuthProvider: Utilisateur déconnecté avec succès');
    setIsAuthenticated(false);
    setAuthError(null);
  };

  // Fonction pour mettre à jour les informations de l'utilisateur
  const updateUserProfile = (updatedUserData) => {
    console.log('AuthProvider: Mise à jour du profil utilisateur:', updatedUserData);
    
    if (!updatedUserData) {
      throw new Error('Données utilisateur manquantes pour la mise à jour');
    }
    
    // Conserver l'ID et le statut admin
    const userId = user?.userId || user?._id || user?.id;
    const isAdmin = user?.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    
    // Mettre à jour l'utilisateur avec les nouvelles données tout en préservant userId et isAdmin
    const updatedUser = {
      ...updatedUserData,
      userId,
      isAdmin
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    console.log('AuthProvider: Profil utilisateur mis à jour:', updatedUser);
    return updatedUser;
  };

  // Exposer l'état d'authentification pour le débogage
  useEffect(() => {
    const authState = {
      isAuthenticated,
      user: user ? { 
        ...user, 
        email: user.email,
        isAdmin: user.isAdmin 
      } : null,
      hasToken: !!token
    };
    
    console.log('AuthProvider: État d\'authentification mis à jour:', authState);
    
    // Vérifier si les données utilisateur sont cohérentes
    if (!!token && !user) {
      console.warn('AuthProvider: Incohérence détectée - Token présent mais utilisateur absent');
    }
    if (!token && isAuthenticated) {
      console.warn('AuthProvider: INCOHÉRENCE - Authentifié mais token absent');
      setIsAuthenticated(false);
    }
  }, [isAuthenticated, user, token]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      <p className="ml-3">Chargement de l'authentification...</p>
    </div>;
  }

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
      isAdmin: user?.isAdmin || false
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 