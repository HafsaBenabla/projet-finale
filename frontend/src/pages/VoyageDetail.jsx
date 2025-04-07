import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaInfoCircle, FaWalking, FaCalendarCheck, FaCheck, FaBuilding } from 'react-icons/fa';
import ActivitySelectionCard from '../components/ActivitySelectionCard';
import { useVoyages } from '../context/VoyagesContext';
import { useAuth } from '../context/AuthContext';
import VoyageReactionPanel from '../components/VoyageReactionPanel';

// Activités disponibles par ville
const activitiesByCity = {
  Marrakech: [
    {
      id: 'mrk1',
      title: "Cours de Cuisine au Riad",
      description: "Apprenez à préparer le couscous, les tajines et les pâtisseries marocaines avec un chef local dans un riad traditionnel",
      duration: 4,
      maxParticipants: 8,
      price: 450,
      image: "https://images.pexels.com/photos/7262776/pexels-photo-7262776.jpeg"
    },
    {
      id: 'mrk2',
      title: "Tour des Jardins Historiques",
      description: "Visite guidée des jardins Majorelle, Menara et de l'Agdal, découvrez l'histoire et la botanique de ces lieux exceptionnels",
      duration: 5,
      maxParticipants: 12,
      price: 350,
      image: "https://images.pexels.com/photos/4110939/pexels-photo-4110939.jpeg"
    },
    {
      id: 'mrk3',
      title: "Soirée dans le Désert d'Agafay",
      description: "Dîner sous les étoiles, spectacle de folklore et nuit en camp de luxe dans le désert aux portes de Marrakech",
      duration: 16,
      maxParticipants: 10,
      price: 890,
      image: "https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg"
    }
  ],
  Fès: [
    {
      id: 'fes1',
      title: "Atelier de Mosaïque Zellige",
      description: "Initiez-vous à l'art ancestral du zellige avec des maîtres artisans dans la médina de Fès",
      duration: 3,
      maxParticipants: 6,
      price: 400,
      image: "https://images.pexels.com/photos/6152103/pexels-photo-6152103.jpeg"
    },
    {
      id: 'fes2',
      title: "Visite des Tanneries",
      description: "Découvrez le processus traditionnel de tannage du cuir et visitez les célèbres tanneries Chouara",
      duration: 2,
      maxParticipants: 8,
      price: 200,
      image: "https://images.pexels.com/photos/4502973/pexels-photo-4502973.jpeg"
    },
    {
      id: 'fes3',
      title: "Circuit Artisanal",
      description: "Visitez les ateliers de tissage, de poterie et de travail du cuivre dans la plus ancienne médina du monde",
      duration: 4,
      maxParticipants: 8,
      price: 300,
      image: "https://images.pexels.com/photos/5998120/pexels-photo-5998120.jpeg"
    }
  ],
  Chefchaouen: [
    {
      id: 'chf1',
      title: "Randonnée dans le Rif",
      description: "Randonnée guidée dans les montagnes du Rif avec vue panoramique sur la ville bleue",
      duration: 6,
      maxParticipants: 10,
      price: 300,
      image: "https://images.pexels.com/photos/4490710/pexels-photo-4490710.jpeg"
    },
    {
      id: 'chf2',
      title: "Atelier Photo dans la Médina Bleue",
      description: "Session photo guidée dans les ruelles les plus photogéniques de Chefchaouen avec un photographe professionnel",
      duration: 3,
      maxParticipants: 6,
      price: 250,
      image: "https://images.pexels.com/photos/4388164/pexels-photo-4388164.jpeg"
    }
  ],
  Essaouira: [
    {
      id: 'ess1',
      title: "Cours de Surf",
      description: "Initiation ou perfectionnement au surf sur les spots réputés d'Essaouira avec un moniteur qualifié",
      duration: 3,
      maxParticipants: 8,
      price: 350,
      image: "https://images.pexels.com/photos/1654489/pexels-photo-1654489.jpeg"
    },
    {
      id: 'ess2',
      title: "Pêche Traditionnelle",
      description: "Sortie en mer avec des pêcheurs locaux et préparation de votre pêche avec un chef",
      duration: 5,
      maxParticipants: 6,
      price: 400,
      image: "https://images.pexels.com/photos/2886266/pexels-photo-2886266.jpeg"
    }
  ],
  Merzouga: [
    {
      id: 'mrz1',
      title: "Nuit sous les Étoiles",
      description: "Bivouac de luxe dans les dunes de l'Erg Chebbi avec dîner traditionnel et spectacle musical",
      duration: 14,
      maxParticipants: 12,
      price: 800,
      image: "https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg"
    },
    {
      id: 'mrz2',
      title: "Balade à Dos de Dromadaire",
      description: "Traversée des dunes au coucher du soleil suivie d'une pause thé avec les nomades",
      duration: 3,
      maxParticipants: 10,
      price: 300,
      image: "https://images.pexels.com/photos/4577791/pexels-photo-4577791.jpeg"
    }
  ],
  Rabat: [
    {
      id: 'rbt1',
      title: "Tour Historique",
      description: "Visite guidée de la Kasbah des Oudayas, de la Tour Hassan et du Mausolée Mohammed V",
      duration: 4,
      maxParticipants: 15,
      price: 250,
      image: "https://images.pexels.com/photos/3250638/pexels-photo-3250638.jpeg"
    },
    {
      id: 'rbt2',
      title: "Atelier de Tapis",
      description: "Découverte du tissage traditionnel des tapis marocains avec des artisanes locales",
      duration: 3,
      maxParticipants: 8,
      price: 300,
      image: "https://images.pexels.com/photos/6192554/pexels-photo-6192554.jpeg"
    }
  ]
};

const VoyageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshVoyages } = useVoyages();
  const { user, token, isAuthenticated } = useAuth();
  const [voyage, setVoyage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    nombrePersonnes: 1,
    dateDepart: ''
  });

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [reservationStatus, setReservationStatus] = useState(null);

  useEffect(() => {
    const fetchVoyage = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/voyages/${id}`);
        if (!response.ok) {
          throw new Error('Voyage non trouvé');
        }
        const data = await response.json();
        setVoyage(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVoyage();
  }, [id]);

  // Récupérer les activités disponibles pour la destination
  const availableActivities = useMemo(() => {
    return activitiesByCity[voyage?.destination] || [];
  }, [voyage?.destination]);
  
  // Calculer le prix total
  const calculateTotalPrice = () => {
    const activitiesPrice = selectedActivities.reduce((sum, activity) => sum + activity.price, 0);
    return voyage.price * formData.nombrePersonnes + activitiesPrice * formData.nombrePersonnes;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActivitySelection = (activity) => {
    setSelectedActivities(prev => {
      const isSelected = prev.some(a => a.id === activity.id);
      if (isSelected) {
        return prev.filter(a => a.id !== activity.id);
      } else {
        return [...prev, activity];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setReservationStatus(null);
    
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
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    try {
      console.log('=== Envoi de la requête de réservation ===', {
        type: 'voyage',
        voyageId: voyage._id,
        dateReservation: formData.dateDepart,
        userId: user.userId,
        formData
      });

      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'voyage',
          voyageId: voyage._id,
          nombrePersonnes: parseInt(formData.nombrePersonnes, 10),
          dateReservation: formData.dateDepart
        }),
      });

      const data = await response.json();
      console.log('=== Réponse de la création de réservation ===', {
        status: response.status,
        ok: response.ok,
        data
      });
      
      if (response.ok) {
        console.log('Réservation créée avec succès:', data);
        setReservationStatus({
          type: 'success',
          message: 'Réservation effectuée avec succès!'
        });

        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          email: '',
          telephone: '',
          nombrePersonnes: 1,
          dateDepart: ''
        });
        
        // Rafraîchir les données du voyage
        refreshVoyages();
        
        // Recharger les données du voyage
        const voyageResponse = await fetch(`http://localhost:5000/api/voyages/${voyage._id}`);
        if (voyageResponse.ok) {
          const updatedVoyage = await voyageResponse.json();
          setVoyage(updatedVoyage);
        }

        // Rediriger vers la page de profil après un court délai
        console.log('Redirection vers le profil dans 2 secondes...');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        console.error('Erreur lors de la création de la réservation:', data);
        throw new Error(data.message || 'Erreur lors de la réservation');
      }
    } catch (err) {
      console.error('=== Erreur détaillée lors de la création de la réservation ===', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      setReservationStatus({
        type: 'error',
        message: err.message
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sahara"></div>
      </div>
    );
  }

  if (error || !voyage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600">{error || 'Voyage non trouvé'}</p>
          <button
            onClick={() => navigate('/voyages')}
            className="mt-4 px-6 py-2 bg-sahara text-white rounded-full"
          >
            Retour aux voyages
          </button>
        </div>
      </div>
    );
  }

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
                      <div className="flex items-start gap-4">
                        {voyage.hebergementImage && (
                          <img 
                            src={voyage.hebergementImage?.startsWith('http') 
                              ? voyage.hebergementImage 
                              : `http://localhost:5000${voyage.hebergementImage}`} 
                            alt={voyage.hebergement}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg';
                            }}
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{voyage.hebergement}</h4>
                          <p className="text-sm text-gray-600 mt-1">{voyage.typeHebergement || 'Hébergement standard'}</p>
                        </div>
                      </div>
                      {voyage.descriptionHebergement && (
                        <p className="text-gray-700 text-sm">{voyage.descriptionHebergement}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">Information sur l'hébergement non disponible</p>
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
                  <VoyageReactionPanel voyageId={voyage._id} size="lg" />
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6">
                <p className="text-sm text-gray-500">
                  {isAuthenticated ? 
                    "Merci pour votre réaction ! Cela nous aide à améliorer nos offres." : 
                    "Connectez-vous pour donner votre avis sur ce voyage."
                  }
                </p>
              </div>
            </div>

            {/* Section Activités */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FaWalking className="text-sahara" />
                Activités disponibles
              </h2>
              {voyage.activities && voyage.activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {voyage.activities.map((activity) => (
                    <div 
                      key={activity._id} 
                      onClick={() => handleActivitySelection(activity)}
                      className={`bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${
                        selectedActivities.some(a => a._id === activity._id)
                          ? 'ring-2 ring-sahara bg-sahara/5'
                          : 'hover:scale-105'
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={activity.image} 
                          alt={activity.name}
                          className="w-full h-48 object-cover"
                        />
                        {selectedActivities.some(a => a._id === activity._id) && (
                          <div className="absolute top-4 right-4 bg-sahara text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <FaCheck className="text-xs" /> Sélectionnée
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">{activity.name}</h3>
                        <p className="text-gray-600 mb-3 text-sm">{activity.description}</p>
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="bg-sahara/10 text-sahara px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <FaClock className="text-xs" /> {activity.duration}h
                          </span>
                          <span className="bg-sahara/10 text-sahara px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <FaUsers className="text-xs" /> Max {activity.maxParticipants} pers.
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sahara font-semibold">{activity.price} MAD</span>
                          <span className={`text-sm ${
                            selectedActivities.some(a => a._id === activity._id)
                              ? 'text-sahara'
                              : 'text-gray-500'
                          }`}>
                            {selectedActivities.some(a => a._id === activity._id) 
                              ? 'Cliquez pour retirer'
                              : 'Cliquez pour sélectionner'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Aucune activité n'est actuellement disponible pour ce voyage.
                </p>
              )}
            </div>

            {/* Section Informations importantes */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
              <h2 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FaInfoCircle className="text-sahara" />
                Informations importantes
              </h2>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-sahara/20 p-2 rounded-full">
                    <FaCalendarAlt className="text-sahara" />
                  </div>
                  <span className="text-gray-700">Annulation gratuite jusqu'à 48h avant le départ</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-sahara/20 p-2 rounded-full">
                    <FaUsers className="text-sahara" />
                  </div>
                  <span className="text-gray-700">Guide professionnel inclus</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-sahara/20 p-2 rounded-full">
                    <FaMapMarkerAlt className="text-sahara" />
                  </div>
                  <span className="text-gray-700">Transport depuis votre hôtel</span>
                </li>
              </ul>
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
                          <span>{activity.price} MAD</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-4 text-lg">
                        <span className="font-medium">Total activités</span>
                        <span className="font-semibold">
                          {selectedActivities.reduce((sum, activity) => sum + activity.price, 0)} MAD
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
                    disabled={loading}
                  >
                    {loading ? (
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
