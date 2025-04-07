import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const VoyageReactionPanel = ({ voyageId, showCount = true, size = 'md' }) => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reaction, setReaction] = useState({
    liked: false,
    disliked: false,
    likeCount: 0,
    dislikeCount: 0,
    loading: true
  });

  // Récupérer les réactions pour ce voyage
  useEffect(() => {
    const fetchReaction = async () => {
      try {
        setReaction(prev => ({ ...prev, loading: true }));
        
        const headers = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else if (user?.id || user?.userId) {
          headers['user-id'] = user.id || user.userId;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/voyages/${voyageId}/reaction`, {
          headers
        });
        
        if (response.ok) {
          try {
            const data = await response.json();
            console.log('Données de réaction reçues:', data);
            
            setReaction({
              liked: data.reaction === 'like',
              disliked: data.reaction === 'dislike',
              likeCount: data.likes,
              dislikeCount: data.dislikes,
              loading: false
            });
          } catch (jsonError) {
            console.error('Erreur lors du parsing JSON de la réponse:', jsonError);
            setReaction(prev => ({ ...prev, loading: false }));
          }
        } else {
          console.error('Erreur lors de la récupération de la réaction:', response.status, response.statusText);
          try {
            const errorData = await response.text();
            console.error('Détails de l\'erreur:', errorData);
          } catch (textError) {
            console.error('Impossible de lire le contenu de l\'erreur');
          }
          setReaction(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération de la réaction pour le voyage ${voyageId}:`, error);
        setReaction(prev => ({ ...prev, loading: false }));
      }
    };

    if (voyageId) {
      fetchReaction();
    }
  }, [voyageId, token, user]);

  // Gérer le clic sur le bouton like ou dislike
  const handleReaction = async (type) => {
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec le retour vers cette page
      const currentPath = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      // Optimistic UI update
      setReaction(prev => {
        const newReaction = { ...prev };
        
        if (type === 'like') {
          // Si on clique sur like, on désactive dislike automatiquement
          if (newReaction.disliked) {
            newReaction.disliked = false;
            newReaction.dislikeCount = Math.max(0, newReaction.dislikeCount - 1);
          }
          
          // Toggle like
          if (newReaction.liked) {
            newReaction.liked = false;
            newReaction.likeCount = Math.max(0, newReaction.likeCount - 1);
          } else {
            newReaction.liked = true;
            newReaction.likeCount += 1;
          }
        } else if (type === 'dislike') {
          // Si on clique sur dislike, on désactive like automatiquement
          if (newReaction.liked) {
            newReaction.liked = false;
            newReaction.likeCount = Math.max(0, newReaction.likeCount - 1);
          }
          
          // Toggle dislike
          if (newReaction.disliked) {
            newReaction.disliked = false;
            newReaction.dislikeCount = Math.max(0, newReaction.dislikeCount - 1);
          } else {
            newReaction.disliked = true;
            newReaction.dislikeCount += 1;
          }
        }
        
        return newReaction;
      });

      // Préparer les en-têtes avec l'authentification
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (user?.id || user?.userId) {
        headers['user-id'] = user.id || user.userId;
      }

      // Envoyer la réaction au serveur
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/voyages/${voyageId}/reaction`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        try {
          const data = await response.json();
          
          // Mettre à jour l'état avec les données réelles du serveur
          setReaction({
            liked: data.reaction === 'like',
            disliked: data.reaction === 'dislike',
            likeCount: data.likes,
            dislikeCount: data.dislikes,
            loading: false
          });
        } catch (jsonError) {
          console.error('Erreur lors du parsing JSON de la réponse:', jsonError);
          // En cas d'erreur de parsing, on rafraîchit les données
          refreshReactionData();
        }
      } else {
        console.error('Erreur lors de l\'envoi de la réaction:', response.status, response.statusText);
        try {
          const errorText = await response.text();
          console.error('Détails de l\'erreur:', errorText);
        } catch (textError) {
          console.error('Impossible de lire le contenu de l\'erreur');
        }
        // En cas d'erreur, on rafraîchit les données
        refreshReactionData();
      }
    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
      refreshReactionData();
    }
  };

  const refreshReactionData = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (user?.id || user?.userId) {
        headers['user-id'] = user.id || user.userId;
      }
      
      const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/voyages/${voyageId}/reaction`, {
        headers
      });
      
      if (refreshResponse.ok) {
        try {
          const refreshData = await refreshResponse.json();
          setReaction({
            liked: refreshData.reaction === 'like',
            disliked: refreshData.reaction === 'dislike',
            likeCount: refreshData.likes,
            dislikeCount: refreshData.dislikes,
            loading: false
          });
        } catch (jsonError) {
          console.error('Erreur lors du parsing JSON pendant le rafraîchissement:', jsonError);
          setReaction(prev => ({ ...prev, loading: false }));
        }
      } else {
        console.error('Erreur lors du rafraîchissement des réactions:', refreshResponse.status, refreshResponse.statusText);
        setReaction(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des réactions:', error);
      setReaction(prev => ({ ...prev, loading: false }));
    }
  };

  // Définir les tailles des icônes et des conteneurs en fonction de la prop size
  const sizeClasses = {
    sm: {
      button: "p-1 w-9",
      icon: "h-3.5 w-3.5",
      text: "text-xs"
    },
    md: {
      button: "p-1.5 w-12",
      icon: "h-5 w-5",
      text: "text-sm"
    },
    lg: {
      button: "p-2 w-16",
      icon: "h-6 w-6",
      text: "text-base"
    }
  }[size];

  return (
    <div className="flex items-center gap-3">
      {/* Bouton Like */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReaction('like');
        }}
        className={`flex items-center justify-center gap-1 rounded-lg transition-all duration-300 ${sizeClasses.button} ${
          reaction.liked
            ? 'text-orange-500 hover:text-orange-600' 
            : 'text-gray-400 hover:text-orange-500'
        }`}
        aria-label={reaction.liked ? "Je n'aime plus" : "J'aime"}
        disabled={reaction.loading}
      >
        {reaction.liked ? (
          <FaThumbsUp className={`${sizeClasses.icon} transition-transform duration-300 transform scale-110`} />
        ) : (
          <FaRegThumbsUp className={`${sizeClasses.icon} transition-transform duration-300`} />
        )}
        {showCount && (
          <span className={`font-medium w-3 text-center ${sizeClasses.text}`}>
            {reaction.likeCount || 0}
          </span>
        )}
      </button>
      
      {/* Bouton Dislike */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleReaction('dislike');
        }}
        className={`flex items-center justify-center gap-1 rounded-lg transition-all duration-300 ${sizeClasses.button} ${
          reaction.disliked
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-400 hover:text-red-500'
        }`}
        aria-label={reaction.disliked ? "Retirer le dislike" : "Je n'aime pas"}
        disabled={reaction.loading}
      >
        {reaction.disliked ? (
          <FaThumbsDown className={`${sizeClasses.icon} transition-transform duration-300 transform scale-110`} />
        ) : (
          <FaRegThumbsDown className={`${sizeClasses.icon} transition-transform duration-300`} />
        )}
        {showCount && (
          <span className={`font-medium w-3 text-center ${sizeClasses.text}`}>
            {reaction.dislikeCount || 0}
          </span>
        )}
      </button>
    </div>
  );
};

export default VoyageReactionPanel; 