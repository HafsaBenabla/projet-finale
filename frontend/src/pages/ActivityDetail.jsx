import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaClock, FaCheck, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Données des activités (à remplacer par des données de l'API plus tard)
const activitiesData = {
  'hammam-traditionnel': {
    id: 'hammam-traditionnel',
    name: 'Hammam Traditionnel',
    description: 'Découvrez les rituels ancestraux du hammam marocain dans un cadre luxueux',
    duration: '3 heures',
    maxParticipants: 6,
    price: 800,
    image: 'https://i.pinimg.com/564x/2c/ba/09/2cba09b4bf4d1998d63dd0e9a01c2b7f.jpg',
    included: [
      'Accès au hammam privé',
      'Gommage traditionnel au savon noir',
      'Massage relaxant à l\'huile d\'argan',
      'Thé et pâtisseries marocaines',
      'Serviettes et produits de soin'
    ],
    relatedPackages: [
      {
        id: 'circuit-imperial-marrakech',
        name: 'Circuit des Villes Impériales',
        agencyName: 'Sahara Tours',
        price: 12500,
        duration: '8 jours'
      },
      {
        id: 'decouverte-fes',
        name: 'Découverte de Fès',
        agencyName: 'Medina Voyages',
        price: 4500,
        duration: '3 jours'
      }
    ]
  },
  'cours-cuisine': {
    id: 'cours-cuisine',
    name: 'Cours de Cuisine Marocaine',
    description: 'Apprenez à préparer les plats emblématiques de la cuisine marocaine avec un chef renommé',
    duration: '4 heures',
    maxParticipants: 8,
    price: 950,
    image: 'https://i.pinimg.com/564x/57/c6/fa/57c6fa9d423d3e67f6142598142c7d71.jpg',
    included: [
      'Cours avec un chef professionnel',
      'Tous les ingrédients et matériel',
      'Dégustation des plats préparés',
      'Livre de recettes personnalisé',
      'Tablier offert'
    ],
    relatedPackages: [
      {
        id: 'circuit-imperial-marrakech',
        name: 'Circuit des Villes Impériales',
        agencyName: 'Sahara Tours',
        price: 12500,
        duration: '8 jours'
      }
    ]
  },
  'excursion-desert': {
    id: 'excursion-desert',
    name: 'Excursion dans le Désert',
    description: 'Une aventure inoubliable dans les dunes dorées du Sahara marocain',
    duration: '2 jours',
    maxParticipants: 10,
    price: 2500,
    image: 'https://i.pinimg.com/564x/a0/cc/97/a0cc97e6b9d95b8f6b52f5e8f8d4c7b4.jpg',
    included: [
      'Transport en 4x4 de luxe',
      'Nuit en campement de luxe',
      'Balade en dromadaire',
      'Dîner traditionnel sous les étoiles',
      'Guide professionnel'
    ],
    relatedPackages: [
      {
        id: 'escapade-sahara',
        name: 'Escapade dans le Sahara',
        agencyName: 'Desert Adventures',
        price: 8900,
        duration: '5 jours'
      }
    ]
  }
};

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Informations du client pour le formulaire
  const [clientInfo, setClientInfo] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || (user?.name?.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    numberOfPersons: 1
  });

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/activities/${id}`);
        setActivity(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'activité:', err);
        setError(err.message || 'Une erreur est survenue lors du chargement de l\'activité');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  // Mettre à jour les informations client quand l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      console.log('Mise à jour des infos client avec utilisateur:', user);
      setClientInfo(prev => ({
        ...prev,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || (user.name?.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '') || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const formatDuration = (duration) => {
    return duration >= 24 
      ? `${Math.floor(duration/24)} jours` 
      : `${duration} heures`;
  };

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimeSlotSelection = (slot) => {
    setSelectedTimeSlot(slot);
    // Réinitialiser le nombre de personnes à 1 lors du changement de créneau
    setClientInfo(prev => ({
      ...prev,
      numberOfPersons: 1
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const handleNumberOfPersonsChange = (change) => {
    setClientInfo(prev => {
      const newValue = Math.max(1, prev.numberOfPersons + change);
      // Ne pas dépasser le nombre de places disponibles ou le maximum de participants
      const max = activity.type === 'locale' 
        ? Math.min(activity.maxParticipants, selectedTimeSlot?.availableSpots || 0)
        : Math.min(activity.maxParticipants, activity.availableSpots || 0);
      
      return {
        ...prev,
        numberOfPersons: Math.min(newValue, max)
      };
    });
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setReservationError('Vous devez être connecté pour effectuer une réservation.');
      return;
    }

    // Validation des champs
    if (!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone) {
      setReservationError('Tous les champs sont obligatoires.');
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientInfo.email)) {
      setReservationError('Veuillez entrer une adresse email valide.');
      return;
    }

    // Validation du téléphone (format international ou local marocain)
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{8,15}$/;
    if (!phoneRegex.test(clientInfo.phone.replace(/\s+/g, ''))) {
      setReservationError('Veuillez entrer un numéro de téléphone valide.');
      return;
    }

    // Validation pour les activités locales
    if (activity.type === 'locale' && !selectedTimeSlot) {
      setReservationError('Veuillez sélectionner un créneau horaire.');
      return;
    }

    // Validation de la date pour les activités de voyage
    if (activity.type === 'voyage' && !selectedDate) {
      setReservationError('Veuillez sélectionner une date de départ.');
      return;
    }

    setIsSubmitting(true);
    setReservationError('');

    try {
      // Utiliser le token du contexte d'authentification
      // const token = localStorage.getItem('token');
      
      // Vérification du token
      if (!token || token.trim() === '' || token.length < 20) {
        console.error('Token invalide ou manquant:', token);
        setReservationError('Problème d\'authentification. Veuillez vous reconnecter.');
        setIsSubmitting(false);
        return;
      }
      
      // S'assurer que nous avons l'ID utilisateur (modification pour accepter différentes formes d'ID)
      const userId = user?._id || user?.id || user?.userId;
      if (!user || !userId) {
        console.error('Problème d\'identification: user=', user);
        setReservationError('Problème d\'identification de l\'utilisateur. Veuillez vous reconnecter.');
        setIsSubmitting(false);
        return;
      }
      
      // Différent endpoint selon le type d'activité
      if (activity.type === 'locale') {
        // Pour les activités locales, nous avons besoin d'un créneau horaire
        if (!selectedTimeSlot) {
          setReservationError('Veuillez sélectionner un créneau horaire.');
          setIsSubmitting(false);
          return;
        }

        // Vérifier que le créneau a assez de places disponibles
        if (selectedTimeSlot.availableSpots < clientInfo.numberOfPersons) {
          setReservationError(`Il ne reste que ${selectedTimeSlot.availableSpots} places pour ce créneau.`);
          setIsSubmitting(false);
          return;
        }

        await axios.post(
          'http://localhost:5000/api/reservations/activity',
          {
            activityId: activity._id, 
            timeSlotId: selectedTimeSlot._id,
            nombrePersonnes: clientInfo.numberOfPersons,
            // Ne pas envoyer l'ID utilisateur ici, le middleware auth s'en chargera
            clientInfo: {
              firstName: clientInfo.firstName,
              lastName: clientInfo.lastName,
              email: clientInfo.email,
              phone: clientInfo.phone
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else if (activity.type === 'voyage') {
        await axios.post(
          'http://localhost:5000/api/reservations',
          {
            type: 'voyage',
            voyageId: activity._id,
            nombrePersonnes: clientInfo.numberOfPersons,
            departureDate: selectedDate,
            clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
            email: clientInfo.email,
            phone: clientInfo.phone
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Mettre à jour le nombre de places disponibles
      if (activity.type === 'locale') {
        // Pour les activités locales, mettre à jour le créneau spécifique
        const updatedTimeSlots = activity.timeSlots.map(slot => {
          if (slot._id === selectedTimeSlot._id) {
            return {
              ...slot,
              availableSpots: slot.availableSpots - clientInfo.numberOfPersons
            };
          }
          return slot;
        });
        
        // Mettre à jour l'activité et le créneau sélectionné
        setActivity(prev => ({
          ...prev,
          timeSlots: updatedTimeSlots
        }));
        
        // Mettre à jour le créneau sélectionné
        const updatedSlot = updatedTimeSlots.find(slot => slot._id === selectedTimeSlot._id);
        if (updatedSlot) {
          setSelectedTimeSlot(updatedSlot);
        }
      } else if (activity.type === 'voyage') {
        // Pour les activités de voyage, mettre à jour les places disponibles
        setActivity(prev => ({
          ...prev,
          availableSpots: prev.availableSpots - clientInfo.numberOfPersons
        }));
      }

      // Afficher le message de succès
      setReservationSuccess(true);
      // Réinitialiser le formulaire
      setClientInfo({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        numberOfPersons: 1
      });
      setSelectedDate('');
      setSelectedTimeSlot(null); // Réinitialiser le créneau sélectionné
      
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
      setReservationError(err.response?.data?.message || 'Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <FaSpinner className="animate-spin text-sahara text-4xl mr-3" />
        <span className="text-xl">Chargement de l'activité...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Activité non trouvée</p>
      </div>
    );
  }

  // Vérifier s'il reste des places disponibles
  const hasAvailableSlots = activity.type === 'locale' 
    ? activity.timeSlots && activity.timeSlots.some(slot => slot.availableSpots > 0)
    : activity.availableSpots > 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <img 
          src={activity.image}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-4">
            <div className="text-white max-w-3xl">
              <h1 className="text-5xl font-bold mb-4">{activity.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-lg">
                <span className="flex items-center gap-2">
                  <FaClock />
                  {formatDuration(activity.duration)}
                </span>
                <span className="flex items-center gap-2">
                  <FaUsers />
                  Max {activity.maxParticipants} personnes
                </span>
                <span className="flex items-center gap-2">
                  <FaMoneyBillWave />
                  {activity.price.toLocaleString()} DH
                </span>
                {activity.category && (
                  <span className="flex items-center gap-2 bg-sahara/20 px-3 py-1 rounded-full text-white">
                    {activity.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{activity.description}</p>
            </div>

            {/* Créneaux horaires pour activités locales */}
            {activity.type === 'locale' && activity.timeSlots && activity.timeSlots.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6">Créneaux disponibles</h2>
                <div className="space-y-4">
                  {activity.timeSlots.map((slot, index) => {
                    const slotDate = new Date(slot.date);
                    const isAvailable = slot.availableSpots > 0;
                    const isSelected = selectedTimeSlot && selectedTimeSlot._id === slot._id;
                    
                    return (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 ${
                          isSelected 
                            ? 'border-sahara bg-sahara/10' 
                            : isAvailable 
                              ? 'hover:border-sahara transition-colors cursor-pointer' 
                              : 'opacity-50 bg-gray-50'
                        }`}
                        onClick={() => isAvailable && handleTimeSlotSelection(slot)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {slotDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </h3>
                            <p className="text-gray-600">{slot.startTime} - {slot.endTime}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${isAvailable ? 'text-sahara' : 'text-gray-400'}`}>
                              {activity.price.toLocaleString()} DH
                            </p>
                            <p className={`text-sm ${
                              isAvailable
                                ? slot.availableSpots < 5 ? 'text-orange-600' : 'text-gray-600'
                                : 'text-gray-400'
                            }`}>
                              {isAvailable 
                                ? `${slot.availableSpots} places restantes` 
                                : 'Complet'
                              }
                            </p>
                            {isSelected && (
                              <span className="inline-block mt-2 bg-sahara text-white text-xs px-2 py-1 rounded-full">
                                Sélectionné
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Infos supplémentaires pour les activités de voyage */}
            {activity.type === 'voyage' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Informations sur le voyage</h2>
                <div className="space-y-4">
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-medium">{activity.city}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-medium">{formatDuration(activity.duration)}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Places disponibles:</span>
                    <span className={`font-medium ${activity.availableSpots < 5 ? 'text-orange-600' : ''}`}>
                      {activity.availableSpots} / {activity.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire de réservation intégré dans la page */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Détails supplémentaires</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-sahara flex-shrink-0" />
                  <span>Lieu: {activity.city}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <FaClock className="text-sahara flex-shrink-0" />
                  <span>Durée: {formatDuration(activity.duration)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <FaUsers className="text-sahara flex-shrink-0" />
                  <span>Taille du groupe: {activity.maxParticipants} personnes maximum</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <FaMoneyBillWave className="text-sahara flex-shrink-0" />
                  <span>Prix: {activity.price.toLocaleString()} DH par personne</span>
                </div>
                
                {activity.category && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaCheck className="text-sahara flex-shrink-0" />
                    <span>Catégorie: {activity.category}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section sur l'activité */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">À propos de cette activité</h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">{activity.description}</p>
                
                <div className="flex items-center mt-4">
                  <FaMapMarkerAlt className="text-sahara mr-2" />
                  <span className="text-gray-700">{activity.city}</span>
                </div>
                
                <div className="flex items-center">
                  <FaClock className="text-sahara mr-2" />
                  <span className="text-gray-700">{formatDuration(activity.duration)}</span>
                </div>
                
                <div className="flex items-center">
                  <FaUsers className="text-sahara mr-2" />
                  <span className="text-gray-700">Max {activity.maxParticipants} participants</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Informations</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-600">
                  <FaUsers className="text-sahara flex-shrink-0" />
                  <span>Groupe de {activity.maxParticipants} personnes maximum</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FaClock className="text-sahara flex-shrink-0" />
                  <span>Durée: {formatDuration(activity.duration)}</span>
                </div>
                {activity.city && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaCheck className="text-sahara flex-shrink-0" />
                    <span>Lieu: {activity.city}</span>
                  </div>
                )}
                {activity.category && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaCheck className="text-sahara flex-shrink-0" />
                    <span>Catégorie: {activity.category}</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="bg-sahara/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Prix par personne</span>
                    <span className="text-sahara">{activity.price.toLocaleString()} DH</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(activity.type === 'locale' ? '/activites-locales' : '/activites-voyages')}
                  className="w-full py-3 bg-transparent border border-sahara text-sahara rounded-xl font-semibold hover:bg-sahara/10 transition-colors"
                >
                  Retour aux activités
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail; 