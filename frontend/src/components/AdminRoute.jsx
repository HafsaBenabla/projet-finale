import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Composant pour protéger les routes administratives
 * Redirige vers la page d'accueil si l'utilisateur n'est pas admin
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();

  console.log('AdminRoute: Vérification des permissions administrateur', {
    isAuthenticated,
    isAdmin,
    user: user ? { email: user.email, isAdmin: user.isAdmin } : null,
    loading
  });

  // Afficher un indicateur de chargement pendant la vérification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sahara mb-4"></div>
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est authentifié et administrateur
  if (!isAuthenticated || !isAdmin) {
    console.log('AdminRoute: Accès refusé - utilisateur non authentifié ou non administrateur', {
      isAuthenticated,
      isAdmin
    });
    
    // Rediriger vers la page d'accueil
    return <Navigate to="/" replace />;
  }

  // L'utilisateur est administrateur, afficher le contenu protégé
  console.log('AdminRoute: Accès autorisé - utilisateur administrateur');
  return children;
};

export default AdminRoute; 