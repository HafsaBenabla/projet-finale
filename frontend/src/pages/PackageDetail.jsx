import React from 'react';
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
  const packageData = packagesData[id];

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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Ce qui est inclus</h2>
              <div className="space-y-3">
                {packageData.included.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-600">
                    <FaCheck className="text-sahara flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <div className="bg-sahara/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Prix par personne</span>
                    <span className="text-sahara">{packageData.price} DH</span>
                  </div>
                </div>

                <button className="w-full bg-sahara text-white py-3 rounded-xl font-semibold hover:bg-sahara/90 transition-colors">
                  Réserver maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail; 