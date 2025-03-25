import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const Activites = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('Début du chargement des activités...');
        const response = await axios.get('http://localhost:5000/api/activities');
        console.log('Réponse de l\'API:', response.data);
        
        if (Array.isArray(response.data)) {
          setAllActivities(response.data);
          console.log('Activités chargées:', response.data);
        } else {
          console.error('La réponse n\'est pas un tableau:', response.data);
          setError('Format de données incorrect');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des activités:', err);
        setError(err.message || 'Erreur lors du chargement des activités');
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

  const handleCategoryChange = (category) => {
    console.log('Changement de catégorie:', category);
    setSelectedCategory(category);
  };

  const getFilteredActivities = () => {
    console.log('Filtrage des activités. Catégorie:', selectedCategory);
    console.log('Toutes les activités:', allActivities);

    if (selectedCategory === 'all') {
      return allActivities;
    }

    const filterType = selectedCategory === 'travel' ? 'voyage' : 'locale';
    const filtered = allActivities.filter(activity => activity.type === filterType);
    console.log('Activités filtrées:', filtered);
    return filtered;
  };

  if (loading) {
    return (
      <div className="w-full pt-16 flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Chargement des activités...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-16 flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const filteredActivities = getFilteredActivities();
  console.log('Activités à afficher:', filteredActivities);

  if (allActivities.length === 0) {
    return (
      <div className="w-full pt-16">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">Activités au Maroc</h1>
              <p className="mt-4 text-xl text-gray-600">
                Aucune activité n'est disponible pour le moment
              </p>
            </div>
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
          {filteredActivities.map((activity) => (
            <div key={activity._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 relative">
                <img 
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">{activity.name}</h3>
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
                    onClick={() => window.location.href = `/activities/${activity._id}`}
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
