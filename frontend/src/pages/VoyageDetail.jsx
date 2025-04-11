import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaInfoCircle, FaWalking, FaCalendarCheck, FaCheck, FaBuilding, FaComment, FaListUl, FaHiking, FaMapSigns, FaStar } from 'react-icons/fa';
import ActivitySelectionCard from '../components/ActivitySelectionCard';
import { useVoyages } from '../context/VoyagesContext';
import { useAuth } from '../context/AuthContext';
import VoyageReactionPanel from '../components/VoyageReactionPanel';
import VoyageComments from '../components/VoyageComments';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import CommentSection from '../components/CommentSection';
import axios from 'axios';

const VoyageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useVoyages();
  const { user, token, isAuthenticated } = useAuth();
  const commentsRef = useRef(null);
  
  // Ajout d'un state pour le voyage et le compteur de commentaires
  const [voyage, setVoyage] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    nombrePersonnes: 1,
    dateDepart: ''
  });

  // Modification temporaire pour tester
  const [selectedActivities, setSelectedActivities] = useState([]);
  
  // Ajout d'un useEffect pour déboguer les changements d'état
  useEffect(() => {
    console.log('selectedActivities a changé:', selectedActivities);
  }, [selectedActivities]);

  const [reservationStatus, setReservationStatus] = useState(null);

  // Ajout d'un state pour les activités disponibles
  const [availableActivities, setAvailableActivities] = useState([]);

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Fonction pour récupérer les détails du voyage
  const fetchVoyageDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/voyages/${id}`);
      setVoyage(response.data);
      
      if (response.data && response.data.activities && response.data.activities.length > 0) {
        setAvailableActivities(response.data.activities);
      }
      
      setCommentCount(response.data.commentCount || 0);
    } catch (err) {
      console.error("Erreur lors de la récupération du voyage:", err);
    }
  };

  useEffect(() => {
    fetchVoyageDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nom: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName 
            ? user.firstName 
            : user.lastName 
              ? user.lastName 
              : '',
        email: user.email || '',
        telephone: user.phone || ''
      }));
    }
  }, [user]);

  // Fonction pour faire défiler jusqu'à la section des commentaires
  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Effet pour gérer la navigation par fragment d'URL
  useEffect(() => {
    // Vérifier si le chargement est terminé et si l'URL contient le fragment #comments
    if (!loading && location.hash === '#comments') {
      scrollToComments();
    }
  }, [loading, location.hash]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Vérifier si le nombre de personnes ne dépasse pas le nombre de places disponibles
    if (name === 'nombrePersonnes' && voyage) {
      const nombrePersonnes = parseInt(value, 10);
      if (nombrePersonnes > voyage.availableSpots) {
        return; // Ne pas mettre à jour si la valeur dépasse le nombre de places disponibles
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivitySelection = (activity) => {
    console.log('Clic sur activité:', activity.name);
    console.log('État actuel selectedActivities:', selectedActivities);
    
    setSelectedActivities(prev => {
      const isSelected = prev.some(a => a._id === activity._id);
      console.log('Cette activité est-elle déjà sélectionnée?', isSelected);
      
      if (isSelected) {
        const newSelection = prev.filter(a => a._id !== activity._id);
        console.log('Après désélection:', newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, activity];
        console.log('Après sélection:', newSelection);
        return newSelection;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setReservationStatus(null);
    setLoadingSubmit(true);
    
    console.log('=== Début de la création de réservation ===', {
      isAuthenticated,
      user,
      token: token ? 'Présent' : 'Absent'
    });
    
    if (!isAuthenticated) {
      console.log('Tentative de réservation sans authentification');
      setReservationStatus({
        type: 'error',
        message: 'Veuillez vous connecter pour effectuer une réservation'
      });
      setLoadingSubmit(false);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    try {
      // Préparer les activités sélectionnées
      const activitiesData = selectedActivities.map(activity => ({
        activityId: activity._id,
        name: activity.name,
        price: activity.price
      }));
      
      const totalPrice = (voyage.price + selectedActivities.reduce((sum, activity) => sum + activity.price, 0)) * formData.nombrePersonnes;
      
      // Construire l'objet de réservation
      const reservationData = {
        userId: user._id,
        voyageId: voyage._id,
        nombrePersonnes: formData.nombrePersonnes,
        dateDepart: formData.dateDepart,
        activities: activitiesData,
        totalPrice: totalPrice,
        clientInfo: {
          firstName: formData.nom.split(' ')[0],
          lastName: formData.nom.split(' ').slice(1).join(' '),
          email: formData.email,
          phone: formData.telephone
        }
      };
      
      console.log('Données de réservation:', reservationData);
      
      // Envoyer la réservation
      const response = await axios.post(
        'http://localhost:5000/api/reservations',
        reservationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Réponse de création de réservation:', response.data);
      
      // Afficher le message de confirmation
      setReservationStatus({
        type: 'success',
        message: 'Votre réservation a été confirmée avec succès! Vous recevrez un email de confirmation.'
      });
      
      // Réinitialiser le formulaire
      setFormData({
        nom: user ? user.firstName + ' ' + user.lastName : '',
        email: user ? user.email : '',
        telephone: user ? user.phone || '' : '',
        nombrePersonnes: 1,
        dateDepart: ''
      });
      
      // Naviguer vers la page des réservations après un délai
      setTimeout(() => {
        navigate('/mes-reservations');
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      
      setReservationStatus({
        type: 'error',
        message: error.response?.data?.message || 'Une erreur est survenue lors de la réservation.'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loading && !voyage) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!voyage) return <ErrorMessage message="Voyage non trouvé" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section avec overlay gradient */}
      <div className="relative h-[60vh]">
        <img 
          src={voyage.image} 
          alt={voyage.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <h1 className="text-5xl font-bold mb-4">{voyage.title}</h1>
            <div className="flex items-center justify-center gap-6 text-xl">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-sahara" />
                {voyage.destination}
              </span>
              <span className="flex items-center gap-2">
                <FaClock className="text-sahara" />
                {voyage.duration} jours
              </span>
              <span className="flex items-center gap-2">
                <FaMoneyBillWave className="text-sahara" />
                {voyage.price} MAD
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FaInfoCircle className="text-sahara" />
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">{voyage.description}</p>
            </div>

            {/* Nouvelle Section: Détails du Voyage (Hébergement, Dates) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FaBuilding className="text-sahara" />
                Détails du séjour
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Détails d'hébergement */}
                <div className="bg-sahara/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-3 text-sahara">Hébergement</h3>
                  {voyage.hebergement ? (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-4">
                        {voyage.hebergementImage && (
                          <img 
                            src={voyage.hebergementImage?.startsWith('http') 
                              ? voyage.hebergementImage 
                              : `http://localhost:5000${voyage.hebergementImage}`} 
                            alt={voyage.hebergement}
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg';
                            }}
                          />
                        )}
                        <div className="text-center w-full">
                          <h4 className="font-medium text-xl text-gray-900">{voyage.hebergement}</h4>
                          <p className="text-sm text-gray-600 mt-1">{voyage.typeHebergement || 'Hébergement standard'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center gap-4">
                        <img 
                          src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg"
                          alt="Hébergement standard"
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <div className="text-center w-full">
                          <h4 className="font-medium text-xl text-gray-900">Hébergement inclus</h4>
                          <p className="text-sm text-gray-600 mt-1">Logement confortable pendant votre séjour</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Dates et durée */}
                <div className="bg-sahara/5 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-3 text-sahara">Dates et durée</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-sahara/20 p-2 rounded-full">
                        <FaCalendarAlt className="text-sahara" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Durée</span>
                        <p className="font-medium">{voyage.duration} jour{voyage.duration > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="bg-sahara/20 p-2 rounded-full">
                        <FaCalendarAlt className="text-sahara" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Départ</span>
                        <p className="font-medium">
                          {voyage.departureDate 
                            ? new Date(voyage.departureDate).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                            : 'Départs flexibles'}
                        </p>
                      </div>
                    </div>
                    
                    {voyage.returnDate && (
                      <div className="flex items-center gap-2">
                        <div className="bg-sahara/20 p-2 rounded-full">
                          <FaCalendarAlt className="text-sahara" />
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Retour</span>
                          <p className="font-medium">
                            {new Date(voyage.returnDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {voyage.availableSpots && (
                      <div className="mt-4 pt-3 border-t border-sahara/20">
                        <div className="flex items-center gap-2">
                          <div className="bg-sahara/20 p-2 rounded-full">
                            <FaUsers className="text-sahara" />
                          </div>
                          <div>
                            <span className="font-medium">{voyage.availableSpots} place{voyage.availableSpots > 1 ? 's' : ''} disponible{voyage.availableSpots > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Inclusions et exclusions */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ce qui est inclus */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Ce qui est inclus</h3>
                  <ul className="space-y-2">
                    {voyage.inclusions && voyage.inclusions.length > 0 ? (
                      voyage.inclusions.map((inclusion, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FaCheck className="text-sahara flex-shrink-0" />
                          <span className="text-gray-700">{inclusion}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-600">Transport, hébergement et guide inclus.</li>
                    )}
                  </ul>
                </div>
                
                {/* Ce qui n'est pas inclus */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Non inclus</h3>
                  <ul className="space-y-2">
                    {voyage.exclusions && voyage.exclusions.length > 0 ? (
                      voyage.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-600">
                          <span className="text-sahara font-bold">×</span>
                          <span>{exclusion}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-center gap-2 text-gray-600">
                          <span className="text-sahara font-bold">×</span>
                          <span>Dépenses personnelles</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <span className="text-sahara font-bold">×</span>
                          <span>Pourboires</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Section Likes et Dislikes */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-semibold text-gray-800">Avis et réactions</h2>
                  <p className="text-gray-600 mt-2">Vous aimez ce voyage ? Faites-le savoir !</p>
                </div>
                <div className="flex items-center">
                  <VoyageReactionPanel 
                    voyageId={voyage._id} 
                    size="lg" 
                    customCommentCount={commentCount}
                  />
                </div>
              </div>
            </div>

            {/* Section Informations importantes */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FaInfoCircle className="text-sahara" />
                Informations importantes
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-sahara/20 p-2 rounded-full">
                    <FaCalendarAlt className="text-sahara" />
                  </div>
                  <span className="text-gray-700">Annulation gratuite jusqu'à 7 jours avant le départ</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-sahara/20 p-2 rounded-full">
                    <FaUsers className="text-sahara" />
                  </div>
                  <span className="text-gray-700">Guide professionnel inclus</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-sahara/20 p-2 rounded-full">
                    <FaWalking className="text-sahara" />
                  </div>
                  <span className="text-gray-700">Programme flexible selon les conditions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-sahara/20 p-2 rounded-full">
                    <FaBuilding className="text-sahara" />
                  </div>
                  <span className="text-gray-700">Hébergement confortable en hôtels traditionnels</span>
                </li>
              </ul>
            </div>

            {/* Section Activités Associées */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FaHiking className="text-sahara" />
                Activités disponibles
              </h2>
              
              {availableActivities && availableActivities.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableActivities.map(activity => {
                      const isSelected = selectedActivities.some(a => a._id === activity._id);
                      
                      return (
                        <div 
                          key={activity._id} 
                          className={`border rounded-lg overflow-hidden shadow-sm transition-all duration-300 transform cursor-pointer hover:shadow-md ${
                            isSelected 
                              ? 'border-sahara border-[5px] shadow-[0_0_20px_rgba(255,140,56,0.7)] bg-orange-50 scale-[1.02]' 
                              : 'border-gray-200 hover:scale-[1.01]'
                          }`}
                          onClick={() => {
                            console.log('Clic sur activité détecté -', activity.name);
                            handleActivitySelection(activity);
                          }}
                        >
                          <div className="relative">
                            <img 
                              src={activity.image} 
                              alt={activity.name} 
                              className="w-full h-48 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-sahara text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
                                Sélectionnée
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-1">{activity.name}</h3>
                            <div className="flex items-center mb-2">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className="text-yellow-500 mr-0.5 text-sm" />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">(5.0)</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{activity.description}</p>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center">
                                <FaClock className="text-gray-500 mr-1" />
                                <span className="text-sm text-gray-600">{activity.duration} heures</span>
                              </div>
                              <div className="font-semibold text-sahara">{activity.price} MAD</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucune activité n'est disponible pour ce voyage pour le moment.</p>
                </div>
              )}
            </div>

            {/* Section Commentaires - avec une référence React */}
            <div id="comments" ref={commentsRef} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <FaComment className="text-sahara text-2xl" />
                <h2 className="text-3xl font-semibold text-gray-800">Commentaires</h2>
              </div>
              <CommentSection voyageId={voyage._id} />
            </div>
          </div>

          {/* Colonne latérale - Formulaire de réservation */}
          <div className="lg:col-span-1">
            {/* Carte récapitulative des prix */}
            <div className="bg-sahara text-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <FaMoneyBillWave />
                Récapitulatif des prix
              </h3>
              
              {/* Prix de base */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/20">
                  <div>
                    <p className="font-medium">Prix du voyage</p>
                    <p className="text-sm opacity-80">Prix de base par personne</p>
                  </div>
                  <span className="text-2xl font-bold">{voyage.price} MAD</span>
                </div>

                {/* Prix des activités sélectionnées */}
                {selectedActivities.length > 0 && (
                  <>
                    <div className="py-4 border-b border-white/20">
                      <p className="font-medium mb-2">Activités sélectionnées</p>
                      {selectedActivities.map(activity => (
                        <div key={activity._id} className="flex justify-between items-center mb-2 text-sm">
                          <span className="opacity-80">{activity.name}</span>
                          <span>{activity.price} MAD × {formData.nombrePersonnes} = {activity.price * formData.nombrePersonnes} MAD</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 text-lg">
                        <span className="font-medium">Total activités</span>
                        <span className="font-semibold">
                          {selectedActivities.reduce((sum, activity) => sum + activity.price, 0) * formData.nombrePersonnes} MAD
                        </span>
                      </div>
                    </div>

                    {/* Prix total - affiché uniquement si des activités sont sélectionnées */}
                    <div className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Prix total par personne</p>
                          <p className="text-sm opacity-80">Voyage + Activités</p>
                        </div>
                        <span className="text-2xl font-bold">
                          {voyage.price + selectedActivities.reduce((sum, activity) => sum + activity.price, 0)} MAD
                        </span>
                      </div>
                      {formData.nombrePersonnes > 1 && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Prix total pour {formData.nombrePersonnes} personnes</p>
                            </div>
                            <span className="text-2xl font-bold">
                              {(voyage.price + selectedActivities.reduce((sum, activity) => sum + activity.price, 0)) * formData.nombrePersonnes} MAD
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Formulaire de réservation */}
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FaCalendarCheck className="text-sahara" />
                Réserver ce voyage
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="nom">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sahara focus:border-transparent transition-all"
                      required
                      placeholder="Votre nom"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sahara focus:border-transparent transition-all"
                      required
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="telephone">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sahara focus:border-transparent transition-all"
                      required
                      placeholder="+212 XXX-XXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="nombrePersonnes">
                      Nombre de personnes
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="nombrePersonnes"
                        name="nombrePersonnes"
                        value={formData.nombrePersonnes}
                        onChange={handleInputChange}
                        min="1"
                        max={voyage.availableSpots}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sahara focus:border-transparent transition-all"
                        required
                        onKeyDown={(e) => {
                          // Empêcher les valeurs supérieures au max en bloquant la saisie clavier
                          const newValue = e.target.value + e.key;
                          if (!isNaN(newValue) && parseInt(newValue, 10) > voyage.availableSpots) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <span className="ml-2 text-gray-500">/ {voyage.availableSpots} disponibles</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="dateDepart">
                      Date de départ souhaitée
                    </label>
                    <input
                      type="date"
                      id="dateDepart"
                      name="dateDepart"
                      value={formData.dateDepart}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sahara focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-sahara text-white py-4 rounded-lg font-semibold text-lg hover:bg-sahara/90 transition-colors flex items-center justify-center gap-2"
                    disabled={loadingSubmit}
                  >
                    {loadingSubmit ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <FaCalendarCheck />
                        Réserver maintenant
                      </>
                    )}
                  </button>
                </div>

                {reservationStatus && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    reservationStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {reservationStatus.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageDetail;
