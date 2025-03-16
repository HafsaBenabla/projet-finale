import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';

const Activites = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Données des activités (à remplacer par des données de l'API plus tard)
  const activitiesData = {
    travelActivities: [
      {
        id: 'excursion-desert',
        title: 'Excursion dans le Désert',
        description: 'Une aventure inoubliable dans les dunes dorées du Sahara marocain',
        city: 'Merzouga',
        price: 2500,
        duration: 2,
        maxParticipants: 10,
        image: 'https://i.pinimg.com/564x/a0/cc/97/a0cc97e6b9d95b8f6b52f5e8f8d4c7b4.jpg',
        type: 'travel',
        agency: 'Desert Adventures'
      },
      {
        id: 'circuit-imperial-marrakech',
        title: 'Circuit des Villes Impériales',
        description: 'Découvrez les villes historiques du Maroc dans un circuit luxueux',
        city: 'Marrakech',
        price: 12500,
        duration: 8,
        maxParticipants: 12,
        image: 'https://i.pinimg.com/564x/d2/10/d3/d210d3d08f6fe04cf4b7f7e78f71c9c9.jpg',
        type: 'travel',
        agency: 'Sahara Tours'
      }
    ],
    localActivities: [
      {
        id: 'hammam-traditionnel',
        title: 'Hammam Traditionnel',
        description: 'Découvrez les rituels ancestraux du hammam marocain dans un cadre luxueux',
        city: 'Marrakech',
        price: 800,
        duration: 3,
        maxParticipants: 6,
        image: 'https://i.pinimg.com/564x/2c/ba/09/2cba09b4bf4d1998d63dd0e9a01c2b7f.jpg',
        type: 'local'
      },
      {
        id: 'cours-cuisine',
        title: 'Cours de Cuisine Marocaine',
        description: 'Apprenez à préparer les plats emblématiques de la cuisine marocaine',
        city: 'Fès',
        price: 950,
        duration: 4,
        maxParticipants: 8,
        image: 'https://i.pinimg.com/564x/57/c6/fa/57c6fa9d423d3e67f6142598142c7d71.jpg',
        type: 'local'
      },
      {
        id: 'artisanat-medina',
        title: 'Atelier d\'Artisanat dans la Médina',
        description: 'Participez à un atelier de poterie ou de tissage avec des artisans locaux',
        city: 'Fès',
        price: 450,
        duration: 3,
        maxParticipants: 6,
        image: 'https://i.pinimg.com/564x/8c/21/98/8c219814458f9c9d06b05a46c5300e5d.jpg',
        type: 'local'
      }
    ]
  };

  const formatPrice = (price) => {
    return `${price.toLocaleString()} DH`;
  };

  const formatDuration = (duration) => {
    return duration >= 24 
      ? `${Math.floor(duration/24)} jours` 
      : `${duration} heures`;
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const getFilteredActivities = () => {
    switch (selectedCategory) {
      case 'travel':
        return activitiesData.travelActivities;
      case 'local':
        return activitiesData.localActivities;
      default:
        return [...activitiesData.travelActivities, ...activitiesData.localActivities];
    }
  };

  return (
    <div className="w-full pt-16">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Activités au Maroc</h1>
            <p className="mt-4 text-xl text-gray-600">
              Des expériences uniques pour tous les goûts
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            className={`px-6 py-2 rounded-full transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-sahara text-white' 
                : 'border border-gray-300 hover:border-sahara'
            }`}
            onClick={() => handleCategoryChange('all')}
          >
            Toutes les activités
          </button>
          <button 
            className={`px-6 py-2 rounded-full transition-colors ${
              selectedCategory === 'travel' 
                ? 'bg-sahara text-white' 
                : 'border border-gray-300 hover:border-sahara'
            }`}
            onClick={() => handleCategoryChange('travel')}
          >
            Activités de Voyage
          </button>
          <button 
            className={`px-6 py-2 rounded-full transition-colors ${
              selectedCategory === 'local' 
                ? 'bg-sahara text-white' 
                : 'border border-gray-300 hover:border-sahara'
            }`}
            onClick={() => handleCategoryChange('local')}
          >
            Activités Locales
          </button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 py-8">
        {selectedCategory === 'travel' && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Activités de Voyage</h2>
            <p className="text-gray-600">
              Des expériences complètes organisées par nos agences partenaires pour découvrir le Maroc
            </p>
          </div>
        )}

        {selectedCategory === 'local' && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Activités Locales</h2>
            <p className="text-gray-600">
              Des activités à la journée pour profiter du meilleur de votre ville
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getFilteredActivities().map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02]">
              <div className="h-48 bg-gray-200 relative">
                <img 
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sahara font-semibold">
                  {activity.city}
                </div>
                {activity.type === 'travel' && activity.agency && (
                  <div className="absolute bottom-4 left-4 bg-sahara px-3 py-1 rounded-full text-white text-sm">
                    {activity.agency}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{activity.title}</h3>
                <p className="mt-2 text-gray-600 line-clamp-2">{activity.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                    <FaClock className="text-sahara" />
                    {formatDuration(activity.duration)}
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                    <FaUsers className="text-sahara" />
                    Max {activity.maxParticipants} pers.
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                    <FaMapMarkerAlt className="text-sahara" />
                    {activity.city}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sahara font-semibold">{formatPrice(activity.price)}</span>
                  <button 
                    onClick={() => window.location.href = `/activities/${activity.id}`}
                    className="px-4 py-2 bg-sahara text-white rounded-full hover:bg-sahara/90 transition-colors"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vous ne trouvez pas l'activité idéale ?
          </h2>
          <p className="text-gray-600 mb-8">Contactez-nous pour une expérience personnalisée</p>
          <button className="px-8 py-3 bg-sahara text-white rounded-full hover:bg-sahara/90 transition-colors">
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activites;
