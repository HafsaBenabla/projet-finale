<<<<<<< HEAD
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
=======
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaComment } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const VoyageReactionPanel = ({ voyageId, showCount = true, size = 'md' }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reaction, setReaction] = useState({
    loading: false,
    liked: false,
    disliked: false,
    likeCount: 0,
    dislikeCount: 0,
    commented: false,
    commentCount: 0
  });
  
  // Utiliser une ref pour éviter les requêtes multiples
  const fetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);

  // Récupérer les statistiques de réactions
  const fetchStats = async () => {
    // Limite le taux de requêtes
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 5000) { // 5 secondes min entre les requêtes
      return;
    }
    
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      lastFetchTimeRef.current = now;
      
      const apiUrl = `http://localhost:5000/api/reactions/voyage/${voyageId}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setReaction(prev => ({
        ...prev,
        likeCount: data.likes,
        dislikeCount: data.dislikes
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      fetchingRef.current = false;
    }
  };

  // Récupérer la réaction de l'utilisateur
  const fetchUserReaction = async () => {
    if (!isAuthenticated || !user) return;
    
    // Ne pas récupérer si une requête est déjà en cours
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      
      const token = localStorage.getItem('token');
      const apiUrl = `http://localhost:5000/api/reactions/user/${voyageId}`;
      
      console.log('Récupération de la réaction de l\'utilisateur:', {
        userId: user.id || user.userId || user._id,
        voyageId
      });
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Réaction utilisateur récupérée:', data);
      
      setReaction(prev => ({
        ...prev,
        liked: data?.type === 'like',
        disliked: data?.type === 'dislike'
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de la réaction utilisateur:', error);
    } finally {
      fetchingRef.current = false;
    }
  };

  // Fonction pour rafraîchir la session de l'utilisateur
  const refreshSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // Tenter de vérifier le token avec le backend pour obtenir de nouvelles données
      const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!verifyResponse.ok) {
        return false; // Si la vérification échoue, on considère que la session est invalide
      }
      
      // Le token est toujours valide
      return true;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error);
      return false;
    }
  };

  // Gérer une réaction (like/dislike)
  const handleReaction = async (type) => {
    // Vérifier si l'utilisateur est authentifié et que les données utilisateur sont disponibles
    if (!isAuthenticated || !user) {
      console.log('Non authentifié:', { isAuthenticated, user });
      // Afficher une alerte améliorée et rediriger
      const confirmation = window.confirm(
        'Vous devez être connecté pour réagir à ce voyage. Souhaitez-vous vous connecter maintenant?'
      );
      if (confirmation) {
        // Sauvegarder l'URL actuelle pour revenir après la connexion
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
      }
      return;
    }

    // Récupérer le token - mais ne pas bloquer si c'est introuvable
    const token = localStorage.getItem('token');
    console.log('Token récupéré:', token ? 'Présent' : 'Absent');
    
    if (!token) {
      console.log('Token manquant dans le localStorage - tentative de réaction quand même');
    }
    
    // SIMPLIFICATION: Éviter les vérifications excessives du token qui peuvent échouer
    // Nous allons laisser le serveur décider si le token est valide ou non

    // Éviter les requêtes si déjà en cours
    if (reaction.loading || fetchingRef.current) {
      return;
    }

    setReaction(prev => ({ ...prev, loading: true }));

    try {
      // Définir l'URL et préparer les données
      const apiUrl = `http://localhost:5000/api/reactions-direct`;
      
      // Inclure l'userId dans la requête pour s'assurer que le serveur l'obtient
      // même en cas de problème avec le token
      const userId = user.userId || user.id || user._id;
      const requestData = { voyageId, type, userId };
      
      console.log('Envoi de la requête de réaction:', {
        url: apiUrl,
        method: 'POST',
        userId,
        type
      });
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Ajouter le token s'il existe
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData)
      });

      console.log('Réponse reçue, status:', response.status);
      
      // SIMPLIFICATION: ne pas tenter de rafraîchir la session,
      // cela semble causer une boucle
      if (response.status === 401) {
        console.log('Session expirée, redirection vers la connexion');
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
        navigate('/login');
        return;
      }
      
