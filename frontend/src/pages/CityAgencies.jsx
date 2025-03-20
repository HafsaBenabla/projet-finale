import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
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
            <div className="flex items-center space-x-1">
              {agency.stars > 0 ? (
                [...Array(Math.floor(agency.stars))].map((_, index) => (
                  <span key={index} className="text-yellow-400 text-lg">★</span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Pas encore noté</span>
              )}
              {agency.stars % 1 !== 0 && (
                <span className="text-yellow-400 text-lg">½</span>
              )}
            </div>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sahara"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Agences de voyage à {cityName}</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Découvrez les meilleures agences de voyage à {cityName} et planifiez votre prochain voyage avec des professionnels expérimentés
          </p>
        </div>
      </div>

      {/* Agences Grid */}
      <div className="container mx-auto px-4 py-16">
        {agencies.length > 0 ? (
          <>
            <p className="text-center text-gray-600 mb-8">
              {agencies.length} agence{agencies.length > 1 ? 's' : ''} disponible{agencies.length > 1 ? 's' : ''} pour {cityName}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agencies.map(renderAgencyCard)}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <i className="fas fa-store-alt-slash text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Aucune agence à {cityName}
            </h3>
            <p className="text-gray-500">
              Aucune agence n'est encore enregistrée dans cette ville.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CityAgencies;
