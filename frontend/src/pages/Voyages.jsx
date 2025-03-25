import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoyages } from '../context/VoyagesContext';

const Voyages = () => {
  const navigate = useNavigate();
  const { voyages, loading, error } = useVoyages();
  
  // État pour les filtres
  const [destinationFilter, setDestinationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  // État pour gérer les likes et dislikes avec leurs compteurs
  const [reactions, setReactions] = useState({});

  // Générer ou récupérer un ID utilisateur unique
  useEffect(() => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
  }, []);

  // Charger les réactions depuis le serveur
  useEffect(() => {
    const loadReactions = async () => {
      if (!voyages) return;

      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const initialReactions = {};
      
      for (const voyage of voyages) {
        try {
          const response = await fetch(`http://localhost:5000/api/voyages/${voyage._id}/reactions`, {
            headers: {
              'user-id': userId
            }
          });
          
          if (!response.ok) {
            throw new Error('Erreur lors du chargement des réactions');
          }
          
          const data = await response.json();
          
          initialReactions[voyage._id] = {
            likes: data.reactions.likes || 0,
            dislikes: data.reactions.dislikes || 0,
            userReaction: data.reactions.userReaction
          };
        } catch (error) {
          console.error(`Erreur lors du chargement des réactions pour le voyage ${voyage._id}:`, error);
          initialReactions[voyage._id] = reactions[voyage._id] || {
            likes: 0,
            dislikes: 0,
            userReaction: null
          };
        }
      }

      setReactions(initialReactions);
    };

    loadReactions();
  }, [voyages]);

  const handleReaction = async (id, type) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('Utilisateur non identifié');
      return;
    }

    try {
      // Optimistic update
      const currentReaction = reactions[id] || { likes: 0, dislikes: 0, userReaction: null };
      const action = currentReaction.userReaction === type ? 'remove' : 'add';
      
      // Mettre à jour l'interface utilisateur immédiatement
      const optimisticUpdate = {
        likes: currentReaction.likes,
        dislikes: currentReaction.dislikes,
        userReaction: action === 'add' ? type : null
      };

      if (action === 'add') {
        // Si l'utilisateur avait déjà une réaction différente
        if (currentReaction.userReaction && currentReaction.userReaction !== type) {
          optimisticUpdate[`${currentReaction.userReaction}s`]--;
        }
        optimisticUpdate[`${type}s`]++;
      } else if (action === 'remove') {
        optimisticUpdate[`${type}s`]--;
      }

      setReactions(prev => ({
        ...prev,
        [id]: optimisticUpdate
      }));

      // Envoyer la requête au serveur
      const response = await fetch(`http://localhost:5000/api/voyages/${id}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify({ type, action })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des réactions');
      }

      const data = await response.json();
      
      // Mettre à jour avec les données du serveur
      setReactions(prev => ({
        ...prev,
        [id]: data.reactions
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des réactions:', error);
      // En cas d'erreur, recharger les réactions pour ce voyage spécifique
      try {
        const response = await fetch(`http://localhost:5000/api/voyages/${id}/reactions`, {
          headers: {
            'user-id': userId
          }
        });
    
        if (response.ok) {
          const data = await response.json();
          setReactions(prev => ({
            ...prev,
            [id]: data.reactions
          }));
        }
      } catch (retryError) {
        console.error('Erreur lors de la récupération des réactions:', retryError);
      }
    }
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
          {filteredVoyages.map((voyage) => (
            <div key={voyage._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="relative h-48 overflow-hidden group">
                <img 
                  src={voyage.image} 
                  alt={voyage.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm font-medium">
                    {voyage.destination}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {voyage.duration}
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
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleReaction(voyage._id, 'like')}
                      className={`flex items-center gap-2 transition-colors ${
                        reactions[voyage._id]?.userReaction === 'like'
                          ? 'text-orange-500' 
                          : 'text-gray-500 hover:text-orange-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="font-medium">{reactions[voyage._id]?.likes || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleReaction(voyage._id, 'dislike')}
                      className={`flex items-center gap-2 transition-colors ${
                        reactions[voyage._id]?.userReaction === 'dislike'
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      <span className="font-medium">{reactions[voyage._id]?.dislikes || 0}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Voyages;
