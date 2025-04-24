import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const ActivitesVoyages = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voyagesById, setVoyagesById] = useState({}); // Pour stocker les voyages par ID
  const [searchingVoyage, setSearchingVoyage] = useState(false); // État de chargement pour la recherche de voyage

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

  // Effet pour vérifier les IDs de voyage des activités
  useEffect(() => {
    if (activities.length > 0) {
      console.log('Vérification des IDs de voyage pour les activités chargées:');
      activities.forEach((activity, index) => {
        console.log(`Activité ${index + 1} - ${activity.name}:`, {
          id: activity._id,
          voyageId: activity.voyageId,
          type: activity.type
        });
      });
      
      // Vérifier les activités sans ID de voyage
      const activitiesWithoutVoyageId = activities.filter(a => !a.voyageId);
      if (activitiesWithoutVoyageId.length > 0) {
        console.warn('Activités sans ID de voyage:', activitiesWithoutVoyageId.map(a => a.name));
      }
    }
  }, [activities]);

  // Fonction pour trouver un voyage associé à une activité
  const getVoyageByActivity = async (activityId) => {
    try {
      console.log(`Recherche du voyage pour l'activité ${activityId}...`);
      // D'abord, essayer de récupérer l'activité pour voir si elle contient déjà le voyageId
      const activityResponse = await axios.get(`http://localhost:5000/api/activities/${activityId}`);
      
      if (activityResponse.data && activityResponse.data.voyageId) {
        // Si voyageId est un objet avec un _id
        if (typeof activityResponse.data.voyageId === 'object' && activityResponse.data.voyageId._id) {
          console.log(`Voyage trouvé directement depuis l'activité:`, activityResponse.data.voyageId._id);
          return activityResponse.data.voyageId._id;
        }
        // Si voyageId est directement une chaîne
        if (typeof activityResponse.data.voyageId === 'string') {
          console.log(`Voyage trouvé directement depuis l'activité:`, activityResponse.data.voyageId);
          return activityResponse.data.voyageId;
        }
      }
      
      // Si on n'a pas trouvé avec la méthode directe, essayer de chercher parmi tous les voyages
      console.log('Recherche du voyage parmi tous les voyages...');
      const response = await axios.get(`http://localhost:5000/api/voyages`);
      
      if (Array.isArray(response.data)) {
        // Parcourir les voyages pour trouver celui qui contient cette activité
        const voyage = response.data.find(v => 
          v.activities && v.activities.some(a => {
            // Comparer l'ID de l'activité, qu'il soit un objet ou une chaîne
            if (typeof a === 'object' && a._id) {
              return a._id === activityId;
            }
            return a === activityId;
          })
        );
        
        if (voyage) {
          console.log(`Voyage trouvé par recherche parmi les voyages:`, voyage._id);
          // Mettre à jour le cache des voyages
          setVoyagesById(prev => ({
            ...prev,
            [activityId]: voyage._id
          }));
          return voyage._id;
        } else {
          console.warn(`Aucun voyage trouvé pour l'activité ${activityId}`);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error(`Erreur lors de la recherche du voyage pour l'activité ${activityId}:`, error);
      return null;
    }
  };

  // Fonction utilitaire pour extraire un ID valide à partir d'un objet ou d'une chaîne
  const extractValidId = (idOrObject) => {
    if (!idOrObject) return null;
    
    // Si c'est un objet avec un _id
    if (typeof idOrObject === 'object' && idOrObject._id) {
      return idOrObject._id.toString();
    }
    // Si c'est déjà une chaîne
    if (typeof idOrObject === 'string') {
      return idOrObject;
    }
    // Cas de dernier recours: essayer de convertir en chaîne
    try {
      return String(idOrObject);
    } catch (e) {
      console.error("Impossible de convertir l'ID en chaîne:", e);
      return null;
    }
  };

  // Fonction pour naviguer vers le voyage d'une activité
  const navigateToVoyage = async (activity) => {
    setSearchingVoyage(true); // Début de la recherche
    try {
      console.log('Activité complète:', activity);
      console.log('Type de voyageId:', typeof activity.voyageId);
      console.log('Valeur de voyageId:', activity.voyageId);
      
      // Traiter le voyageId pour s'assurer qu'il est au bon format
      let voyageIdToUse = extractValidId(activity.voyageId);
      
      if (voyageIdToUse) {
        console.log('ID du voyage à utiliser:', voyageIdToUse);
        window.location.href = `/voyage/${voyageIdToUse}`;
      } else if (voyagesById[activity._id]) {
        // Si nous avons déjà trouvé ce voyage dans notre cache
        voyageIdToUse = extractValidId(voyagesById[activity._id]);
        console.log('Utilisation du voyageId depuis le cache:', voyageIdToUse);
        
        if (voyageIdToUse) {
          window.location.href = `/voyage/${voyageIdToUse}`;
        } else {
          console.error('ID de voyage du cache invalide');
          alert('ID de voyage invalide.');
          setSearchingVoyage(false); // Fin de la recherche
        }
      } else {
        // Essayer de trouver le voyage par l'activité
        const voyageId = await getVoyageByActivity(activity._id);
        const validVoyageId = extractValidId(voyageId);
        
        if (validVoyageId) {
          console.log('Utilisation du voyageId trouvé via l\'API:', validVoyageId);
          window.location.href = `/voyage/${validVoyageId}`;
        } else {
          console.error('Erreur: ID du voyage introuvable pour cette activité');
          alert('Impossible d\'accéder aux détails du voyage. Voyage non trouvé.');
          setSearchingVoyage(false); // Fin de la recherche
        }
      }
    } catch (error) {
      console.error('Erreur lors de la navigation vers le voyage:', error);
      alert('Une erreur est survenue lors de la tentative d\'accès au voyage.');
      setSearchingVoyage(false); // Fin de la recherche en cas d'erreur
    }
  };

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
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-sahara/10 text-sahara rounded-full text-base font-medium whitespace-nowrap">
                    <FaClock className="text-lg" />
                    {formatDuration(activity.duration)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-sahara/10 text-sahara rounded-full text-base font-medium whitespace-nowrap">
                    <FaUsers className="text-lg" />
                    Max {activity.maxParticipants}
                  </span>
                  {activity.category && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-sahara/10 text-sahara rounded-full text-base font-medium whitespace-nowrap">
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
                      onClick={() => {
                        console.log('ID du voyage:', activity.voyageId);
                        navigateToVoyage(activity);
                      }}
                      className="px-4 py-2 bg-sahara text-white rounded-full hover:bg-sahara/90 transition-colors"
                      disabled={searchingVoyage}
                    >
                      {searchingVoyage ? (
                        <>
                          <FaSpinner className="inline-block animate-spin mr-2" />
                          Recherche...
                        </>
                      ) : 'Voir le voyage'}
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
