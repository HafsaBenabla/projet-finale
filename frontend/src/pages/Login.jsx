import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Extraire le paramètre de redirection de l'URL si présent
  const queryParams = new URLSearchParams(location.search);
  const redirectFromQuery = queryParams.get('redirect') || '/';
  const successParam = queryParams.get('success');
  
  // Vérifier s'il y a une redirection stockée dans localStorage
  const redirectFromStorage = localStorage.getItem('redirectAfterLogin');
  
  // Utiliser la redirection stockée si elle existe, sinon celle de l'URL
  const redirectPath = redirectFromStorage || redirectFromQuery;

  // Vérifier le paramètre de succès pour l'inscription
  useEffect(() => {
    if (successParam === 'registered') {
      setSuccess('Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.');
      // Nettoyer l'URL pour ne pas afficher le message à chaque visite
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl);
    }
  }, [successParam]);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Login: Utilisateur déjà connecté, redirection vers:', redirectPath);
      
      // Nettoyer la redirection stockée dans localStorage après l'avoir utilisée
      if (redirectFromStorage) {
        localStorage.removeItem('redirectAfterLogin');
      }
      
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath, redirectFromStorage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    console.log('Login: Tentative de connexion avec:', formData);

    try {
      console.log('Login: Envoi de la requête au serveur...');
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`;
      console.log('URL de l\'API:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      console.log('Login: Réponse reçue:', {
        status: response.status,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log('Login: Données reçues:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
      }

      console.log('Login: Connexion réussie, données utilisateur:', data.user);
      
      // Vérifier si les données utilisateur sont complètes
      if (!data.user || !data.token) {
        console.error('Login: Données de connexion incomplètes:', { user: data.user, token: data.token ? 'présent' : 'absent' });
        throw new Error('Données d\'authentification incomplètes');
      }
      
      // Vérifier si c'est un administrateur
      const adminEmail = 'benablahafsa@gmail.com';
      const isAdmin = data.user.email.toLowerCase() === adminEmail.toLowerCase();
      console.log('Login: Vérification administrateur:', { 
        userEmail: data.user.email,
        adminEmail,
        isAdmin
      });
      
      // Utiliser la fonction login du contexte
      login(data.user, data.token);
      console.log('Login: État de connexion mis à jour, redirection...');
      
      // Nettoyer la redirection stockée
      if (redirectFromStorage) {
        localStorage.removeItem('redirectAfterLogin');
      }
      
      // Rediriger vers la page d'origine (si une redirection est spécifiée) ou vers la page appropriée
      if (isAdmin && redirectPath === '/') {
        console.log('Login: Redirection vers le dashboard (utilisateur admin)');
        navigate('/admin/dashboard');
      } else {
        console.log(`Login: Redirection vers ${redirectPath}`);
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Login: Erreur détaillée lors de la connexion:', error);
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          <span className="block text-orange-600 mb-1">Bienvenue</span>
          <span className="block">Connectez-vous</span>
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="exemple@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Votre mot de passe"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center w-full justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors duration-300 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Pas encore de compte ?{' '}
                  <Link to="/register" className="font-medium text-orange-500 hover:text-orange-600">
                    S'inscrire
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
