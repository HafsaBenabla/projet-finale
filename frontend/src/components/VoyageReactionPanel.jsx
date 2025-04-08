import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThumbsUp, FaRegThumbsUp, FaThumbsDown, FaRegThumbsDown, FaComment, FaRegComment } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const VoyageReactionPanel = ({ voyageId, showCount = true, size = 'md' }) => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reaction, setReaction] = useState({
    liked: false,
    disliked: false,
    commented: false,
    likeCount: 0,
    dislikeCount: 0,
    commentCount: 0,
    loading: true
  });

  // Récupérer les réactions pour ce voyage
  useEffect(() => {
    // Si aucun ID de voyage n'est fourni, ne rien faire
    if (!voyageId) {
      setReaction(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchReaction = async () => {
      try {
        setReaction(prev => ({ ...prev, loading: true }));
        
        // Préparer les headers de la requête
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // Ajouter le token s'il existe
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Ajouter l'ID utilisateur s'il existe
        if (user?.userId || user?._id || user?.id) {
          headers['user-id'] = user.userId || user._id || user.id;
        }
        
        // Faire la requête pour récupérer les réactions
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/reaction`, {
          headers
        });
        
        if (response.ok) {
          const data = await response.json();
          setReaction({
            liked: data.reaction === 'like',
            disliked: data.reaction === 'dislike',
            commented: data.commented,
            likeCount: data.likes || 0,
            dislikeCount: data.dislikes || 0,
            commentCount: data.comments || 0,
            loading: false
          });
        } else {
          // En cas d'erreur, juste afficher les compteurs à 0
          setReaction(prev => ({ 
            ...prev, 
            loading: false,
            liked: false,
            disliked: false,
            commented: false
          }));
        }
      } catch (error) {
        // En cas d'erreur, ne pas bloquer l'affichage
        setReaction(prev => ({ 
          ...prev, 
          loading: false,
          liked: false,
          disliked: false,
          commented: false
        }));
      }
    };

    fetchReaction();
  }, [voyageId, token, user]);

  // Gérer le clic sur le bouton like ou dislike
  const handleReaction = async (type) => {
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated || !user) {
      // Rediriger vers la page de connexion avec le retour vers cette page
      const currentPath = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      // Récupérer l'ID utilisateur
      const userId = user.userId || user._id || user.id;
      
      if (!userId) {
        alert('Veuillez vous reconnecter pour interagir avec les voyages.');
        navigate('/login');
        return;
      }
      
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
      }
      
      // Inclure l'ID utilisateur dans les headers
      headers['user-id'] = userId;

      // Envoyer la réaction au serveur
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/reaction`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, userId })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mettre à jour l'état avec les données réelles du serveur
        setReaction({
          liked: data.reaction === 'like',
          disliked: data.reaction === 'dislike',
          commented: data.commented,
          likeCount: data.likes || 0,
          dislikeCount: data.dislikes || 0,
          commentCount: data.comments || 0,
          loading: false
        });
      } else if (response.status === 401 || response.status === 403) {
        // Si erreur d'authentification, rediriger vers la page de connexion
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        navigate('/login');
      } else {
        // Pour les autres erreurs, rafraîchir les données
        fetchReactionData();
      }
    } catch (error) {
      // En cas d'erreur, rafraîchir les données
      fetchReactionData();
    }
  };

  const fetchReactionData = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (user?.userId || user?._id || user?.id) {
        headers['user-id'] = user.userId || user._id || user.id;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/${voyageId}/reaction`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        
        setReaction({
          liked: data.reaction === 'like',
          disliked: data.reaction === 'dislike',
          commented: data.commented,
          likeCount: data.likes || 0,
          dislikeCount: data.dislikes || 0,
          commentCount: data.comments || 0,
          loading: false
        });
      } else {
        // En cas d'erreur, ne pas bloquer l'affichage
        setReaction(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      // En cas d'erreur, ne pas bloquer l'affichage
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

      {/* Bouton Commentaire */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/voyage/${voyageId}#comments`);
        }}
        className={`flex items-center justify-center gap-1 rounded-lg transition-all duration-300 ${sizeClasses.button} ${
          reaction.commented
            ? 'text-blue-500 hover:text-blue-600' 
            : 'text-gray-400 hover:text-blue-500'
        }`}
        aria-label="Voir les commentaires"
        disabled={reaction.loading}
      >
        {reaction.commented ? (
          <FaComment className={`${sizeClasses.icon} transition-transform duration-300 transform scale-110`} />
        ) : (
          <FaRegComment className={`${sizeClasses.icon} transition-transform duration-300`} />
        )}
        {showCount && (
          <span className={`font-medium w-3 text-center ${sizeClasses.text}`}>
            {reaction.commentCount || 0}
          </span>
        )}
      </button>
    </div>
  );
};

export default VoyageReactionPanel; 