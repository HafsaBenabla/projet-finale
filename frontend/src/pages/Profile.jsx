import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaPhone, FaTrash, FaSpinner } from 'react-icons/fa';
import './ProfileStyles.css';

const Profile = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState({
    voyages: [],
    activites: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // État pour suivre les annulations en cours
  const [cancelingReservations, setCancelingReservations] = useState([]);
  // État pour les messages de confirmation
  const [notification, setNotification] = useState({ message: '', type: '' });
  // Référence pour la barre de progression
  const progressBarRef = useRef(null);

  // Effet pour animer la barre de progression lorsqu'une notification est affichée
  useEffect(() => {
    if (notification.message && progressBarRef.current) {
      // Forcer un reflow pour que la transition s'applique
      progressBarRef.current.offsetWidth;
      // Ajouter la classe d'animation
      progressBarRef.current.classList.add('progress-bar-animate');
    }
  }, [notification]);

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

  // Fonction pour annuler une réservation
  const handleCancelReservation = async (reservationId, type) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    // Ajouter l'ID à la liste des annulations en cours
    setCancelingReservations(prev => [...prev, reservationId]);

    try {
      console.log('Tentative d\'annulation de la réservation avec axios.patch:', reservationId);

      // Utiliser axios.patch avec la route "/:id/annuler" dont nous savons qu'elle est fonctionnelle
      const response = await axios.patch(
        `http://localhost:5000/api/reservations/${reservationId}/annuler`, 
        {}, // Corps vide
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Réservation annulée avec succès:', response.data);

      // Récupérer les détails de la réservation avant de la supprimer de l'état
      const reservation = reservations[type].find(r => r._id === reservationId);
      
      // Fallback au cas où la réservation n'existe pas dans l'état local
      const reservationTitle = reservation 
        ? (type === 'voyages' 
            ? reservation.voyage?.title || 'ce voyage' 
            : reservation.activite?.titre || 'cette activité')
        : 'cette réservation';

      // Mettre à jour la liste des réservations en la retirant localement
      setReservations(prev => ({
        ...prev,
        [type]: prev[type].filter(r => r._id !== reservationId)
      }));

      // Afficher un message de confirmation
      setNotification({ 
        message: `Votre réservation pour "${reservationTitle}" a été annulée avec succès.`, 
        type: 'success',
        details: 'La réservation a été supprimée et les places ont été libérées.',
        timestamp: new Date().toLocaleTimeString()
      });

      // Effacer le message après 5 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 5000);

    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      
      let errorMessage = 'Échec de l\'annulation de la réservation';
      let errorDetails = '';
      
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de se connecter au serveur';
        errorDetails = 'Vérifiez que le serveur backend est en cours d\'exécution.';
      } else if (err.response) {
        errorMessage = `Erreur ${err.response.status}`;
        errorDetails = err.response.data?.message || 'Erreur lors du traitement de la demande.';
      } else {
        errorDetails = err.message;
      }
      
      // Afficher une notification d'erreur
      setNotification({ 
        message: errorMessage, 
        type: 'error',
        details: errorDetails,
        timestamp: new Date().toLocaleTimeString()
      });

      // Effacer le message après 8 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 8000);
    } finally {
      // Retirer l'ID de la liste des annulations en cours
      setCancelingReservations(prev => prev.filter(id => id !== reservationId));
    }
  };

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

        {/* Notification */}
        {notification.message && (
          <div 
            className={`mb-6 p-4 rounded-lg border shadow-md relative overflow-hidden notification-enter notification-active ${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-300 text-green-800' 
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            {/* Barre de progression */}
            <div 
              ref={progressBarRef}
              className={`progress-bar ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            
            {/* Icône de notification */}
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${
                notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {notification.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-md font-semibold mb-1">
                  {notification.type === 'success' ? 'Opération réussie' : 'Erreur'}
                </h4>
                <p className="mb-1">{notification.message}</p>
                {notification.details && (
                  <p className="text-sm opacity-80">{notification.details}</p>
                )}
                <p className="text-xs opacity-60 mt-2">{notification.timestamp}</p>
              </div>
            </div>
          </div>
        )}

        {/* Section des réservations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Mes Réservations</h3>
          
          {/* Voyages réservés */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-700 mb-4">Voyages</h4>
            {reservations.voyages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.voyages.map((reservation) => (
                  <div key={reservation._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white relative reservation-card">
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
                      
                      {/* Bouton d'annulation */}
                      {reservation.statut !== 'annulé' && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id, 'voyages')}
                          disabled={cancelingReservations.includes(reservation._id)}
                          className="mt-3 flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50 cancel-button"
                        >
                          {cancelingReservations.includes(reservation._id) ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Annulation...
                            </>
                          ) : (
                            <>
                              <FaTrash className="mr-2" />
                              Annuler la réservation
                            </>
                          )}
                        </button>
                      )}
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
                  <div key={reservation._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white reservation-card">
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
                      <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium
                        ${reservation.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                          reservation.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {reservation.statut}
                      </div>
                      
                      {/* Bouton d'annulation */}
                      {reservation.statut !== 'annulé' && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id, 'activites')}
                          disabled={cancelingReservations.includes(reservation._id)}
                          className="mt-3 flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50 cancel-button"
                        >
                          {cancelingReservations.includes(reservation._id) ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Annulation...
                            </>
                          ) : (
                            <>
                              <FaTrash className="mr-2" />
                              Annuler la réservation
                            </>
                          )}
                        </button>
                      )}
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