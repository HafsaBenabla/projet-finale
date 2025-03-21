import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import ActivitySelectionCard from '../components/ActivitySelectionCard';
import { useVoyages } from '../context/VoyagesContext';

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
    
    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voyageId: voyage._id,
          clientName: formData.nom,
          email: formData.email,
          phone: formData.telephone,
          numberOfPersons: parseInt(formData.nombrePersonnes),
          departureDate: formData.dateDepart
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Mettre à jour le nombre de places disponibles localement
        setVoyage(prev => ({
          ...prev,
          availableSpots: data.availableSpots
        }));

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
        
        // Rafraîchir les données des voyages dans le contexte
        refreshVoyages();
        
        // Recharger les données du voyage pour avoir les informations à jour
        const voyageResponse = await fetch(`http://localhost:5000/api/voyages/${voyage._id}`);
        if (voyageResponse.ok) {
          const updatedVoyage = await voyageResponse.json();
          setVoyage(updatedVoyage);
        }
      } else {
        throw new Error(data.message || 'Erreur lors de la réservation');
      }
    } catch (err) {
      console.error('Error submitting reservation:', err);
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
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="relative h-96">
        <img 
          src={voyage.image} 
          alt={voyage.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{voyage.title}</h1>
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt />
                {voyage.destination}
              </span>
              <span className="flex items-center gap-2">
                <FaClock />
                {voyage.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{voyage.description}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Programme du voyage</h2>
              <div className="space-y-4">
                {voyage.programme.map((jour, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-sahara text-white rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <p className="text-gray-600">{jour}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Ce qui est inclus</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voyage.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-sahara rounded-full"></div>
                    {inclusion}
                  </div>
                ))}
              </div>
            </div>

            {/* Section des activités complémentaires */}
            {availableActivities.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Activités à {voyage.destination}</h2>
                <p className="text-gray-600 mb-6">
                  Enrichissez votre séjour avec ces expériences uniques
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableActivities.map((activity) => (
                    <ActivitySelectionCard
                      key={activity.id}
                      activity={activity}
                      isSelected={selectedActivities.some(a => a.id === activity.id)}
                      onSelect={handleActivitySelection}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section des places disponibles */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Places disponibles</h2>
                  <p className="text-gray-600">
                    Il reste {voyage.availableSpots} places sur un total de {voyage.maxPlaces}
                  </p>
                </div>
                <div className={`text-3xl font-bold ${
                  voyage.availableSpots < 5 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {voyage.availableSpots}
                </div>
              </div>
              {voyage.availableSpots < 5 && (
                <p className="mt-2 text-red-500 text-sm">
                  Plus que quelques places disponibles !
                </p>
              )}
            </div>
          </div>

          {/* Formulaire de réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Réserver ce voyage</h2>
              
              {voyage.availableSpots === 0 ? (
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                  Désolé, ce voyage est complet !
                </div>
              ) : (
                <>
                  {reservationStatus && (
                    <div className={`p-4 rounded-lg mb-4 ${
                      reservationStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {reservationStatus.message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="nom">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="telephone">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="nombrePersonnes">
                        Nombre de personnes (max: {voyage.availableSpots})
                      </label>
                      <input
                        type="number"
                        id="nombrePersonnes"
                        name="nombrePersonnes"
                        value={formData.nombrePersonnes}
                        onChange={handleInputChange}
                        min="1"
                        max={voyage.availableSpots}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="dateDepart">
                        Date de départ souhaitée
                      </label>
                      <input
                        type="date"
                        id="dateDepart"
                        name="dateDepart"
                        value={formData.dateDepart}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="p-4 bg-sahara/10 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Prix de base</span>
                        <span className="font-semibold">{voyage.price.toLocaleString()} MAD</span>
                      </div>
                      {selectedActivities.length > 0 && (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Activités ({selectedActivities.length})</span>
                            <span className="font-semibold">
                              +{selectedActivities.reduce((sum, act) => sum + act.price, 0).toLocaleString()} MAD
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Nombre de personnes</span>
                            <span className="font-semibold">x{formData.nombrePersonnes}</span>
                          </div>
                        </>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-semibold text-sahara">Total</span>
                          <span className="font-bold text-sahara">{calculateTotalPrice().toLocaleString()} MAD</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-sahara text-white rounded-full font-medium hover:bg-sahara/90 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sahara focus:ring-offset-2"
                    >
                      Réserver maintenant
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageDetail;
