import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const ActivitesLocales = () => {
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('Début du chargement des activités locales...');
        // Appel à l'API avec filtre pour type 'locale'
        const response = await axios.get('http://localhost:5000/api/activities', {
          params: { type: 'locale' }
        });
        
        if (Array.isArray(response.data)) {
          setActivities(response.data);
          console.log('Activités locales chargées:', response.data);
          
          // Extraire les villes disponibles
          const uniqueCities = [...new Set(response.data.map(activity => activity.city))].sort();
          setCities(['all', ...uniqueCities]);
          
          // Extraire les dates disponibles des créneaux si présents
          const allDates = response.data
            .filter(activity => activity.timeSlots && activity.timeSlots.length > 0)
            .flatMap(activity => 
              activity.timeSlots.map(slot => 
                slot.date instanceof Date ? slot.date.toISOString().split('T')[0] : 
                typeof slot.date === 'string' ? slot.date.split('T')[0] : null
              )
            )
            .filter(date => date !== null);
          
          setDates([...new Set(allDates)].sort());
        } else {
          console.error('La réponse n\'est pas un tableau:', response.data);
          setError('Format de données incorrect');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des activités locales:', err);
        setError(err.message || 'Erreur lors du chargement des activités locales');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatPrice = (price) => {
    return `${price.toLocaleString()} DH`;
  };

  const formatDuration = (duration) => {
    return duration >= 24 
      ? `${Math.floor(duration/24)} jours` 
      : `${duration} heures`;
  };

  const getFilteredActivities = () => {
    return activities.filter(activity => {
      const cityMatch = selectedCity === 'all' || activity.city === selectedCity;
      const dateMatch = !selectedDate || 
        (activity.timeSlots && activity.timeSlots.some(slot => {
          const slotDate = slot.date instanceof Date 
            ? slot.date.toISOString().split('T')[0] 
            : typeof slot.date === 'string' 
              ? slot.date.split('T')[0] 
              : null;
          return slotDate === selectedDate;
        }));
      return cityMatch && dateMatch;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <FaSpinner className="animate-spin text-sahara text-4xl mr-3" />
        <span className="text-xl">Chargement des activités locales...</span>
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

  const filteredActivities = getFilteredActivities();

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
          {dates.length > 0 && (
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
          )}
        </div>

        {/* Activities Grid */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Aucune activité locale ne correspond à vos critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => (
              <div key={activity._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-48 relative">
                  <img 
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sahara font-semibold">
                    {activity.city}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">{activity.description}</p>
                  
                  <div className="mt-4 flex flex-nowrap space-x-2 items-center">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-sahara/10 text-sahara rounded-full text-base font-medium whitespace-nowrap">
                      <FaClock className="text-lg" />
                      {formatDuration(activity.duration)}
                    </span>
                    {activity.category && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-sahara/10 text-sahara rounded-full text-base font-medium whitespace-nowrap">
                        {activity.category}
                      </span>
                    )}
                  </div>

                  {/* Time Slots */}
                  {activity.timeSlots && activity.timeSlots.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Créneaux disponibles :</h4>
                      <div className="space-y-2">
                        {activity.timeSlots
                          .filter(slot => !selectedDate || (
                            (slot.date instanceof Date 
                              ? slot.date.toISOString().split('T')[0] 
                              : typeof slot.date === 'string' 
                                ? slot.date.split('T')[0] : null) === selectedDate
                          ))
                          .map((slot, index) => {
                            const slotDate = slot.date instanceof Date 
                              ? slot.date 
                              : new Date(slot.date);
                            
                            return (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-sahara"
                              >
                                <div>
                                  <div className="font-medium">
                                    {slotDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sahara font-semibold">{formatPrice(activity.price)}</div>
                                  <div className="text-sm text-gray-600">
                                    {slot.availableSpots} places restantes
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="text-sahara font-semibold">{formatPrice(activity.price)}</div>
                    </div>
                  )}

                  <button 
                    onClick={() => window.location.href = `/activities/${activity._id}`}
                    className="mt-6 w-full bg-sahara text-white py-2 rounded-full hover:bg-sahara/90 transition-colors"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitesLocales; 