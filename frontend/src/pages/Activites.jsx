import React, { useState, useEffect } from 'react';

const Activites = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/activities');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des activités');
      }
      const data = await response.json();
      console.log('Fetched activities:', data);
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Une erreur est survenue lors du chargement des activités');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? `${price.toLocaleString()} MAD` : 'Prix non disponible';
  };

  const formatDuration = (duration) => {
    return typeof duration === 'number' ? `${duration}h` : 'Durée non spécifiée';
  };

  if (loading) {
    return (
      <div className="w-full pt-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-sahara text-xl">Chargement des activités...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-16">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Activités Locales</h1>
            <p className="mt-4 text-xl text-gray-600">Vivez des expériences authentiques avec nos guides locaux</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="px-6 py-2 rounded-full bg-sahara text-white">Tous</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Culture</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Aventure</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Gastronomie</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Artisanat</button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 py-8">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucune activité n'est disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <div key={activity._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-[1.02]">
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={activity.image || 'https://via.placeholder.com/400x300?text=Image+non+disponible'}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image error, using placeholder');
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sahara font-semibold">
                    {activity.city || 'Ville non spécifiée'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">{activity.title}</h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">{activity.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                      {formatDuration(activity.duration)}
                    </span>
                    <span className="px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                      Max {activity.maxParticipants || '0'} pers.
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sahara font-semibold">{formatPrice(activity.price)}</span>
                    <button className="px-4 py-2 bg-sahara text-white rounded-full hover:bg-sahara/90 transition-colors">
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vous ne trouvez pas l'activité idéale ?</h2>
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
