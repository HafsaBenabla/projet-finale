import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Extraire le paramètre de redirection de l'URL si présent
  const queryParams = new URLSearchParams(location.search);
  const redirectFromQuery = queryParams.get('redirect') || '/';
  
  // Vérifier s'il y a une redirection stockée dans localStorage
  const redirectFromStorage = localStorage.getItem('redirectAfterLogin');
  
  // Utiliser la redirection stockée si elle existe, sinon celle de l'URL
  const redirectPath = redirectFromStorage || redirectFromQuery;

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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/register" className="font-medium text-sahara hover:text-sahara/90">
            créez un nouveau compte
          </Link>
        </p>
        {redirectPath !== '/' && (
          <p className="mt-2 text-center text-sm text-gray-500">
            Connexion requise pour continuer votre action
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sahara focus:border-sahara sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sahara focus:border-sahara sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sahara hover:bg-sahara/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sahara ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
