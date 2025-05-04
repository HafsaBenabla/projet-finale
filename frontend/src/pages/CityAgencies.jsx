import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaUsers, FaClock, FaMoneyBillWave, FaAngleRight, FaStar, FaCompass, FaChevronRight } from 'react-icons/fa';
import ImageUploader from '../components/ImageUploader';

// Image par défaut pour les agences
const DEFAULT_AGENCY_IMAGE = "https://images.pexels.com/photos/1537008/pexels-photo-1537008.jpeg";

// Fonction pour rendre les étoiles
const renderStars = (starsCount) => {
  const stars = parseFloat(starsCount) || 0;
  const validStars = Math.min(Math.max(stars, 0), 5);
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar 
          key={star}
          className={`${star <= validStars ? 'text-yellow-400' : 'text-gray-300'} ${star - 0.5 === validStars ? 'opacity-70' : ''}`} 
          size={16}
        />
      ))}
    </div>
  );
};

function CityAgencies() {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('all');
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agencyVoyages, setAgencyVoyages] = useState({});
  const [loadingVoyages, setLoadingVoyages] = useState({});

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching agencies for city:', cityName);
      
      // Si on demande toutes les villes, ne pas filtrer par ville
      const isToutesVilles = cityName.toLowerCase() === "toutes les villes du maroc".toLowerCase();
      const endpoint = isToutesVilles 
        ? 'http://localhost:5000/api/agencies' 
        : `http://localhost:5000/api/agencies?city=${encodeURIComponent(cityName)}`;
      
      const response = await fetch(endpoint);
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
        displayCity: agency.city.toLowerCase().includes("toutes les villes du maroc".toLowerCase()) 
          ? "Toutes les villes du Maroc" 
          : agency.city,
        type: agency.type || 'voyage'
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

  // Fonction pour récupérer les voyages d'une agence
  const fetchAgencyVoyages = async (agencyId) => {
    if (loadingVoyages[agencyId] || agencyVoyages[agencyId]) return;
    
    try {
      setLoadingVoyages(prev => ({ ...prev, [agencyId]: true }));
      
      const response = await fetch(`http://localhost:5000/api/voyages/by-agency/${agencyId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des voyages');
      }
      
      const data = await response.json();
      console.log(`Voyages récupérés pour l'agence ${agencyId}:`, data);
      
      setAgencyVoyages(prev => ({ ...prev, [agencyId]: data }));
    } catch (err) {
      console.error(`Erreur lors de la récupération des voyages pour l'agence ${agencyId}:`, err);
    } finally {
      setLoadingVoyages(prev => ({ ...prev, [agencyId]: false }));
    }
  };

  // Navigation vers la page des voyages de l'agence
  const navigateToAgencyVoyages = (agencyId, agencyName) => {
    navigate(`/voyages?agencyId=${agencyId}&agencyName=${encodeURIComponent(agencyName)}`);
  };

  // Navigation vers la page de détail d'un voyage
  const navigateToVoyage = (voyageId) => {
    navigate(`/voyage/${voyageId}`);
  };

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

  // Fonction pour filtrer les agences par type
  const getFilteredAgencies = () => {
    if (selectedType === 'all') return agencies;
    return agencies.filter(agency => agency.type === selectedType);
  };

  const renderAgencyCard = (agency) => {
    const voyages = agencyVoyages[agency._id] || [];
    const isLoading = loadingVoyages[agency._id];
    
    return (
      <div key={agency._id} className="bg-white overflow-hidden group transition-all duration-700 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] relative rounded-xl border border-gray-100 hover:border-orange-200/50">
        <div className="flex flex-col h-full">
          {/* Image de l'agence avec overlay élégant - hauteur réduite */}
          <div className="relative h-44 overflow-hidden">
            <img 
              src={agency.image}
              alt={`Agence ${agency.name}`}
              className="w-32 h-32 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
              onError={handleImageError}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100 to-white opacity-90"></div>
            
            {/* Badge type d'agence */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg z-20 border border-white/50">
              <span className="text-sm font-medium text-sahara">
                {agency.type === 'activite' ? 'Activités' : 'Voyages'}
              </span>
            </div>
            
            {/* Badge étoiles amélioré */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg z-20 border border-white/50">
              {renderStars(agency.stars)}
            </div>
            
            {/* Nom et ville en overlay sur l'image */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-xl font-light text-white mb-2 tracking-wider shadow-text">{agency.name}</h3>
              <div className="flex items-center">
                <div className="flex items-center text-white/90 text-xs bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <FaMapMarkerAlt className="mr-2" size={12} />
                  <span className="font-light tracking-wider">{agency.displayCity}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Informations de l'agence - section compactée */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            {/* Description élégante - version compacte */}
            <div className="mb-4 text-center">
              <p className="text-gray-600 italic text-sm font-light leading-relaxed line-clamp-3 before:content-['\22'] after:content-['\22'] before:text-orange-400 after:text-orange-400 before:text-lg after:text-lg">
                {agency.description}
              </p>
            </div>
            
            {/* Informations générales de l'agence au lieu des contacts directs */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 group/item transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shadow-sm border border-orange-200">
                  <FaStar className="text-orange-500" size={14} />
                </div>
                <span className="text-xs font-light text-gray-600 truncate">
                  Agence {agency.stars >= 4 ? 'premium' : 'partenaire'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 group/item transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shadow-sm border border-orange-200">
                  <FaUsers className="text-orange-500" size={14} />
                </div>
                <span className="text-xs text-gray-600 font-light truncate">
                  {voyages.length > 0 ? `${voyages.length} voyages proposés` : 'Voyages personnalisés'}
                </span>
              </div>
            </div>

            {/* Section des voyages - version compacte */}
            <div>
              {!isLoading && voyages.length === 0 && !agencyVoyages[agency._id] && (
                <button 
                  onClick={() => navigateToAgencyVoyages(agency._id, agency.name)}
                  className="w-full py-2.5 text-xs bg-orange-500 text-white uppercase tracking-widest font-light hover:bg-orange-600 transition-all flex items-center justify-center shadow-sm hover:shadow-md border border-orange-600/50 rounded-lg"
                >
                  Découvrir les voyages <FaAngleRight className="ml-2" size={12} />
                </button>
              )}
              
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-7 w-7 border-[2px] border-orange-100 border-t-orange-400"></div>
                </div>
              )}
              
              {voyages.length === 0 && agencyVoyages[agency._id] && (
                <div className="text-center p-2 bg-gradient-to-r from-orange-50/30 to-white rounded-md border border-orange-100/50">
                  <p className="text-gray-400 text-xs py-1 font-light italic">
                    Aucun voyage disponible pour le moment
                  </p>
                </div>
              )}
              
              {voyages.length > 0 && (
                <>
                  <div className="space-y-2">
                    {voyages.slice(0, 1).map(voyage => (
                      <div 
                        key={voyage._id}
                        className="flex items-center p-2 bg-gradient-to-r from-white to-orange-50/10 rounded-lg cursor-pointer hover:shadow-md transition-all border border-orange-200/40 hover:border-orange-300/50 group/voyage"
                        onClick={() => navigateToVoyage(voyage._id)}
                      >
                        <div className="relative h-16 w-20 overflow-hidden rounded-md shadow-sm mr-3">
                          <img 
                            src={voyage.image}
                            alt={voyage.title}
                            className="h-full w-full object-cover transform group-hover/voyage:scale-105 transition-transform duration-700"
                            onError={(e) => { e.target.src = "https://images.pexels.com/photos/2577274/pexels-photo-2577274.jpeg" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="mb-1">
                            <h5 className="font-light text-sm mb-1 truncate group-hover/voyage:text-orange-500 transition-colors">{voyage.title}</h5>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="bg-orange-100 px-1.5 py-0.5 rounded-full text-orange-700 text-[10px] font-medium">{voyage.destination}</span>
                              {voyage.duration && (
                                <span className="ml-2 text-[10px] text-gray-400">{voyage.duration} jours</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-orange-500">{voyage.price ? `${voyage.price.toLocaleString()} DH` : 'Sur demande'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {voyages.length > 1 && (
                    <button 
                      onClick={() => navigateToAgencyVoyages(agency._id, agency.name)}
                      className="w-full mt-2 py-1.5 bg-orange-100 text-orange-600 text-xs font-light hover:bg-orange-200 transition-all flex items-center justify-center rounded-lg"
                    >
                      Voir tous les voyages ({voyages.length}) <FaChevronRight className="ml-2" size={8} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* En-tête avec titre et filtres */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
            {cityName.toLowerCase() === "toutes les villes du maroc".toLowerCase() ? "Toutes nos agences au Maroc" : `Agences à ${cityName}`}
          </h1>
          
          {/* Boutons de filtre */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-6 py-2.5 rounded-full transition-all duration-300 ${
                selectedType === 'all'
                  ? 'bg-sahara text-white shadow-lg shadow-sahara/30'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-sahara/50'
              }`}
            >
              Toutes les agences
            </button>
            <button
              onClick={() => setSelectedType('voyage')}
              className={`px-6 py-2.5 rounded-full transition-all duration-300 ${
                selectedType === 'voyage'
                  ? 'bg-sahara text-white shadow-lg shadow-sahara/30'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-sahara/50'
              }`}
            >
              Agences de voyages
            </button>
            <button
              onClick={() => setSelectedType('activite')}
              className={`px-6 py-2.5 rounded-full transition-all duration-300 ${
                selectedType === 'activite'
                  ? 'bg-sahara text-white shadow-lg shadow-sahara/30'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-sahara/50'
              }`}
            >
              Agences d'activités
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-orange-200 border-t-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-600 text-lg">
              Une erreur est survenue lors du chargement des agences.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredAgencies().length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">Aucune agence trouvée pour ce type</p>
              </div>
            ) : (
              getFilteredAgencies().map(agency => renderAgencyCard(agency))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CityAgencies;
