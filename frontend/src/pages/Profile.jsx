import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaPhone } from 'react-icons/fa';

const Profile = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState({
    voyages: [],
    activites: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      console.log('=== Vérification de l\'authentification dans Profile ===', {
        isAuthenticated,
        user: user,
        token: token ? 'Présent' : 'Absent',
        userId: user?.userId
      });
      
      if (!isAuthenticated || !user?.userId) {
        console.log('Redirection vers login - État:', { 
          isAuthenticated, 
          userId: user?.userId,
          user: user 
        });
        navigate('/login');
        return false;
      }
      return true;
    };

    const fetchReservations = async () => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        console.log('=== Tentative de récupération des réservations ===', {
          userId: user.userId,
          token,
          userDetails: user
        });

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Récupération des réservations de voyages
        const voyagesUrl = `http://localhost:5000/api/reservations/voyages/${user.userId}`;
        console.log('Envoi de la requête pour les voyages à:', voyagesUrl);
        console.log('Headers de la requête:', config.headers);
        
        const voyagesResponse = await axios.get(voyagesUrl, config);
        console.log('=== Réponse des réservations de voyages ===');
        console.log('Status:', voyagesResponse.status);
        console.log('Headers:', voyagesResponse.headers);
        console.log('Données:', voyagesResponse.data);

        // Récupération des réservations d'activités
        const activitesUrl = `http://localhost:5000/api/reservations/activites/${user.userId}`;
        console.log('Envoi de la requête pour les activités à:', activitesUrl);
        
        const activitesResponse = await axios.get(activitesUrl, config);
        console.log('=== Réponse des réservations d\'activités ===');
        console.log('Status:', activitesResponse.status);
        console.log('Données:', activitesResponse.data);
        
        setReservations({
          voyages: Array.isArray(voyagesResponse.data) ? voyagesResponse.data : [],
          activites: Array.isArray(activitesResponse.data) ? activitesResponse.data : []
        });
        
        console.log('=== État final des réservations ===', {
          voyages: voyagesResponse.data,
          activites: activitesResponse.data
        });
        
        setError(null);
      } catch (err) {
        console.error('=== Erreur détaillée lors de la récupération des réservations ===', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config,
          user: user,
          token: token ? 'Présent' : 'Absent'
        });
        
        if (err.response?.status === 401) {
          setError("Votre session a expiré. Veuillez vous reconnecter.");
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (err.message === 'Network Error') {
          setError("Impossible de se connecter au serveur. Veuillez vérifier que le serveur backend est en cours d'exécution.");
        } else {
          setError(err.response?.data?.message || "Une erreur est survenue lors de la récupération de vos réservations");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated, user, token, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Chargement de votre profil...</p>
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-center text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section du profil utilisateur */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Photo de profil */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="w-16 h-16 text-orange-500" />
                )}
              </div>
            </div>

            {/* Informations de l'utilisateur */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{user?.username || 'Utilisateur'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-800">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="text-gray-800">{user?.phone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section des réservations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Mes Réservations</h3>
          
          {/* Voyages réservés */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Voyages</h4>
            {reservations.voyages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.voyages.map((reservation) => (
                  <div key={reservation._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    {reservation.voyage?.image && (
                      <div className="w-full h-40 mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={reservation.voyage.image} 
                          alt={reservation.voyage.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h5 className="font-semibold text-lg text-orange-600 mb-2">
                      {reservation.voyage?.title || 'Voyage sans titre'}
                    </h5>
                    <div className="space-y-2">
                      <p className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2" />
                        {reservation.voyage?.destination || 'Destination non spécifiée'}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2" />
                        {new Date(reservation.dateReservation).toLocaleDateString()}
                      </p>
                      <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium
                        ${reservation.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                          reservation.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {reservation.statut}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4 bg-gray-50 rounded-lg">
                Vous n'avez pas encore réservé de voyage.
              </p>
            )}
          </div>

          {/* Activités réservées */}
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-4">Activités</h4>
            {reservations.activites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.activites.map((reservation) => (
                  <div key={reservation._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    {reservation.activite?.image && (
                      <div className="w-full h-32 mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={reservation.activite.image} 
                          alt={reservation.activite.titre} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h5 className="font-semibold text-lg text-orange-600 mb-2">
                      {reservation.activite?.titre || 'Activité sans titre'}
                    </h5>
                    <div className="space-y-2">
                      <p className="flex items-center text-gray-600">
                        <FaMapMarkerAlt className="mr-2" />
                        {reservation.activite?.lieu || 'Lieu non spécifié'}
                      </p>
                      <p className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2" />
                        {new Date(reservation.dateReservation).toLocaleDateString()}
                      </p>
                      <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium
                        ${reservation.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                          reservation.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}">
                        {reservation.statut}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4 bg-gray-50 rounded-lg">
                Vous n'avez pas encore réservé d'activité.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 