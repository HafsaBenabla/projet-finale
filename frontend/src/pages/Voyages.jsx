import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVoyages } from '../context/VoyagesContext';
import { useAuth } from '../context/AuthContext';
import { FaBuilding, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaSync } from 'react-icons/fa';
import VoyageCard from '../components/VoyageCard';

const Voyages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { voyages, loading, error, refreshVoyages, lastFetchTime } = useVoyages();
  
  // État pour les filtres
  const [destinationFilter, setDestinationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [travelersFilter, setTravelersFilter] = useState('');

  // Définir les filtres si présents dans l'URL
  useEffect(() => {
    // Récupérer les paramètres d'URL à chaque changement de location
    const params = new URLSearchParams(location.search);
    const agencyIdParam = params.get('agencyId');
    const agencyNameParam = params.get('agencyName');
    const destinationParam = params.get('destination');
    const dateParam = params.get('date');
    const travelersParam = params.get('travelers');
    const durationParam = params.get('duration');
    const budgetParam = params.get('budget');
    
    if (agencyIdParam) {
      setAgencyFilter(agencyIdParam);
    }
    if (agencyNameParam) {
      setAgencyName(agencyNameParam);
    }
    if (destinationParam) {
      setDestinationFilter(destinationParam);
    }
    if (dateParam) {
      setDateFilter(dateParam);
    }
    if (travelersParam) {
      setTravelersFilter(travelersParam);
    }
    if (durationParam) {
      setDurationFilter(durationParam);
    }
    if (budgetParam) {
      setBudgetFilter(budgetParam);
    }
  }, [location.search]);

  // Effect pour rafraîchir les données lorsque l'utilisateur visite la page
  useEffect(() => {
    console.log('Page Voyages montée - Vérification des données récentes');
    
<<<<<<< HEAD
    // Rafraîchir les données au montage du composant
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime;
    const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes
    
    if (timeSinceLastFetch > REFRESH_INTERVAL) {
      console.log('Données trop anciennes, rafraîchissement automatique');
      refreshVoyages();
    }
  }, [refreshVoyages, lastFetchTime]);
=======
    // Rafraîchir les données au montage du composant, mais seulement si nécessaire
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime;
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes (plus conservateur)
    
    if (timeSinceLastFetch > REFRESH_INTERVAL && voyages.length === 0) {
      console.log('Données inexistantes ou trop anciennes, rafraîchissement automatique');
      refreshVoyages();
    }
  }, []); // Dépendances réduites pour éviter les rafraîchissements excessifs
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)

  // Modifier les queryParams lors du changement de filtre
  const updateFilters = (name, value) => {
    const params = new URLSearchParams(location.search);
    
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    // Construire la nouvelle URL et naviguer
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  // Gestionnaires de changement de filtre
  const handleDestinationChange = (destination) => {
    setDestinationFilter(destination);
    updateFilters('destination', destination);
  };

  const handleDurationChange = (duration) => {
    setDurationFilter(duration);
    updateFilters('duration', duration);
  };

  const handleBudgetChange = (budget) => {
    setBudgetFilter(budget);
    updateFilters('budget', budget);
  };

  const handleDateChange = (date) => {
    setDateFilter(date);
    updateFilters('date', date);
  };

  const handleTravelersChange = (travelers) => {
    setTravelersFilter(travelers);
    updateFilters('travelers', travelers);
  };

  const handleClearAgency = () => {
    setAgencyFilter('');
    setAgencyName('');
    updateFilters('agencyId', '');
    updateFilters('agencyName', '');
  };

  const handleClearAllFilters = () => {
    handleDestinationChange('');
    handleDurationChange('');
    handleBudgetChange('');
    handleClearAgency();
    handleDateChange('');
    handleTravelersChange('');
    // Rediriger vers la page de base sans paramètres
    navigate('/voyages');
  };
  
  // Gestionnaire pour forcer un rafraîchissement manuel
  const handleManualRefresh = () => {
    console.log('Rafraîchissement manuel des voyages');
    refreshVoyages();
  };

  // Filtrer les voyages en fonction des filtres sélectionnés
  const filteredVoyages = useMemo(() => {
    if (!voyages) return [];
    
    console.log(`Filtrage des voyages (${voyages.length} voyages, lastFetchTime: ${new Date(lastFetchTime).toLocaleTimeString()})`);
    
    return voyages.filter(voyage => {
      // Filtre par destination
      if (destinationFilter && !voyage.destination.toLowerCase().includes(destinationFilter.toLowerCase())) {
        return false;
      }
      
      // Filtre par durée
      if (durationFilter) {
        const durationNumber = Number(voyage.duration);
        if (durationFilter === '1-3' && (durationNumber < 1 || durationNumber > 3)) return false;
        if (durationFilter === '4-7' && (durationNumber < 4 || durationNumber > 7)) return false;
        if (durationFilter === '8+' && durationNumber < 8) return false;
      }
      
      // Filtre par budget
      if (budgetFilter) {
        const price = Number(voyage.price);
        if (budgetFilter === 'low' && price > 3000) return false;
        if (budgetFilter === 'medium' && (price < 3000 || price > 7000)) return false;
        if (budgetFilter === 'high' && price < 7000) return false;
      }
      
      // Filtre par agence
      if (agencyFilter && voyage.agencyId !== agencyFilter) {
        return false;
      }
      
      // Filtre par date
      if (dateFilter && voyage.departureDate && voyage.returnDate) {
        const selectedDate = new Date(dateFilter);
        const departureDate = new Date(voyage.departureDate);
        const returnDate = new Date(voyage.returnDate);
        
        // Vérifier si la date sélectionnée est dans la plage du voyage
        if (selectedDate < departureDate || selectedDate > returnDate) {
          return false;
        }
      }
      
      // Filtre par nombre de voyageurs
      if (travelersFilter && Number(travelersFilter) > voyage.availableSpots) {
        return false;
      }
      
      return true;
    });
  }, [voyages, destinationFilter, durationFilter, budgetFilter, agencyFilter, dateFilter, travelersFilter, lastFetchTime]);

  // Utiliser useEffect pour afficher les voyages même en cours de chargement
  useEffect(() => {
    console.log(`Page Voyages - Chargement: ${loading}, Erreur: ${error ? 'Oui' : 'Non'}, Voyages: ${voyages.length}, Dernier chargement: ${new Date(lastFetchTime).toLocaleTimeString()}`);
    if (location.search) {
      console.log('Paramètres d\'URL détectés:', location.search);
    }
  }, [loading, error, voyages, location.search, lastFetchTime]);

  // Afficher immédiatement les voyages filtrés si disponibles, même en cours de chargement
  const showFilteredVoyages = useMemo(() => {
    return voyages.length > 0;
  }, [voyages]);

  // Composant de rendu condititionnel pour les voyages
  const renderVoyages = () => {
    if (filteredVoyages.length === 0) {
      return (
        <div className="text-center py-16">
          <h3 className="text-2xl text-gray-600 mb-4">Aucun voyage ne correspond à vos critères</h3>
          <p className="text-gray-500">Veuillez modifier vos filtres ou revenir plus tard.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVoyages.map((voyage) => (
<<<<<<< HEAD
          <VoyageCard key={voyage._id + '-' + lastFetchTime} voyage={voyage} />
=======
          <VoyageCard key={voyage._id} voyage={voyage} />
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
        ))}
      </div>
    );
  };

  // Interface utilisateur avec gestion des états
  if (loading && !showFilteredVoyages) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sahara mb-4"></div>
        <p className="text-gray-600 text-lg">Chargement des voyages...</p>
      </div>
    );
  }

  if (error && voyages.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-sahara text-white rounded-full font-medium hover:bg-sahara/90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Filtre Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Titre avec nombre de résultats */}
            <div className="mr-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Voyages {agencyName ? `de ${agencyName}` : ''}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredVoyages.length} résultat{filteredVoyages.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Bouton de rafraîchissement manuel */}
            <button
              onClick={handleManualRefresh}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              title="Rafraîchir les données"
              disabled={loading}
            >
              <FaSync className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Rafraîchir</span>
            </button>

            {/* Affichage indicateur de chargement si données en cours de rafraîchissement */}
            {loading && (
              <div className="flex items-center text-gray-500 mr-2">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full mr-2"></div>
                <span className="text-sm">Actualisation...</span>
              </div>
            )}

            {/* Affichage des filtres actifs */}
            <div className="flex flex-wrap gap-2 items-center">
              {(destinationFilter || durationFilter || budgetFilter || agencyFilter || dateFilter || travelersFilter) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-gray-500 text-sm">Filtres actifs:</span>
                  
                  {destinationFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {destinationFilter}
                      <button 
                        onClick={() => handleDestinationChange('')} 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {durationFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {durationFilter === '1-3' ? '1-3 jours' : durationFilter === '4-7' ? '4-7 jours' : '8+ jours'}
                      <button 
                        onClick={() => handleDurationChange('')} 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {budgetFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {budgetFilter === 'low' ? 'Budget < 3000 DH' : budgetFilter === 'medium' ? '3000-7000 DH' : 'Budget > 7000 DH'}
                      <button 
                        onClick={() => handleBudgetChange('')} 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {agencyFilter && agencyName && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <FaBuilding className="mr-1" /> {agencyName}
                      <button 
                        onClick={handleClearAgency} 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {dateFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <FaCalendarAlt className="mr-1" /> {new Date(dateFilter).toLocaleDateString()}
                      <button 
                        onClick={() => {
                          handleDateChange('');
                        }} 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {travelersFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <FaUsers className="mr-1" /> {travelersFilter} voyageur(s)
                      <button 
                        onClick={() => {
                          handleTravelersChange('');
                        }} 
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  <button 
                    onClick={handleClearAllFilters}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Effacer tous les filtres
                  </button>
                </div>
              )}
            </div>

            {/* Sélecteurs de filtre */}
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={destinationFilter}
              onChange={(e) => handleDestinationChange(e.target.value)}
            >
              <option value="">Toutes les destinations</option>
              {useMemo(() => {
                return [...new Set((voyages || []).map(voyage => voyage.destination))];
              }, [voyages]).map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
            
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={durationFilter}
              onChange={(e) => handleDurationChange(e.target.value)}
            >
              <option value="">Durée</option>
              <option value="1-3">1-3 jours</option>
              <option value="4-7">4-7 jours</option>
              <option value="8+">8+ jours</option>
            </select>
            
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={budgetFilter}
              onChange={(e) => handleBudgetChange(e.target.value)}
            >
              <option value="">Budget</option>
              <option value="low">Moins de 3000 DH</option>
              <option value="medium">3000-7000 DH</option>
              <option value="high">Plus de 7000 DH</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voyages Grid avec gestion des erreurs */}
      <div className="container mx-auto px-4 py-12">
        {error && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-orange-500">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-700">
                  Affichage des données en cache. {error}
                  <button 
                    onClick={() => window.location.reload()} 
                    className="ml-2 font-medium underline"
                  >
                    Réessayer
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {renderVoyages()}
      </div>
    </div>
  );
};

export default Voyages;
