import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Composant SVG personnalisé pour l'icône de commentaire
const CommentBubbleIcon = ({ className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    fill="none"
    strokeWidth="1.5"
    className={className}
    width="1.2em" 
    height="1.2em"
  >
    <path d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.516 5 6.934V22l5.34-4.005C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8z"/>
  </svg>
);

const VoyageReactionPanel = ({ voyageId, showCount = true, size = 'md', customCommentCount }) => {
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
        dislikeCount: data.dislikes,
        commentCount: data.commentCount || 0
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
        navigate('/login');
        return;
      }
      
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

  // Gérer le clic sur le bouton de commentaire
  const handleCommentClick = () => {
    // Vérifier si nous sommes déjà sur la page de détails du voyage
    if (location.pathname === `/voyage/${voyageId}`) {
      // Si nous sommes déjà sur la page de détails, faire défiler vers les commentaires
      // Utiliser le comportement natif du navigateur pour naviguer vers le fragment
      window.location.hash = 'comments';
    } else {
      // Sinon, naviguer vers la page de détails avec le fragment
      // En utilisant navigate avec un fragment, cela devrait déclencher notre useEffect dans VoyageDetail
      navigate(`/voyage/${voyageId}#comments`);
    }
  };

  // Mise à jour du compteur de commentaires quand customCommentCount change
  useEffect(() => {
    if (customCommentCount !== undefined) {
      setReaction(prev => ({
        ...prev,
        commentCount: customCommentCount
      }));
    }
  }, [customCommentCount]);

  // Effet pour récupérer les statistiques de réactions et les réactions de l'utilisateur
  useEffect(() => {
    // Utiliser un timeout pour éviter des requêtes trop fréquentes
    const timer = setTimeout(() => {
      // Ne récupérer les statistiques que si customCommentCount n'est pas fourni
      if (customCommentCount === undefined) {
        fetchStats();
      } else {
        // Si customCommentCount est fourni, récupérer quand même les likes/dislikes
        // mais en évitant d'écraser le compteur de commentaires personnalisé
        const fetchLikesOnly = async () => {
          try {
            if (fetchingRef.current) return;
            fetchingRef.current = true;
            
            const apiUrl = `http://localhost:5000/api/reactions/voyage/${voyageId}`;
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
              throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            setReaction(prev => ({
              ...prev,
              likeCount: data.likes,
              dislikeCount: data.dislikes,
              // Garder le commentCount personnalisé
            }));
          } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
          } finally {
            fetchingRef.current = false;
          }
        };
        
        fetchLikesOnly();
      }
      
      if (isAuthenticated) {
        fetchUserReaction();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [voyageId, isAuthenticated, customCommentCount]);

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
        onClick={handleCommentClick}
        disabled={reaction.loading}
        aria-label="Commenter"
      >
        <CommentBubbleIcon className="text-xl" />
        {showCount && <span className="font-medium">{reaction.commentCount}</span>}
      </button>
    </div>
  );
};

export default VoyageReactionPanel; 