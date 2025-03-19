import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaHotel, FaClock, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

// Données des packages (à remplacer par des données de l'API plus tard)
const packagesData = {
  'circuit-imperial-marrakech': {
    id: 'circuit-imperial-marrakech',
    name: 'Circuit des Villes Impériales',
    agencyName: 'Sahara Tours',
    description: 'Découvrez les villes impériales du Maroc dans un circuit luxueux incluant un séjour au Sahara Palace Marrakech',
    duration: '8 jours',
    maxParticipants: 12,
    price: 12500,
    included: [
      'Hébergement au Sahara Palace Marrakech',
      'Transport en 4x4 de luxe',
      'Guide professionnel',
      'Petits déjeuners et dîners',
      'Visites guidées des monuments',
      'Excursions dans le désert'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrivée à Marrakech',
        description: 'Accueil à l\'aéroport et installation au Sahara Palace Marrakech'
      },
      {
        day: 2,
        title: 'Découverte de Marrakech',
        description: 'Visite de la médina, des jardins Majorelle et du palais Bahia'
      },
      {
        day: 3,
        title: 'Route vers Fès',
        description: 'Traversée de l\'Atlas et arrêt à Ifrane'
      },
      {
        day: 4,
        title: 'Exploration de Fès',
        description: 'Visite de la médina de Fès et des tanneries'
      },
      {
        day: 5,
        title: 'Meknès et Volubilis',
        description: 'Découverte des ruines romaines et de la ville impériale'
      },
      {
        day: 6,
        title: 'Rabat',
        description: 'Visite de la capitale administrative'
      },
      {
        day: 7,
        title: 'Retour à Marrakech',
        description: 'Temps libre et soirée de gala'
      },
      {
        day: 8,
        title: 'Départ',
        description: 'Transfert à l\'aéroport'
      }
    ],
    image: 'https://i.pinimg.com/564x/d2/10/d3/d210d3d08f6fe04cf4b7f7e78f71c9c9.jpg'
  },
  'decouverte-fes': {
    id: 'decouverte-fes',
    name: 'Découverte de Fès',
    agencyName: 'Medina Voyages',
    description: 'Immergez-vous dans l\'histoire millénaire de Fès avec un séjour au Riad Fès Heritage',
    duration: '3 jours',
    maxParticipants: 8,
    price: 4500,
    included: [
      'Hébergement au Riad Fès Heritage',
      'Transferts privés',
      'Guide local certifié',
      'Tous les repas',
      'Ateliers d\'artisanat'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrivée à Fès',
        description: 'Accueil et installation au Riad Fès Heritage'
      },
      {
        day: 2,
        title: 'Médina de Fès',
        description: 'Exploration des souks et monuments historiques'
      },
      {
        day: 3,
        title: 'Artisanat et Départ',
        description: 'Ateliers d\'artisanat traditionnels et départ'
      }
    ],
    image: 'https://i.pinimg.com/564x/8c/21/98/8c219814458f9c9d06b05a46c5300e5d.jpg'
  },
  'escapade-sahara': {
    id: 'escapade-sahara',
    name: 'Escapade dans le Sahara',
    agencyName: 'Desert Adventures',
    description: 'Vivez une expérience unique dans le désert avec un séjour à la Kasbah du Désert',
    duration: '5 jours',
    maxParticipants: 10,
    price: 8900,
    included: [
      'Hébergement à la Kasbah du Désert',
      'Transport en 4x4',
      'Guide saharien',
      'Pension complète',
      'Activités dans le désert',
      'Soirées traditionnelles'
    ],
    itinerary: [
      {
        day: 1,
        title: 'Départ pour Merzouga',
        description: 'Traversée de l\'Atlas et arrivée à la Kasbah'
      },
      {
        day: 2,
        title: 'Dunes de l\'Erg Chebbi',
        description: 'Excursion en dromadaire et nuit sous les étoiles'
      },
      {
        day: 3,
        title: 'Villages berbères',
        description: 'Rencontre avec les nomades et leur culture'
      },
      {
        day: 4,
        title: 'Oasis et détente',
        description: 'Découverte des oasis et relaxation à la Kasbah'
      },
      {
        day: 5,
        title: 'Retour',
        description: 'Retour vers votre destination de départ'
      }
    ],
    image: 'https://i.pinimg.com/564x/a0/cc/97/a0cc97e6b9d95b8f6b52f5e8f8d4c7b4.jpg'
  }
};

const PackageDetail = () => {
  const { id } = useParams();
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    numberOfPersons: 1
  });
  const [reservationStatus, setReservationStatus] = useState(null);
  const packageData = packagesData[id];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voyageId: id,
          ...formData
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setReservationStatus({
          type: 'success',
          message: 'Réservation effectuée avec succès!'
        });
        // Update the available spots in the UI
        packageData.maxParticipants = data.availableSpots;
        setShowReservationForm(false);
      } else {
        setReservationStatus({
          type: 'error',
          message: data.message || 'Erreur lors de la réservation'
        });
      }
    } catch (error) {
      setReservationStatus({
        type: 'error',
        message: 'Erreur de connexion au serveur'
      });
    }
  };

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Package non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <img 
          src={packageData.image}
          alt={packageData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-4">
            <div className="text-white max-w-3xl">
              <h1 className="text-5xl font-bold mb-4">{packageData.name}</h1>
              <p className="text-2xl mb-6">Par {packageData.agencyName}</p>
              <div className="flex items-center gap-6 text-lg">
                <span className="flex items-center gap-2">
                  <FaCalendarAlt />
                  {packageData.duration}
                </span>
                <span className="flex items-center gap-2">
                  <FaUsers />
                  Max {packageData.maxParticipants} personnes
                </span>
                <span className="flex items-center gap-2">
                  <FaMoneyBillWave />
                  {packageData.price} DH
                </span>
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
              <p className="text-gray-600">{packageData.description}</p>
            </div>

            {/* Itinéraire */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Itinéraire</h2>
              <div className="space-y-6">
                {packageData.itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-sahara text-white rounded-full flex items-center justify-center font-bold">
                      J{day.day}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{day.title}</h3>
                      <p className="text-gray-600">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prix et Réservation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-primary">{packageData.price} DH</p>
                <p className="text-gray-600">par personne</p>
              </div>
              
              {!showReservationForm ? (
                <button
                  onClick={() => setShowReservationForm(true)}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition duration-300"
                >
                  Réserver maintenant
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de personnes</label>
                    <input
                      type="number"
                      name="numberOfPersons"
                      value={formData.numberOfPersons}
                      onChange={handleInputChange}
                      min="1"
                      max={packageData.maxParticipants}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition duration-300"
                    >
                      Confirmer la réservation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReservationForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {reservationStatus && (
                <div className={`mt-4 p-3 rounded ${
                  reservationStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {reservationStatus.message}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <p className="flex items-center text-gray-600">
                  <FaUsers className="mr-2" />
                  Places disponibles: {packageData.maxParticipants}
                </p>
                <p className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  {packageData.duration}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;