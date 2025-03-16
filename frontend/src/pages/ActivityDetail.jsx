import React from 'react';
import { useParams } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaClock, FaCheck } from 'react-icons/fa';

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
  const activityData = activitiesData[id];

  if (!activityData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl text-gray-600">Activité non trouvée</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <img 
          src={activityData.image}
          alt={activityData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-4">
            <div className="text-white max-w-3xl">
              <h1 className="text-5xl font-bold mb-4">{activityData.name}</h1>
              <div className="flex items-center gap-6 text-lg">
                <span className="flex items-center gap-2">
                  <FaClock />
                  {activityData.duration}
                </span>
                <span className="flex items-center gap-2">
                  <FaUsers />
                  Max {activityData.maxParticipants} personnes
                </span>
                <span className="flex items-center gap-2">
                  <FaMoneyBillWave />
                  {activityData.price} DH
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
              <p className="text-gray-600">{activityData.description}</p>
            </div>

            {/* Packages associés */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Packages incluant cette activité</h2>
              <div className="space-y-4">
                {activityData.relatedPackages.map((pkg) => (
                  <div key={pkg.id} className="border rounded-lg p-4 hover:border-sahara transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{pkg.name}</h3>
                        <p className="text-gray-600">Par {pkg.agencyName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sahara">{pkg.price} DH</p>
                        <p className="text-gray-600">{pkg.duration}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.location.href = `/packages/${pkg.id}`}
                      className="mt-4 w-full bg-sahara/10 text-sahara py-2 rounded-lg font-semibold hover:bg-sahara/20 transition-colors"
                    >
                      Voir le package complet
                    </button>
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
                {activityData.included.map((item, index) => (
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
                    <span className="text-sahara">{activityData.price} DH</span>
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

export default ActivityDetail; 