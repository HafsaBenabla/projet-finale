import React, { useState } from 'react';
import { FaClock, FaUsers, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const ActivitesLocales = () => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  // Données des activités locales (à remplacer par des données de l'API plus tard)
  const localActivities = {
    'quad-casablanca': {
      id: 'quad-casablanca',
      title: 'Balade en Quad',
      description: 'Découvrez les dunes de Casablanca en quad',
      city: 'Casablanca',
      basePrice: 400,
      duration: 2,
      maxParticipantsPerSlot: 7,
      image: 'https://i.pinimg.com/564x/e5/d7/e0/e5d7e0dd7f0c9ffd41e7b53c5fce9d2f.jpg',
      timeSlots: [
        {
          id: 'quad-casa-1',
          date: '2024-03-23',
          startTime: '10:00',
          endTime: '12:00',
          availableSpots: 4
        },
        {
          id: 'quad-casa-2',
          date: '2024-03-23',
          startTime: '14:00',
          endTime: '16:00',
          availableSpots: 7
        },
        {
          id: 'quad-casa-3',
          date: '2024-03-24',
          startTime: '10:00',
          endTime: '12:00',
          availableSpots: 7
        }
      ]
    },
    'surf-essaouira': {
      id: 'surf-essaouira',
      title: 'Cours de Surf',
      description: 'Initiez-vous au surf sur les vagues d\'Essaouira',
      city: 'Essaouira',
      basePrice: 350,
      duration: 3,
      maxParticipantsPerSlot: 6,
      image: 'https://i.pinimg.com/564x/d9/5a/86/d95a86c6c5491c96b6c4b3c64c0d44f3.jpg',
      timeSlots: [
        {
          id: 'surf-ess-1',
          date: '2024-03-23',
          startTime: '09:00',
          endTime: '12:00',
          availableSpots: 3
        },
        {
          id: 'surf-ess-2',
          date: '2024-03-23',
          startTime: '14:00',
          endTime: '17:00',
          availableSpots: 6
        }
      ]
    },
    'cuisine-fes': {
      id: 'cuisine-fes',
      title: 'Atelier de Cuisine',
      description: 'Apprenez à préparer des plats traditionnels marocains',
      city: 'Fès',
      basePrice: 300,
      duration: 4,
      maxParticipantsPerSlot: 8,
      image: 'https://i.pinimg.com/564x/57/c6/fa/57c6fa9d423d3e67f6142598142c7d71.jpg',
      timeSlots: [
        {
          id: 'cuisine-fes-1',
          date: '2024-03-23',
          startTime: '10:00',
          endTime: '14:00',
          availableSpots: 5
        },
        {
          id: 'cuisine-fes-2',
          date: '2024-03-24',
          startTime: '10:00',
          endTime: '14:00',
          availableSpots: 8
        }
      ]
    }
  };

  const cities = ['all', 'Casablanca', 'Essaouira', 'Fès'];
  const dates = [...new Set(
    Object.values(localActivities)
      .flatMap(activity => activity.timeSlots.map(slot => slot.date))
  )].sort();

  const formatPrice = (price) => {
    return `${price.toLocaleString()} DH`;
  };

  const getFilteredActivities = () => {
    return Object.values(localActivities).filter(activity => {
      const cityMatch = selectedCity === 'all' || activity.city === selectedCity;
      const dateMatch = !selectedDate || activity.timeSlots.some(slot => slot.date === selectedDate);
      return cityMatch && dateMatch;
    });
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Header */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Activités Locales</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profitez de votre weekend avec nos activités organisées en petits groupes
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-sahara" />
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 focus:border-sahara focus:ring-1 focus:ring-sahara"
            >
              <option value="all">Toutes les villes</option>
              {cities.filter(city => city !== 'all').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-sahara" />
            <select 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 focus:border-sahara focus:ring-1 focus:ring-sahara"
            >
              <option value="">Toutes les dates</option>
              {dates.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getFilteredActivities().map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 relative">
                <img 
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sahara font-semibold">
                  {activity.city}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{activity.title}</h3>
                <p className="mt-2 text-gray-600 line-clamp-2">{activity.description}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                    <FaClock />
                    {activity.duration}h
                  </span>
                  <span className="flex items-center gap-1 px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                    <FaUsers />
                    Max {activity.maxParticipantsPerSlot} pers.
                  </span>
                </div>

                {/* Time Slots */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Créneaux disponibles :</h4>
                  <div className="space-y-2">
                    {activity.timeSlots
                      .filter(slot => !selectedDate || slot.date === selectedDate)
                      .map((slot) => (
                        <div 
                          key={slot.id} 
                          className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-sahara"
                        >
                          <div>
                            <div className="font-medium">
                              {new Date(slot.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                            <div className="text-sm text-gray-600">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sahara font-semibold">{formatPrice(activity.basePrice)}</div>
                            <div className="text-sm text-gray-600">
                              {slot.availableSpots} places restantes
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => window.location.href = `/activities/${activity.id}`}
                  className="mt-6 w-full bg-sahara text-white py-2 rounded-full hover:bg-sahara/90 transition-colors"
                >
                  Réserver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitesLocales; 