<<<<<<< HEAD
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
=======
      // Lire la réponse en tant que texte d'abord pour déboguer
      const responseText = await response.text();
      
      // Vérifier si la requête est un succès
      if (!response.ok) {
        console.error('Erreur de réponse:', responseText);
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      // Essayer de parser la réponse JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Réponse de la réaction:', data);
        
        // Traiter la réponse réussie
        handleSuccessfulReaction(type, data);
      } catch (err) {
        console.error('Erreur de parsing JSON:', err);
        console.log('Texte reçu:', responseText);
        // Continuer même si le parsing échoue, avec une mise à jour approximative
        handleApproximateReaction(type);
      }

      // Recharger les statistiques après un délai plus long
      setTimeout(() => {
        fetchStats();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la réaction:', error);
      // Utiliser une notification moins intrusive
      console.log('Erreur lors de la réaction, mais continue sans alerte');
      // Mise à jour approximative pour donner un feedback visuel malgré l'erreur
      handleApproximateReaction(type);
    } finally {
      setReaction(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Fonction pour traiter une réaction réussie avec des données
  const handleSuccessfulReaction = (type, data) => {
    if (data && data.voyage && data.voyage.reactions) {
      // Si on a les données de réaction dans la réponse, utiliser ces valeurs
      setReaction(prev => ({
        ...prev,
        liked: type === 'like',
        disliked: type === 'dislike',
        likeCount: data.voyage.reactions.likes,
        dislikeCount: data.voyage.reactions.dislikes
      }));
    } else {
      // Sinon faire une mise à jour approximative
      handleApproximateReaction(type);
    }
  };
  
  // Fonction pour mettre à jour l'UI de manière approximative sans données précises
  const handleApproximateReaction = (type) => {
    setReaction(prev => {
      // Si c'est déjà like/dislike, on annule, sinon on active
      const isLiked = type === 'like' ? !prev.liked : false;
      const isDisliked = type === 'dislike' ? !prev.disliked : false;
      
      // Calcul des nouveaux compteurs
      let newLikeCount = prev.likeCount;
      let newDislikeCount = prev.dislikeCount;
      
      // Si on active un like
      if (isLiked && !prev.liked) {
        newLikeCount++;
        // Si on avait un dislike, on le supprime
        if (prev.disliked) {
          newDislikeCount--;
        }
      }
      
      // Si on désactive un like
      if (!isLiked && prev.liked) {
        newLikeCount--;
      }
      
      // Si on active un dislike
      if (isDisliked && !prev.disliked) {
        newDislikeCount++;
        // Si on avait un like, on le supprime
        if (prev.liked) {
          newLikeCount--;
        }
      }
      
      // Si on désactive un dislike
      if (!isDisliked && prev.disliked) {
        newDislikeCount--;
      }
      
      return {
        ...prev,
        liked: isLiked,
        disliked: isDisliked,
        likeCount: newLikeCount,
        dislikeCount: newDislikeCount
      };
    });
  };

  useEffect(() => {
    // Utiliser un timeout pour éviter des requêtes trop fréquentes
    const timer = setTimeout(() => {
      fetchStats();
      if (isAuthenticated) {
        fetchUserReaction();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [voyageId, isAuthenticated]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex items-center space-x-6">
      <button
        onClick={() => handleReaction('like')}
        className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-200 ${
          reaction.liked 
            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
            : 'text-orange-400 hover:bg-orange-50'
        }`}
        disabled={reaction.loading}
        aria-label={reaction.liked ? "Je n'aime plus" : "J'aime"}
      >
        <FaThumbsUp className="text-xl" />
        {showCount && <span className="font-medium">{reaction.likeCount}</span>}
      </button>

      <button
        onClick={() => handleReaction('dislike')}
        className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-200 ${
          reaction.disliked 
            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
            : 'text-red-400 hover:bg-red-50'
        }`}
        disabled={reaction.loading}
        aria-label={reaction.disliked ? "Retirer le dislike" : "Je n'aime pas"}
      >
        <FaThumbsDown className="text-xl" />
        {showCount && <span className="font-medium">{reaction.dislikeCount}</span>}
      </button>

      <button
        className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-200 ${
          reaction.commented 
            ? 'bg-white text-black hover:bg-gray-100' 
            : 'text-black hover:bg-gray-50'
        }`}
        disabled={reaction.loading}
        aria-label="Commenter"
      >
        <FaComment className="text-xl" />
        {showCount && <span className="font-medium">{reaction.commentCount}</span>}
>>>>>>> 7aec9ec (Stockage des réactions dans la base de données)
      </button>
    </div>
  );
};

export default VoyageReactionPanel; 