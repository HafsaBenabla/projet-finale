import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const ActivitesVoyages = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('Début du chargement des activités de voyage...');
        // Appel à l'API avec filtre pour type 'voyage'
        const response = await axios.get('http://localhost:5000/api/activities', {
          params: { type: 'voyage' }
        });
        
        if (Array.isArray(response.data)) {
          setActivities(response.data);
          console.log('Activités de voyage chargées:', response.data);
        } else {
          console.error('La réponse n\'est pas un tableau:', response.data);
          setError('Format de données incorrect');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des activités de voyage:', err);
        setError(err.message || 'Erreur lors du chargement des activités de voyage');
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

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <FaSpinner className="animate-spin text-sahara text-4xl mr-3" />
        <span className="text-xl">Chargement des activités de voyage...</span>
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

  if (activities.length === 0) {
    return (
      <div className="min-h-screen pt-16">
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Activités de Voyage</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aucune activité de voyage n'est disponible pour le moment
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Header */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Activités de Voyage</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des expériences complètes organisées par nos agences partenaires pour découvrir le Maroc
            </p>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div key={activity._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
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
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-sahara/10 text-sahara rounded-full text-sm whitespace-nowrap">
                    <FaClock className="text-sahara" />
                    {formatDuration(activity.duration)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-sahara/10 text-sahara rounded-full text-sm whitespace-nowrap">
                    <FaUsers className="text-sahara" />
                    Max {activity.maxParticipants}
                  </span>
                  {activity.category && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-sahara/10 text-sahara rounded-full text-sm whitespace-nowrap">
                      {activity.category}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sahara font-semibold">{formatPrice(activity.price)}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.location.href = `/activities/${activity._id}`}
                      className="px-4 py-2 bg-white border border-sahara text-sahara rounded-full hover:bg-sahara/10 transition-colors"
                    >
                      Voir les détails
                    </button>
                    <button 
                      onClick={() => window.location.href = `/activities/${activity._id}?reserver=true`}
                      className="px-4 py-2 bg-sahara text-white rounded-full hover:bg-sahara/90 transition-colors"
                      disabled={activity.availableSpots <= 0}
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vous cherchez une expérience personnalisée ?
          </h2>
          <p className="text-gray-600 mb-8">Contactez-nous pour planifier votre voyage sur mesure</p>
          <button className="px-8 py-3 bg-sahara text-white rounded-full hover:bg-sahara/90 transition-colors">
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivitesVoyages;
