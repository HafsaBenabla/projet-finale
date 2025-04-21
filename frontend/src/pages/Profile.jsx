import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaPhone, FaTrash, FaSpinner, FaTimes, FaPlus, FaPencilAlt, FaPlane, FaBuilding, FaHiking, FaCog, FaEye, FaEllipsisV, FaCalendarCheck, FaListUl, FaBell, FaExclamation, FaCheck, FaInfo } from 'react-icons/fa';
import './ProfileStyles.css';

const Profile = () => {
  const { user, token, isAuthenticated, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState({
    voyages: [],
    activites: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // État pour suivre les annulations en cours
  const [cancelingReservations, setCancelingReservations] = useState([]);
  // État pour les messages de confirmation
  const [notification, setNotification] = useState({ message: '', type: '' });
  // Référence pour la barre de progression
  const progressBarRef = useRef(null);
  // État pour le formulaire de téléphone
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const phoneInputRef = useRef(null);
  
  // État pour la modale de confirmation d'annulation
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    reservationId: null,
    type: null,
    title: ''
  });
  
  // État pour les modales de gestion admin
  const [showAdminModal, setShowAdminModal] = useState({
    voyage: false,
    agence: false,
    activite: false
  });

  // État pour stocker les données administratives
  const [adminData, setAdminData] = useState({
    voyages: [],
    agences: [],
    activites: []
  });
  
  // État pour le chargement des données administratives
  const [loadingAdminData, setLoadingAdminData] = useState(false);

  // État pour les paramètres admin
  const [adminSettings, setAdminSettings] = useState({
    logo: '/logo.png',
    siteName: 'MaghrebXplore',
    slogan: 'Découvrez les trésors cachés du Maroc',
    welcomeMessage: 'Bienvenue sur votre espace administrateur MaghrebXplore',
    todoList: [
      { id: 1, task: 'Ajouter des activités pour la ville de Chefchaouen', completed: false },
      { id: 2, task: 'Mettre à jour les photos de la page d\'accueil', completed: false },
      { id: 3, task: 'Confirmer les réservations en attente', completed: false },
      { id: 4, task: 'Ajouter un nouveau circuit dans le désert', completed: false }
    ],
    notifications: [] // Initialiser avec un tableau vide
  });

  // État pour les notifications réelles
  const [realNotifications, setRealNotifications] = useState({
    loading: false,
    error: null,
    data: []
  });

  // State pour les notifications rapides de l'admin
  const [adminNotifications, setAdminNotifications] = useState({
    reservationsToday: 0,
    fullTrips: 0,
    newUserMessages: 0
  });

  // État pour les commentaires de l'utilisateur
  const [userComments, setUserComments] = useState({
    loading: true,
    error: null,
    errorDetails: null,
    data: []
  });

  // Ajout d'un nouvel état pour contrôler l'affichage du formulaire d'ajout de tâche
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // Effet pour animer la barre de progression lorsqu'une notification est affichée
  useEffect(() => {
    if (notification.message && progressBarRef.current) {
      // Forcer un reflow pour que la transition s'applique
      progressBarRef.current.offsetWidth;
      // Ajouter la classe d'animation
      progressBarRef.current.classList.add('progress-bar-animate');
    }
  }, [notification]);

  // Effet pour focus sur l'input téléphone quand la modale s'ouvre
  useEffect(() => {
    if (showPhoneForm && phoneInputRef.current) {
      phoneInputRef.current.focus();
      // Pré-remplir avec le numéro existant s'il y en a un
      if (user?.phone) {
        setPhoneNumber(user.phone);
      }
    }
  }, [showPhoneForm, user?.phone]);

  // Fonction pour mettre à jour le numéro de téléphone
  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      return;
    }

    setUpdatingPhone(true);
    try {
      // Appel API pour mettre à jour le téléphone de l'utilisateur
      const response = await axios.patch(
        `http://localhost:5000/api/users/${user.userId}`,
        { phone: phoneNumber },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Mise à jour du contexte utilisateur avec les nouvelles données
      if (response.data && updateUserProfile) {
        updateUserProfile({ ...user, phone: phoneNumber });
      }

      // Fermer le formulaire et afficher une notification
      setShowPhoneForm(false);
      setNotification({
        message: 'Votre numéro de téléphone a été mis à jour avec succès.',
        type: 'success',
        details: '',
        timestamp: new Date().toLocaleTimeString()
      });

      // Effacer la notification après 5 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 5000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du téléphone:', err);
      setNotification({
        message: 'Échec de la mise à jour du numéro de téléphone',
        type: 'error',
        details: err.response?.data?.message || err.message,
        timestamp: new Date().toLocaleTimeString()
      });

      // Effacer la notification après 8 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 8000);
    } finally {
      setUpdatingPhone(false);
    }
  };

  // Fonction pour récupérer les commentaires de l'utilisateur - isolée pour être appelée indépendamment
  const fetchUserComments = async () => {
    if (!isAuthenticated || !user?.userId || !token) {
      console.log('Impossible de récupérer les commentaires: pas d\'authentification');
      return;
    }
    
    try {
      setUserComments(prev => ({ ...prev, loading: true, error: null }));
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Vérifier la structure de l'objet user et afficher plus d'informations de débogage
      console.log('Informations utilisateur avant la requête:', {
        userId: user.userId,
        id: user.id,
        _id: user._id, 
        tokenPresent: !!token,
        tokenLength: token ? token.length : 0
      });

      // Corriger l'URL pour correspondre à la structure réelle du backend
      // Route réelle est app.use('/api', commentRoutes); + router.get('/user/:userId/comments', ...)
      const commentsUrl = `http://localhost:5000/api/user/${user.userId}/comments`;
      console.log('Envoi de la requête pour les commentaires à:', commentsUrl);
      console.log('Headers de la requête:', config.headers);
      
      try {
        const response = await axios.get(commentsUrl, config);
        console.log('Commentaires récupérés avec succès:', response.data);
        
        setUserComments({
          loading: false,
          error: null,
          data: response.data
        });
      } catch (requestError) {
        console.error('Erreur spécifique de requête:', requestError);
        
        // Gestion plus détaillée des erreurs
        let errorMessage = 'Impossible de charger vos commentaires. Veuillez réessayer plus tard.';
        let errorDetails = '';
        
        if (requestError.response) {
          // Erreur avec réponse du serveur
          console.error('Détails de l\'erreur de réponse:', {
            status: requestError.response.status,
            statusText: requestError.response.statusText,
            data: requestError.response.data
          });
          errorMessage = requestError.response.data?.message || errorMessage;
          errorDetails = `Statut: ${requestError.response.status} ${requestError.response.statusText}`;
        } else if (requestError.request) {
          // Pas de réponse du serveur
          console.error('Aucune réponse du serveur');
          errorMessage = 'Le serveur ne répond pas. Veuillez vérifier votre connexion.';
          errorDetails = 'Problème de connectivité réseau';
        }
        
        setUserComments({
          loading: false,
          error: errorMessage,
          errorDetails: errorDetails,
          data: []
        });
      }
    } catch (error) {
      console.error('Erreur générale lors de la récupération des commentaires:', error);
      setUserComments({
        loading: false,
        error: 'Une erreur inattendue s\'est produite. Veuillez réessayer plus tard.',
        errorDetails: error.message || 'Erreur inconnue',
        data: []
      });
    }
  };

  // Ajouter fetchUserComments à la liste des dépendances de l'effet
  useEffect(() => {
    const checkAuth = () => {
      console.log('=== Vérification de l\'authentification dans Profile ===', {
        isAuthenticated,
        user: user,
        token: token ? 'Présent' : 'Absent',
        userId: user?.userId
      });
      
      if (!isAuthenticated || !user?.userId) {
        console.log('Redirection vers login - État:', { 
          isAuthenticated, 
          userId: user?.userId,
          user: user 
        });
        navigate('/login');
        return false;
      }
      return true;
    };

    const fetchReservations = async () => {
      if (!checkAuth()) return;

      try {
        setLoading(true);
        console.log('=== Tentative de récupération des réservations ===', {
          userId: user.userId,
          token,
          userDetails: user
        });

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Récupération des réservations de voyages
        const voyagesUrl = `http://localhost:5000/api/reservations/voyages/${user.userId}`;
        console.log('Envoi de la requête pour les voyages à:', voyagesUrl);
        console.log('Headers de la requête:', config.headers);
        
        const voyagesResponse = await axios.get(voyagesUrl, config);

        // Récupération des réservations d'activités
        const activitesUrl = `http://localhost:5000/api/reservations/activites/${user.userId}`;
        console.log('Envoi de la requête pour les activités à:', activitesUrl);
        
        const activitesResponse = await axios.get(activitesUrl, config);

        console.log('Réponse pour les voyages:', voyagesResponse.data);
        console.log('Réponse pour les activités:', activitesResponse.data);

        setReservations({
          voyages: voyagesResponse.data,
          activites: activitesResponse.data
        });

        // Récupérer les commentaires de l'utilisateur après avoir récupéré les réservations
        fetchUserComments();

      } catch (error) {
        console.error('Erreur lors de la récupération des réservations:', error);
        setError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated, user, token, navigate]);  // N'ajoutez pas fetchUserComments dans les dépendances pour éviter les boucles

  // Fonction pour annuler une réservation
  const handleCancelReservation = async (reservationId, type) => {
    if (!confirmModal.show) {
      // Si la modale n'est pas déjà affichée, on l'affiche d'abord
      return;
    }
    
    // On ferme la modale
    setConfirmModal({ show: false, reservationId: null, type: null, title: '' });

    // Ajouter l'ID à la liste des annulations en cours
    setCancelingReservations(prev => [...prev, reservationId]);

    try {
      console.log('Tentative d\'annulation de la réservation avec axios.patch:', reservationId);

      // Utiliser axios.patch avec la route "/:id/annuler" dont nous savons qu'elle est fonctionnelle
      const response = await axios.patch(
        `http://localhost:5000/api/reservations/${reservationId}/annuler`, 
        { 
          type: type === 'voyages' ? 'voyage' : 'activite' // Envoyer le type au singulier comme attendu par le backend
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Réservation annulée avec succès:', response.data);

      // Récupérer les détails de la réservation avant de la supprimer de l'état
      const reservation = reservations[type].find(r => r._id === reservationId);
      
      // Fallback au cas où la réservation n'existe pas dans l'état local
      const reservationTitle = reservation 
        ? (type === 'voyages' 
            ? reservation.voyage?.title || 'ce voyage' 
            : reservation.activite?.titre || 'cette activité')
        : 'cette réservation';

      // Mettre à jour la liste des réservations en la retirant localement
      setReservations(prev => ({
        ...prev,
        [type]: prev[type].filter(r => r._id !== reservationId)
      }));

      // Afficher un message de confirmation
      setNotification({ 
        message: `Votre réservation pour "${reservationTitle}" a été annulée avec succès.`, 
        type: 'success',
        details: 'La réservation a été supprimée et les places ont été libérées.',
        timestamp: new Date().toLocaleTimeString()
      });

      // Effacer le message après 5 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 5000);

    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err);
      
      let errorMessage = 'Échec de l\'annulation de la réservation';
      let errorDetails = '';
      
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de se connecter au serveur';
        errorDetails = 'Vérifiez que le serveur backend est en cours d\'exécution.';
      } else if (err.response) {
        errorMessage = `Erreur ${err.response.status}`;
        errorDetails = err.response.data?.message || 'Erreur lors du traitement de la demande.';
      } else {
        errorDetails = err.message;
      }
      
      // Afficher une notification d'erreur
      setNotification({ 
        message: errorMessage, 
        type: 'error',
        details: errorDetails,
        timestamp: new Date().toLocaleTimeString()
      });

      // Effacer le message après 8 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 8000);
    } finally {
      // Retirer l'ID de la liste des annulations en cours
      setCancelingReservations(prev => prev.filter(id => id !== reservationId));
    }
  };

  // Fonction pour ouvrir la modale de confirmation d'annulation
  const openCancelModal = (reservationId, type) => {
    // Récupérer le titre de la réservation
    const reservation = reservations[type].find(r => r._id === reservationId);
    const reservationTitle = reservation 
      ? (type === 'voyages' 
          ? reservation.voyage?.title || 'ce voyage' 
          : reservation.activite?.titre || 'cette activité')
      : 'cette réservation';
    
    // Ouvrir la modale avec les informations
    setConfirmModal({
      show: true,
      reservationId,
      type,
      title: reservationTitle
    });
  };

  // Fonction pour supprimer un commentaire
  const handleDeleteComment = async (commentId, voyageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      // Corriger l'URL pour correspondre à la route backend /api/comments/:commentId
      const url = `http://localhost:5000/api/comments/${commentId}`;
      const response = await axios.delete(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Réponse de suppression du commentaire:', response.data);
      
      // Mettre à jour l'état des commentaires
      setUserComments(prev => ({
        ...prev,
        data: prev.data.filter(comment => comment._id !== commentId)
      }));
      
      // Afficher une notification de succès
      setNotification({
        message: 'Votre commentaire a été supprimé avec succès.',
        type: 'success',
        details: '',
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Effacer la notification après 5 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      
      // Afficher une notification d'erreur
      setNotification({
        message: 'Échec de la suppression du commentaire',
        type: 'error',
        details: error.response?.data?.message || error.message,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Effacer la notification après 8 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 8000);
    }
  };

  // Fonction pour récupérer les données administratives
  const fetchAdminData = async (type) => {
    if (!isAuthenticated || !token) return;
    
    setLoadingAdminData(true);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      let url = '';
      switch(type) {
        case 'voyage':
          url = 'http://localhost:5000/api/voyages';
          break;
        case 'agence':
          url = 'http://localhost:5000/api/agences';
          break;
        case 'activite':
          url = 'http://localhost:5000/api/activites';
          break;
        default:
          throw new Error('Type de données non reconnu');
      }
      
      const response = await axios.get(url, config);
      
      setAdminData(prev => ({
        ...prev,
        [type + 's']: Array.isArray(response.data) ? response.data : []
      }));
      
    } catch (err) {
      console.error(`Erreur lors de la récupération des ${type}s:`, err);
      setNotification({
        message: `Impossible de récupérer les ${type}s`,
        type: 'error',
        details: err.response?.data?.message || err.message,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setLoadingAdminData(false);
    }
  };
  
  // Effet pour charger les données administratives lors de l'ouverture d'une modale
  useEffect(() => {
    if (showAdminModal.voyage) {
      fetchAdminData('voyage');
    }
    if (showAdminModal.agence) {
      fetchAdminData('agence');
    }
    if (showAdminModal.activite) {
      fetchAdminData('activite');
    }
  }, [showAdminModal, token]);

  // Fonction pour naviguer vers les pages de gestion
  const handleAdminAction = (type, action, id = null) => {
    setShowAdminModal({...showAdminModal, [type]: false});
    
    // Rediriger vers la page appropriée
    switch(action) {
      case 'ajouter':
        navigate(`/admin/${type}/ajouter`);
        break;
      case 'modifier':
        navigate(id ? `/admin/${type}/modifier/${id}` : `/admin/${type}/liste`);
        break;
      case 'supprimer':
        if (id) {
          // Confirmer avant de supprimer
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) {
            // Logique de suppression ici, puis rediriger
            navigate(`/admin/${type}/liste`);
          }
        } else {
          navigate(`/admin/${type}/liste?action=supprimer`);
        }
        break;
      case 'voir':
        navigate(`/admin/${type}/detail/${id}`);
        break;
      default:
        navigate(`/admin/${type}`);
    }
  };

  // Fonction pour mettre à jour les paramètres admin
  const updateAdminSetting = (field, value) => {
    setAdminSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour marquer une tâche comme terminée
  const toggleTodoCompletion = (todoId) => {
    setAdminSettings(prev => ({
      ...prev,
      todoList: prev.todoList.map(todo => 
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  };

  // Fonction pour ajouter une nouvelle tâche
  const addTodoItem = (task) => {
    const newId = Math.max(0, ...adminSettings.todoList.map(todo => todo.id)) + 1;
    setAdminSettings(prev => ({
      ...prev,
      todoList: [...prev.todoList, { id: newId, task, completed: false }]
    }));
  };

  // Effet pour récupérer les notifications admin
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      // Récupérer les vraies données depuis l'API
      const fetchAdminData = async () => {
        try {
          setRealNotifications(prev => ({ ...prev, loading: true, error: null }));
          
          // Configuration pour les appels API
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };
          
          // Récupérer les dernières réservations
          const reservationsUrl = `http://localhost:5000/api/reservations/recent`;
          const reservationsResponse = await axios.get(reservationsUrl, config).catch(() => ({ data: [] }));
          
          // Récupérer les derniers utilisateurs créés
          const usersUrl = `http://localhost:5000/api/users/recent`;
          const usersResponse = await axios.get(usersUrl, config).catch(() => ({ data: [] }));
          
          // Récupérer les réservations en attente
          const pendingUrl = `http://localhost:5000/api/reservations/pending`;
          const pendingResponse = await axios.get(pendingUrl, config).catch(() => ({ data: [] }));
          
          // Récupérer les derniers avis
          const reviewsUrl = `http://localhost:5000/api/reviews/recent`;
          const reviewsResponse = await axios.get(reviewsUrl, config).catch(() => ({ data: [] }));
          
          // Créer des notifications à partir des réponses
          const notifications = [];
          
          // Ajouter les notifications de réservations récentes
          if (reservationsResponse.data && reservationsResponse.data.length > 0) {
            reservationsResponse.data.forEach(reservation => {
              const reservationType = reservation.voyage ? 'voyage' : 'activité';
              const title = reservation.voyage?.title || reservation.activite?.name || 'non spécifié';
              notifications.push({
                id: `res-${reservation._id}`,
                message: `Nouvelle réservation pour ${reservationType}: ${title}`,
                date: formatDate(reservation.dateReservation || reservation.createdAt),
                type: 'success'
              });
            });
          }
          
          // Ajouter les notifications d'utilisateurs récents
          if (usersResponse.data && usersResponse.data.length > 0) {
            usersResponse.data.forEach(user => {
              notifications.push({
                id: `user-${user._id}`,
                message: `Nouveau compte créé: ${user.username || user.email}`,
                date: formatDate(user.createdAt),
                type: 'info'
              });
            });
          }
          
          // Ajouter les notifications de réservations en attente
          if (pendingResponse.data && pendingResponse.data.length > 0) {
            notifications.push({
              id: 'pending',
              message: `${pendingResponse.data.length} réservation(s) en attente de confirmation`,
              date: 'À traiter',
              type: 'warning'
            });
          }
          
          // Ajouter les notifications d'avis récents
          if (reviewsResponse.data && reviewsResponse.data.length > 0) {
            reviewsResponse.data.forEach(review => {
              notifications.push({
                id: `review-${review._id}`,
                message: `Nouvel avis ${review.rating} étoiles pour ${review.voyageTitle || review.activityName || 'un élément'}`,
                date: formatDate(review.createdAt),
                type: 'success'
              });
            });
          }
          
          // Si aucune notification n'a été récupérée, créer une notification d'information
          if (notifications.length === 0) {
            notifications.push({
              id: 'no-data',
              message: 'Aucune activité récente à signaler',
              date: 'Maintenant',
              type: 'info'
            });
          }
          
          // Trier par date (les plus récentes en premier)
          notifications.sort((a, b) => {
            if (a.date === 'Maintenant' || a.date === 'Aujourd\'hui') return -1;
            if (b.date === 'Maintenant' || b.date === 'Aujourd\'hui') return 1;
            if (a.date === 'Hier') return -1;
            if (b.date === 'Hier') return 1;
            return 0;
          });
          
          // Mettre à jour l'état des notifications
          setRealNotifications({
            loading: false,
            error: null,
            data: notifications
          });
          
          // Mettre à jour les paramètres admin avec les nouvelles notifications
          setAdminSettings(prev => ({
            ...prev,
            notifications: notifications
          }));
          
        } catch (error) {
          console.error("Erreur lors de la récupération des notifications:", error);
          setRealNotifications({
            loading: false,
            error: "Impossible de récupérer les notifications",
            data: []
          });
        }
      };
      
      fetchAdminData();
    }
  }, [isAuthenticated, user?.isAdmin, token]);

  // Fonction pour formater une date relative
  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    // Si plus de 7 jours, on affiche la date complète
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Chargement de votre profil...</p>
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 sm:pt-20 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-center text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 sm:pt-16 px-3 sm:px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* En-tête de la page - version responsive */}
        <div className="mb-4 sm:mb-6 py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-0">
              Profil {user?.username ? `de ${user.username}` : ''}
            </h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="text-white text-xs sm:text-sm bg-orange-600 bg-opacity-30 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
                {user?.isAdmin ? 'Administrateur' : 'Membre depuis ' + (user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'récemment')}
              </div>
            </div>
          </div>
        </div>

        {/* Notification - nouveau style moderne et amélioré */}
        {notification.message && (
          <div 
            className={`mb-4 sm:mb-6 rounded-lg overflow-hidden shadow-lg notification-enter notification-active transform transition-all duration-300 ease-in-out`}
          >
            <div className={`flex ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              {/* Icône de notification */}
              <div className="flex-shrink-0 p-4 flex items-center justify-center">
                <div className="rounded-full bg-white bg-opacity-30 p-2">
                  {notification.type === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Contenu de la notification */}
              <div className="flex-1 p-4 text-white">
                <h4 className="text-lg font-medium mb-1">
                  {notification.type === 'success' ? 'Opération réussie' : 'Erreur'}
                </h4>
                <p className="opacity-90 mb-1">{notification.message}</p>
                {notification.details && (
                  <p className="text-sm opacity-80">{notification.details}</p>
                )}
                <p className="text-xs opacity-70 mt-2">{notification.timestamp}</p>
              </div>
              
              {/* Bouton de fermeture */}
              <div className="p-4 flex-shrink-0">
                <button 
                  onClick={() => setNotification({ message: '', type: '', details: '', timestamp: '' })}
                  className="text-white opacity-70 hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="relative h-1 bg-black bg-opacity-10">
              <div 
                ref={progressBarRef}
                className={`progress-bar ${
                  notification.type === 'success' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
            </div>
          </div>
        )}

        {/* Section du profil utilisateur - version responsive */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            {/* Photo de profil - adaptée pour mobile */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-4 border-orange-200 shadow-md">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="w-10 h-10 sm:w-16 sm:h-16 text-orange-500" />
                )}
              </div>
            </div>

            {/* Informations de l'utilisateur - adaptées pour mobile */}
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{user?.username || 'Utilisateur'}</h2>
              
              <div className="p-3 sm:p-4 bg-orange-50 rounded-lg mb-3 sm:mb-4 shadow-sm">
                <h3 className="font-semibold text-orange-800 mb-2 sm:mb-3 border-b border-orange-200 pb-2">Informations de contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3 bg-white p-3 rounded-md shadow-sm">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <FaEnvelope className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <p className="text-sm sm:text-base text-gray-800 font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-white p-3 rounded-md shadow-sm">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <FaPhone className="text-orange-500" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500 font-medium">Téléphone</p>
                      <p className="text-sm sm:text-base text-gray-800 font-medium">{user?.phone || 'Non renseigné'}</p>
                      <p className="text-xs text-orange-500 cursor-pointer hover:underline" 
                         data-tooltip="Ajouter un numéro de téléphone"
                         onClick={() => setShowPhoneForm(true)}>
                        {user?.phone ? 'Modifier le numéro' : 'Ajouter un numéro'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section admin personnalisée - visible uniquement pour les administrateurs */}
        {user?.isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            {/* En-tête personnalisable avec logo et nom */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <div className="flex items-center mb-4 md:mb-0">
                <div 
                  className="h-12 w-12 bg-orange-100 rounded-lg mr-4 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => {
                    const newLogo = prompt('Entrez l\'URL de votre nouveau logo:', adminSettings?.logo || 'https://via.placeholder.com/150x50?text=LOGO');
                    if (newLogo) updateAdminSetting('logo', newLogo);
                  }}
                >
                  {adminSettings?.logo ? (
                    <img 
                      src={adminSettings.logo} 
                      alt="Logo" 
                      className="h-full w-full object-contain p-1" 
                      onError={(e) => {
                        console.error("Erreur de chargement du logo:", e);
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=LOGO';
                      }}
                    />
                  ) : (
                    <span className="text-orange-500 font-bold text-sm">LOGO</span>
                  )}
                </div>
                <div>
                  <h2 
                    className="text-2xl font-bold text-gray-800 cursor-pointer" 
                    onClick={() => {
                      const newName = prompt('Entrez le nouveau nom de la plateforme:', adminSettings?.siteName || 'VOYAGES MAROC');
                      if (newName) updateAdminSetting('siteName', newName);
                    }}
                  >
                    {adminSettings?.siteName || 'VOYAGES MAROC'}
                  </h2>
                  <p className="text-sm text-gray-500 italic">Cliquez pour modifier le logo ou le nom</p>
                </div>
              </div>
            </div>
            
            {/* Message d'accueil personnalisable */}
            <div 
              className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded mb-6 cursor-pointer" 
              onClick={() => {
                const newMessage = prompt('Entrez votre nouveau message d\'accueil:', adminSettings?.welcomeMessage || 'Bienvenue sur le tableau de bord administrateur');
                if (newMessage) updateAdminSetting('welcomeMessage', newMessage);
              }}
            >
              <p className="text-orange-700">{adminSettings?.welcomeMessage || 'Bienvenue sur votre espace administrateur Voyages Maroc'}</p>
              <p className="text-sm text-orange-500 mt-1 italic">Cliquez pour modifier ce message</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bloc Notifications */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaBell className="mr-2 text-orange-500" />
                    Notifications
                  </h3>
                  {realNotifications.loading && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Chargement...
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {realNotifications.error ? (
                    <div className="py-4 text-center text-red-500">
                      <p>{realNotifications.error}</p>
                      <p className="text-sm mt-2">Les notifications ne peuvent pas être chargées pour le moment.</p>
                    </div>
                  ) : adminSettings?.notifications && adminSettings.notifications.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {adminSettings.notifications.map((notif, index) => (
                        <li key={index} className="py-3">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 p-1 rounded-full ${
                              notif.type === 'success' ? 'bg-green-100' : 
                              notif.type === 'warning' ? 'bg-yellow-100' : 
                              notif.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                            }`}>
                              {notif.type === 'success' ? <FaCheck className="text-green-500" /> : 
                               notif.type === 'warning' ? <FaExclamation className="text-yellow-500" /> :
                               notif.type === 'error' ? <FaTimes className="text-red-500" /> :
                               <FaInfo className="text-blue-500" />}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                              <p className="text-xs text-gray-500">{notif.date}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : realNotifications.loading ? (
                    <div className="py-6 text-center text-gray-500">
                      <div className="flex justify-center mb-3">
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p>Chargement des notifications...</p>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-gray-500">
                      <p>Aucune notification récente</p>
                      <p className="text-sm mt-2">Les activités importantes apparaîtront ici</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bloc "À faire" (Admin todo) */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaListUl className="mr-2 text-orange-500" />
                    À faire
                  </h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    {adminSettings?.todoList && adminSettings.todoList.length > 0 ? (
                      adminSettings.todoList.map(todo => (
                        <li key={todo.id} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={todo.completed} 
                            onChange={() => toggleTodoCompletion(todo.id)}
                            className="form-checkbox h-5 w-5 text-orange-500 rounded"
                          />
                          <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {todo.task}
                          </span>
                          <button 
                            className="text-red-400 hover:text-red-600"
                            onClick={() => setAdminSettings(prev => ({
                              ...prev,
                              todoList: prev.todoList.filter(item => item.id !== todo.id)
                            }))}
                          >
                            <FaTimes />
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="py-6 text-center text-gray-500">
                        Aucune tâche en attente
                      </li>
                    )}
                  </ul>
                  
                  {/* Nouvelle section pour ajouter une tâche */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    {/* État pour afficher/masquer le formulaire d'ajout de tâche */}
                    {showNewTaskForm ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const task = e.target.elements.newTask.value.trim();
                        if (task) {
                          addTodoItem(task);
                          e.target.reset();
                          setShowNewTaskForm(false);
                        }
                      }} className="space-y-2">
                        <input 
                          type="text" 
                          name="newTask"
                          placeholder="Ajouter une nouvelle tâche..." 
                          className="w-full border-gray-300 rounded focus:ring-orange-500 focus:border-orange-500"
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                          <button 
                            type="button"
                            onClick={() => setShowNewTaskForm(false)}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                          >
                            Annuler
                          </button>
                          <button 
                            type="submit"
                            className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
                          >
                            Ajouter
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setShowNewTaskForm(true)}
                          className="flex items-center justify-center w-full py-2 bg-gray-50 hover:bg-gray-100 text-orange-500 rounded-lg transition-colors"
                        >
                          <FaPlus className="mr-2" />
                          Ajouter une tâche
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section des réservations - adaptée pour mobile */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6 border-b border-gray-200 pb-2">Mes Réservations</h3>
          
          {/* Voyages réservés - le reste du code est adapté grâce aux media queries CSS */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-orange-600 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Voyages
            </h4>
            {reservations.voyages.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {reservations.voyages.map((reservation) => (
                  <div key={reservation._id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white relative reservation-card">
                    {reservation.voyage?.image && (
                      <div className="w-full h-32 sm:h-40 mb-3 sm:mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={reservation.voyage.image} 
                          alt={reservation.voyage.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h5 className="font-semibold text-base sm:text-lg text-orange-600 mb-2">
                      {reservation.voyage?.title || 'Voyage sans titre'}
                    </h5>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="flex items-center text-sm sm:text-base text-gray-600">
                        <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{reservation.voyage?.destination || 'Destination non spécifiée'}</span>
                      </p>
                      <p className="flex items-center text-sm sm:text-base text-gray-600">
                        <FaCalendarAlt className="mr-2 flex-shrink-0" />
                        {new Date(reservation.dateReservation).toLocaleDateString()}
                      </p>
                      <div className={`mt-2 inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium
                        ${reservation.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                          reservation.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                        data-tooltip={
                          reservation.statut === 'confirmé' ? 'Réservation confirmée' :
                          reservation.statut === 'en_attente' ? 'En attente de confirmation' :
                          'Réservation annulée'
                        }
                      >
                        {reservation.statut}
                      </div>
                      
                      {/* Bouton d'annulation */}
                      {reservation.statut !== 'annulé' && (
                        <button
                          onClick={() => openCancelModal(reservation._id, 'voyages')}
                          disabled={cancelingReservations.includes(reservation._id)}
                          className="mt-3 flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm disabled:opacity-50 cancel-button w-full"
                        >
                          {cancelingReservations.includes(reservation._id) ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Annulation...
                            </>
                          ) : (
                            <>
                              <FaTrash className="mr-2" />
                              Annuler la réservation
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4 bg-gray-50 rounded-lg">
                Vous n'avez pas encore réservé de voyage.
              </p>
            )}
          </div>

          {/* Activités réservées */}
          <div>
            <h4 className="text-lg font-medium text-orange-600 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Activités
            </h4>
            {reservations.activites.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {reservations.activites.map((reservation) => (
                  <div key={reservation._id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white relative reservation-card overflow-hidden">
                    {reservation.activite?.image && (
                      <div className="w-full h-28 sm:h-32 mb-3 sm:mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={reservation.activite.image} 
                          alt={reservation.activite.titre} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h5 className="font-semibold text-base sm:text-lg text-orange-600 mb-2">
                      {reservation.activite?.titre || 'Activité sans titre'}
                    </h5>
                    <div className="space-y-1 sm:space-y-2">
                      <p className="flex items-center text-sm sm:text-base text-gray-600">
                        <FaMapMarkerAlt className="mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{reservation.activite?.lieu || 'Lieu non spécifié'}</span>
                      </p>
                      <p className="flex items-center text-sm sm:text-base text-gray-600">
                        <FaCalendarAlt className="mr-2 flex-shrink-0" />
                        {new Date(reservation.dateReservation).toLocaleDateString()}
                      </p>
                      <div className={`mt-2 inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium
                        ${reservation.statut === 'confirmé' ? 'bg-green-100 text-green-800' :
                          reservation.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                        data-tooltip={
                          reservation.statut === 'confirmé' ? 'Réservation confirmée' :
                          reservation.statut === 'en_attente' ? 'En attente de confirmation' :
                          'Réservation annulée'
                        }
                      >
                        {reservation.statut}
                      </div>
                      
                      {/* Bouton d'annulation */}
                      {reservation.statut !== 'annulé' && (
                        <button
                          onClick={() => openCancelModal(reservation._id, 'activites')}
                          disabled={cancelingReservations.includes(reservation._id)}
                          className="mt-3 flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm disabled:opacity-50 cancel-button w-full"
                        >
                          {cancelingReservations.includes(reservation._id) ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Annulation...
                            </>
                          ) : (
                            <>
                              <FaTrash className="mr-2" />
                              Annuler la réservation
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4 bg-gray-50 rounded-lg">
                Vous n'avez pas encore réservé d'activité.
              </p>
            )}
          </div>
        </div>

        {/* Section des Commentaires Utilisateur */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-gray-200 pb-2">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Mes Commentaires</h3>
            <button 
              onClick={fetchUserComments}
              className="text-sm px-3 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition-colors flex items-center"
              disabled={userComments.loading}
            >
              {userComments.loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {userComments.loading ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>
          
          {/* Commentaires utilisateur */}
          <div className="mt-4">
            {userComments.loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
            
            {userComments.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                <p className="font-medium">Une erreur s'est produite lors du chargement de vos commentaires:</p>
                <p className="mt-1">{userComments.error}</p>
                {userComments.errorDetails && (
                  <p className="text-xs mt-1 text-red-600">{userComments.errorDetails}</p>
                )}
              </div>
            )}
            
            {!userComments.loading && !userComments.error && userComments.data.length > 0 ? (
              <div className="space-y-4">
                {userComments.data.map(comment => (
                  <div key={comment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium text-gray-800">{comment.voyage?.title || 'Voyage supprimé'}</h5>
                      <small className="text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</small>
                    </div>
                    {comment.voyage && <p className="text-sm text-gray-600 mt-1">Destination: {comment.voyage.destination}</p>}
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                    <div className="flex justify-end mt-3">
                      <button 
                        className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteComment(comment._id, comment.voyageId)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !userComments.loading && !userComments.error && (
                <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded" role="alert">
                  Vous n'avez laissé aucun commentaire pour le moment.
                </div>
              )
            )}
          </div>
        </div>

        {/* Modale pour ajouter/modifier le numéro de téléphone - adaptée pour mobile */}
        {showPhoneForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 phone-modal-backdrop p-3 sm:p-0">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md mx-0 sm:mx-4 phone-modal-content">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {user?.phone ? 'Modifier votre numéro' : 'Ajouter un numéro de téléphone'}
                </h3>
                <button 
                  onClick={() => setShowPhoneForm(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePhone}>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      ref={phoneInputRef}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                      placeholder="Exemple: +33 6 12 34 56 78"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format international recommandé (ex: +33 6 12 34 56 78)</p>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => setShowPhoneForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updatingPhone || !phoneNumber.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none disabled:opacity-50"
                  >
                    {updatingPhone ? (
                      <>
                        <FaSpinner className="animate-spin inline-block mr-2" />
                        Enregistrement...
                      </>
                    ) : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modale de confirmation d'annulation */}
        {confirmModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 notification-enter notification-active p-3 sm:p-0">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
              {/* En-tête avec dégradé */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="p-2 bg-white bg-opacity-30 rounded-full mr-4">
                    <FaTrash className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-white">
                    Confirmer l'annulation
                  </h3>
                </div>
              </div>
              
              {/* Contenu de la modale */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir annuler votre réservation pour :
                </p>
                <p className="text-orange-600 font-semibold text-lg mb-4 border-l-4 border-orange-400 pl-3 py-1">
                  {confirmModal.title}
                </p>
                <p className="text-gray-600 text-sm mb-5">
                  Cette action est irréversible et libérera votre place pour d'autres utilisateurs.
                </p>
                
                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row sm:justify-end mt-5 gap-3">
                  <button
                    onClick={() => setConfirmModal({ show: false, reservationId: null, type: null, title: '' })}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleCancelReservation(confirmModal.reservationId, confirmModal.type)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex justify-center items-center"
                  >
                    <FaTrash className="mr-2" />
                    Confirmer l'annulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 