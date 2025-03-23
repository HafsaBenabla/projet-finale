import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

// Image par défaut pour les agences
const DEFAULT_AGENCY_IMAGE = "https://images.pexels.com/photos/1537008/pexels-photo-1537008.jpeg";

// Fonction pour rendre les étoiles
const renderStars = (starsCount) => {
  const stars = parseInt(starsCount) || 0;
  const validStars = Math.min(Math.max(stars, 0), 5);
  
  return (
    <div className="flex items-center space-x-1">
      {validStars > 0 ? (
        [...Array(validStars)].map((_, index) => (
          <span key={index} className="text-yellow-400 text-lg">⭐</span>
        ))
      ) : (
        <span className="text-gray-400 text-sm">Pas encore noté</span>
      )}
    </div>
  );
};

function CityAgencies() {
  const { cityName } = useParams();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching agencies for city:', cityName);
      
      const response = await fetch(`http://localhost:5000/api/agencies?city=${encodeURIComponent(cityName)}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des agences');
      }
      
      const data = await response.json();
      console.log('Données reçues du serveur:', data);

      // Vérifier et nettoyer les données des agences
      const cleanedAgencies = data.map(agency => ({
        ...agency,
        image: agency.image?.trim() || DEFAULT_AGENCY_IMAGE,
        stars: parseFloat(agency.stars) || 0,
        displayCity: agency.city === "Toutes les villes du Maroc" ? "Toutes les villes du Maroc" : agency.city
      }));
      
      console.log('Agences après nettoyage:', cleanedAgencies);
      setAgencies(cleanedAgencies);
    } catch (err) {
      console.error('Erreur lors de la récupération des agences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityName) {
      console.log('Démarrage du chargement des agences pour:', cityName);
      fetchAgencies();
    } else {
      console.error('Nom de ville manquant');
      setError('Nom de ville manquant');
      setLoading(false);
    }
  }, [cityName]);

  // Fonction pour gérer les erreurs de chargement d'image
  const handleImageError = (e) => {
    console.log(`Erreur de chargement d'image. URL qui a échoué:`, e.target.src);
    e.target.src = DEFAULT_AGENCY_IMAGE;
  };

  const handleImageUpload = (imageUrl) => {
    // Implementation of handleImageUpload
  };

  const handleSubmit = async (e) => {
    // Implementation of handleSubmit
  };

  const renderAgencyCard = (agency) => {
    return (
      <div key={agency._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
        <div className="relative h-64">
          <img 
            src={agency.image}
            alt={`Agence ${agency.name}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-bold text-white mb-2">{agency.name}</h3>
            <div className="flex items-center space-x-2 text-white">
              <i className="fas fa-map-marker-alt"></i>
              <span className="text-sm">{agency.displayCity}</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            {renderStars(agency.stars)}
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 line-clamp-3 italic">
              "{agency.description}"
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sahara/10 rounded-full flex items-center justify-center">
                <i className="fas fa-map-marker-alt text-sahara text-lg"></i>
              </div>
              <span className="text-gray-700">{agency.address}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sahara/10 rounded-full flex items-center justify-center">
                <i className="fas fa-phone text-sahara text-lg"></i>
              </div>
              <a href={`tel:${agency.phone}`} className="text-gray-700 hover:text-sahara transition-colors">
                {agency.phone}
              </a>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sahara/10 rounded-full flex items-center justify-center">
                <i className="fas fa-envelope text-sahara text-lg"></i>
              </div>
              <a href={`mailto:${agency.email}`} className="text-gray-700 hover:text-sahara transition-colors">
                {agency.email}
              </a>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = `mailto:${agency.email}?subject=Contact depuis MaghrebXplore - ${agency.name}`}
            className="w-full mt-4 bg-sahara text-white py-3 rounded-xl font-medium hover:bg-sahara/90 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-paper-plane"></i>
            Contacter l'agence
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agences à {cityName}
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez les meilleures agences de voyage à {cityName}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sahara"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-600 text-lg">
              Une erreur est survenue lors du chargement des agences.
            </p>
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              Aucune agence n'est encore disponible à {cityName}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agencies.map(renderAgencyCard)}
          </div>
        )}
      </div>
    </div>
  );
}

export default CityAgencies;
