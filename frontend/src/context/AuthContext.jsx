import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Vérifier le token et l'utilisateur au chargement
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          // Vérifier la validité du token avec le backend
          const response = await fetch('http://localhost:5000/api/auth/verify-token', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const { user: userData } = await response.json();
            // Mapper l'ID utilisateur
            const mappedUser = {
              ...userData,
              userId: userData.id // Mapper id vers userId
            };
            setUser(mappedUser);
            setToken(storedToken);
            localStorage.setItem('user', JSON.stringify(mappedUser));
            console.log('Authentification vérifiée avec succès:', { mappedUser, token: storedToken });
          } else {
            console.log('Token invalide, déconnexion...');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          }
        } else {
          console.log('Aucun token trouvé dans le localStorage');
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (userData, newToken) => {
    console.log('Login appelé avec:', { userData, token: newToken });
    // Mapper l'ID utilisateur
    const mappedUser = {
      ...userData,
      userId: userData.id // Mapper id vers userId
    };
    setUser(mappedUser);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    console.log('Logout appelé');
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Exposer l'état d'authentification pour le débogage
  useEffect(() => {
    console.log('État d\'authentification mis à jour:', {
      isAuthenticated: !!user && !!token,
      user,
      hasToken: !!token
    });
  }, [user, token]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!user && !!token 
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