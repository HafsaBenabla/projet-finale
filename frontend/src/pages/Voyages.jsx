import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoyages } from '../context/VoyagesContext';
import { FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown } from 'react-icons/fa';

const Voyages = () => {
  const navigate = useNavigate();
  const { voyages, loading, error } = useVoyages();
  
  // État pour les filtres
  const [destinationFilter, setDestinationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  // État pour gérer les likes et dislikes
  const [reactions, setReactions] = useState({});

  // Charger les réactions depuis le localStorage au démarrage
  useEffect(() => {
    const storedReactions = localStorage.getItem('voyageReactions');
    if (storedReactions) {
      setReactions(JSON.parse(storedReactions));
    }
  }, []);

  // Gérer le clic sur le bouton like ou dislike
  const handleReaction = (voyageId, type) => {
    // Copier l'état actuel
    const newReactions = { ...reactions };
    
    // Initialiser l'objet pour ce voyage s'il n'existe pas encore
    if (!newReactions[voyageId]) {
      newReactions[voyageId] = { liked: false, disliked: false };
    }
    
    // Déterminer quelle propriété modifier
    if (type === 'like') {
      // Si on clique sur like, on désactive dislike automatiquement
      newReactions[voyageId].disliked = false;
      // Inverser l'état actuel du like
      newReactions[voyageId].liked = !newReactions[voyageId].liked;
    } else if (type === 'dislike') {
      // Si on clique sur dislike, on désactive like automatiquement
      newReactions[voyageId].liked = false;
      // Inverser l'état actuel du dislike
      newReactions[voyageId].disliked = !newReactions[voyageId].disliked;
    }

    // Mettre à jour l'état
    setReactions(newReactions);

    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('voyageReactions', JSON.stringify(newReactions));
  };

  // Liste des destinations uniques
  const destinations = useMemo(() => {
    return [...new Set((voyages || []).map(voyage => voyage.destination))];
  }, [voyages]);

  // Filtrage des voyages
  const filteredVoyages = useMemo(() => {
    return (voyages || []).filter(voyage => {
      const matchDestination = !destinationFilter || voyage.destination === destinationFilter;
      const matchDuration = !durationFilter || voyage.duration === durationFilter;
      const matchBudget = !budgetFilter || voyage.budget === budgetFilter;
      return matchDestination && matchDuration && matchBudget;
    });
  }, [destinationFilter, durationFilter, budgetFilter, voyages]);

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
    <div className="w-full pt-16">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Nos Voyages</h1>
          <p className="mt-4 text-xl text-gray-600">Découvrez nos circuits et séjours organisés</p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <select 
              className="px-4 py-2 border rounded-lg text-gray-700"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
            >
              <option value="">Toutes les destinations</option>
              {destinations.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
            <select 
              className="px-4 py-2 border rounded-lg text-gray-700"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="">Toutes les durées</option>
              <option value="2-3 jours">2-3 jours</option>
              <option value="4-7 jours">4-7 jours</option>
              <option value="8+ jours">8+ jours</option>
            </select>
            <select 
              className="px-4 py-2 border rounded-lg text-gray-700"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
            >
              <option value="">Tous les budgets</option>
              <option value="Économique">Économique</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voyages Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVoyages.map((voyage) => {
            // Obtenir l'état des réactions pour ce voyage
            const voyageReactions = reactions[voyage._id] || { liked: false, disliked: false };
            
            return (
              <div key={voyage._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
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
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm font-medium">
                      {voyage.destination}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {voyage.duration} jours
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{voyage.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{voyage.description}</p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-2xl font-bold text-sahara">
                      {voyage.price.toLocaleString()} MAD
                    </div>
                    <div className={`text-sm ${voyage.availableSpots < 5 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      {voyage.availableSpots === 0 ? (
                        'Complet'
                      ) : voyage.availableSpots < 5 ? (
                        `Plus que ${voyage.availableSpots} places !`
                      ) : (
                        `${voyage.availableSpots} places disponibles`
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-[100px]">
                      {/* Bouton Like */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(voyage._id, 'like');
                        }}
                        className={`flex items-center justify-center gap-1 p-1.5 rounded-lg transition-all duration-300 w-12 ${
                          voyageReactions.liked
                            ? 'text-orange-500 hover:text-orange-600' 
                            : 'text-gray-400 hover:text-orange-500'
                        }`}
                        aria-label={voyageReactions.liked ? "Je n'aime plus" : "J'aime"}
                      >
                        {voyageReactions.liked ? (
                          <FaThumbsUp className="h-5 w-5 transition-transform duration-300 transform scale-110" />
                        ) : (
                          <FaRegThumbsUp className="h-5 w-5 transition-transform duration-300" />
                        )}
                        <span className="font-medium text-sm w-3 text-center">
                          {voyageReactions.liked ? 1 : 0}
                        </span>
                      </button>

                      {/* Bouton Dislike */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(voyage._id, 'dislike');
                        }}
                        className={`flex items-center justify-center gap-1 p-1.5 rounded-lg transition-all duration-300 w-12 ${
                          voyageReactions.disliked
                            ? 'text-red-500 hover:text-red-600' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                        aria-label={voyageReactions.disliked ? "Retirer le dislike" : "Je n'aime pas"}
                      >
                        {voyageReactions.disliked ? (
                          <FaThumbsDown className="h-5 w-5 transition-transform duration-300 transform scale-110" />
                        ) : (
                          <FaRegThumbsDown className="h-5 w-5 transition-transform duration-300" />
                        )}
                        <span className="font-medium text-sm w-3 text-center">
                          {voyageReactions.disliked ? 1 : 0}
                        </span>
                      </button>
                    </div>

                    <button 
                      onClick={() => navigate(`/voyage/${voyage._id}`)}
                      className="px-6 py-2 bg-sahara text-white rounded-full font-medium hover:bg-sahara/90 transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sahara focus:ring-offset-2"
                    >
                      Plus de détails
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Voyages;
