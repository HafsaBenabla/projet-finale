import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVoyages } from '../context/VoyagesContext';
import { useAuth } from '../context/AuthContext';
import { FaBuilding, FaCalendarAlt, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import VoyageReactionPanel from '../components/VoyageReactionPanel';

const Voyages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { voyages, loading, error } = useVoyages();
  
  // Récupérer les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const agencyIdParam = queryParams.get('agencyId');
  const agencyNameParam = queryParams.get('agencyName');
  const destinationParam = queryParams.get('destination');
  const dateParam = queryParams.get('date');
  const travelersParam = queryParams.get('travelers');
  
  // État pour les filtres
  const [destinationFilter, setDestinationFilter] = useState(destinationParam || '');
  const [durationFilter, setDurationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [agencyFilter, setAgencyFilter] = useState(agencyIdParam || '');
  const [agencyName, setAgencyName] = useState(agencyNameParam || '');
  const [dateFilter, setDateFilter] = useState(dateParam || '');
  const [travelersFilter, setTravelersFilter] = useState(travelersParam || '');

  // Définir les filtres si présents dans l'URL
  useEffect(() => {
    if (agencyIdParam) {
      setAgencyFilter(agencyIdParam);
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
  }, [agencyIdParam, destinationParam, dateParam, travelersParam]);

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

  const handleClearAgency = () => {
    setAgencyFilter('');
    setAgencyName('');
    updateFilters('agencyId', '');
    updateFilters('agencyName', '');
  };

  const handleClearAllFilters = () => {
    setDestinationFilter('');
    setDurationFilter('');
    setBudgetFilter('');
    setAgencyFilter('');
    setAgencyName('');
    setDateFilter('');
    setTravelersFilter('');
    navigate('/voyages');
  };

  // Filtrer les voyages en fonction des filtres sélectionnés
  const filteredVoyages = useMemo(() => {
    if (!voyages) return [];
    
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
  }, [voyages, destinationFilter, durationFilter, budgetFilter, agencyFilter, dateFilter, travelersFilter]);

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
                          setDateFilter('');
                          updateFilters('date', '');
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
                          setTravelersFilter('');
                          updateFilters('travelers', '');
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

      {/* Voyages Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredVoyages.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl text-gray-600 mb-4">Aucun voyage ne correspond à vos critères</h3>
            <p className="text-gray-500">Veuillez modifier vos filtres ou revenir plus tard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVoyages.map((voyage) => (
              <div 
                key={voyage._id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105"
                onClick={() => navigate(`/voyage/${voyage._id}`)}
              >
                <div className="relative h-48 overflow-hidden group">
                  <img 
                    src={voyage.image.startsWith('http') ? voyage.image : `http://localhost:5000${voyage.image}`} 
                    alt={voyage.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{voyage.title}</h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaMapMarkerAlt className="mr-2 text-orange-500" />
                    <span>{voyage.destination}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {voyage.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-orange-600">{voyage.price} DH</span>
                    <span className="text-sm text-gray-500">{voyage.duration} jour{voyage.duration > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    {/* Composant de réactions */}
                    <VoyageReactionPanel voyageId={voyage._id} />

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/voyage/${voyage._id}`);
                      }}
                      className="px-6 py-2 bg-sahara text-white rounded-full font-medium hover:bg-sahara/90 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sahara focus:ring-offset-2"
                    >
                      Plus de détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Voyages;
