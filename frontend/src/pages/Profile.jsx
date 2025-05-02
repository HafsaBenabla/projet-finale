import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaPhone, FaTrash, FaSpinner, FaTimes, FaPlus, FaPencilAlt, FaPlane, FaBuilding, FaHiking, FaCog, FaEye, FaEllipsisV, FaCalendarCheck, FaListUl, FaBell, FaExclamation, FaCheck, FaInfo, FaUserCircle, FaPaperPlane, FaSave, FaClipboardList, FaComment } from 'react-icons/fa';
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
    activites: [],
    todos: []
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
    loading: false,
    error: null,
    errorDetails: '',
    data: []
  });

  // Ajout d'un nouvel état pour contrôler l'affichage du formulaire d'ajout de tâche
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // État pour le mode édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    firstName: '',
    email: '',
    phone: ''
  });

  // État pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // État pour la modale de confirmation de suppression de commentaire
  const [deleteCommentModal, setDeleteCommentModal] = useState({
    show: false,
    commentId: null,
    commentContent: ''
  });

  // Mettre à jour les données éditées quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      setEditedData({
        firstName: user.firstName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/users/${user.userId}`,
        editedData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && updateUserProfile) {
        updateUserProfile({ ...user, ...editedData });
        setIsEditing(false);
        
        setNotification({
          message: 'Vos informations ont été mises à jour avec succès',
          type: 'success',
          details: '',
          timestamp: new Date().toLocaleTimeString()
        });

        // Effacer la notification après 5 secondes
        setTimeout(() => {
          setNotification({ message: '', type: '', details: '', timestamp: '' });
        }, 5000);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setNotification({
        message: 'Échec de la mise à jour',
        type: 'error',
        details: err.response?.data?.message || err.message,
        timestamp: new Date().toLocaleTimeString()
      });

      // Effacer la notification d'erreur après 5 secondes
      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 5000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour changer le mot de passe
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({
        message: 'Les mots de passe ne correspondent pas',
        type: 'error',
        details: 'Veuillez vérifier que les deux mots de passe sont identiques',
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    try {
      setNotification({
        message: 'Mise à jour du mot de passe...',
        type: 'info',
        details: '',
        timestamp: new Date().toLocaleTimeString()
      });

      const response = await axios.post(
        `http://localhost:5000/api/users/${user.userId}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setNotification({
        message: 'Mot de passe mis à jour avec succès',
        type: 'success',
        details: '',
        timestamp: new Date().toLocaleTimeString()
      });

      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 5000);
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setNotification({
        message: 'Échec de la mise à jour du mot de passe',
        type: 'error',
        details: err.response?.data?.message || err.message,
        timestamp: new Date().toLocaleTimeString()
      });

      setTimeout(() => {
        setNotification({ message: '', type: '', details: '', timestamp: '' });
      }, 8000);
    }
  };

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
        { 
          phone: phoneNumber,
          // Inclure l'identifiant utilisateur pour s'assurer que le backend reconnaît l'opération de mise à jour
          userId: user.userId 
        },
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

  // Fonction pour récupérer tous les commentaires (pour l'admin)
  const fetchAllComments = async () => {
    if (!isAuthenticated || !user?.isAdmin || !token) {
      console.log('Impossible de récupérer les commentaires: accès non autorisé');
      return;
    }
    
    try {
      setUserComments(prev => ({ ...prev, loading: true, error: null }));
      
      // Configuration pour les appels API
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        console.log('=== Tentative de récupération des commentaires ===', {
          userId: user.userId,
          token,
          userDetails: user
        });

        const commentsUrl = `http://localhost:5000/api/comments`;
        console.log('Envoi de la requête pour tous les commentaires à:', commentsUrl);
        
        const response = await axios.get(commentsUrl, config);

        console.log('Réponse pour les commentaires:', response.data);

        setUserComments({
          loading: false,
          error: null,
          data: response.data,
          isGroupedByVoyage: true
        });

      } catch (requestError) {
        console.error('Erreur spécifique de requête:', requestError);
        
        let errorMessage = 'Impossible de charger les commentaires. Veuillez réessayer plus tard.';
        let errorDetails = '';
        
        if (requestError.response) {
          // Erreur avec réponse du serveur
          console.error('Détails de l\'erreur de réponse:', {
            status: requestError.response.status,
            statusText: requestError.response.statusText,
            data: requestError.response.data
          });
          
          // Messages d'erreur plus spécifiques basés sur le code HTTP
          switch(requestError.response.status) {
            case 401:
              errorMessage = 'Authentification expirée ou invalide';
              errorDetails = 'Veuillez vous reconnecter pour continuer.';
              break;
            case 403:
              errorMessage = 'Accès non autorisé';
              errorDetails = 'Vous n\'avez pas les permissions nécessaires pour accéder à ces données.';
              break;
            case 404:
              errorMessage = 'Ressource introuvable';
              errorDetails = 'L\'API des commentaires n\'est pas disponible à cette adresse.';
              break;
            case 500:
              errorMessage = 'Erreur serveur';
              errorDetails = 'Le serveur a rencontré une erreur interne. Notre équipe a été notifiée.';
              break;
            default:
              errorMessage = requestError.response.data?.message || errorMessage;
              errorDetails = `Statut: ${requestError.response.status} ${requestError.response.statusText}`;
          }
        } else if (requestError.request) {
          // Pas de réponse du serveur
          console.error('Aucune réponse du serveur, détails:', requestError.request);
          errorMessage = 'Le serveur ne répond pas';
          errorDetails = 'Vérifiez que le serveur backend est en cours d\'exécution à l\'adresse: http://localhost:5000';
        } else {
          errorDetails = requestError.message;
        }
        
        // Afficher une notification d'erreur
        setNotification({
          message: errorMessage,
          type: 'error',
          details: errorDetails,
          timestamp: new Date().toLocaleTimeString()
        });
        
        setUserComments({
          loading: false,
          error: errorMessage,
          errorDetails: errorDetails,
          data: []
        });
      }
    } catch (error) {
      console.error('Erreur générale lors de la récupération des commentaires:', error);
      
      // Notification d'erreur pour l'utilisateur
      setNotification({
        message: 'Erreur lors du chargement des commentaires',
        type: 'error',
        details: error.message || 'Une erreur inattendue s\'est produite',
        timestamp: new Date().toLocaleTimeString()
      });
      
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

    const initializeProfile = async () => {
      if (!checkAuth()) return;
      
      try {
        // Charger les réservations
        await fetchReservations();
        
        // Charger les commentaires si l'utilisateur n'est pas admin
        if (!user?.isAdmin) {
          await fetchUserComments();
        }
        
        // Charger tous les commentaires si l'utilisateur est admin
        if (user?.isAdmin) {
          await fetchAllComments();
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du profil:', error);
      }
    };

    initializeProfile();
  }, [isAuthenticated, user, token]);

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
  const handleDeleteComment = async (commentId) => {
    try {
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
      
      // Fermer la modale
      setDeleteCommentModal({ show: false, commentId: null, commentContent: '' });
      
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

  // Fonction pour ouvrir la modale de confirmation de suppression
  const openDeleteCommentModal = (commentId, content) => {
    setDeleteCommentModal({
      show: true,
      commentId,
      commentContent: content
    });
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

  // Fonction pour récupérer les commentaires de l'utilisateur
  const fetchUserComments = async () => {
    if (!isAuthenticated || !user?.userId || !token) {
      console.log('Impossible de récupérer les commentaires: non authentifié');
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

      console.log('=== Tentative de récupération des commentaires utilisateur ===', {
        userId: user.userId,
        token: token ? 'Présent' : 'Absent'
      });

      const commentsUrl = `http://localhost:5000/api/comments/user/${user.userId}/comments`;
      console.log('Envoi de la requête pour les commentaires à:', commentsUrl);
      
      const response = await axios.get(commentsUrl, config);
      console.log('Réponse pour les commentaires:', response.data);

      // Mise à jour de l'état avec la nouvelle structure
        setUserComments({
          loading: false,
          error: null,
        data: response.data.data || [],
        message: response.data.message || null
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      
      let errorMessage = 'Une erreur est survenue lors du chargement des commentaires';
      let errorDetails = '';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            break;
          case 403:
            errorMessage = 'Accès non autorisé aux commentaires.';
            break;
          case 404:
            errorMessage = 'Aucun commentaire trouvé.';
            break;
          default:
            errorMessage = data.message || errorMessage;
        }
        errorDetails = data.details || '';
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur';
        errorDetails = 'Vérifiez votre connexion internet';
      } else {
        errorDetails = error.message;
      }
      
        setUserComments({
          loading: false,
        error: errorMessage,
        errorDetails: errorDetails,
        data: []
      });
    }
  };

  // Fonction pour récupérer les réservations
  const fetchReservations = async () => {
    if (!isAuthenticated || !user?.userId || !token) {
      console.log('Impossible de récupérer les réservations: non authentifié');
      return;
    }

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

    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      setError('Erreur lors de la récupération des données. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
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
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={editedData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sahara"
                      placeholder="Prénom"
                    />
                  ) : (
                    user?.firstName || 'Utilisateur'
                  )}
                </h2>
                <button 
                  onClick={() => {
                    if (isEditing) {
                      handleSaveChanges();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 flex items-center"
                >
                  {isEditing ? (
                    <>
                      <FaSave className="mr-1" />
                      <span className="hidden sm:inline">Enregistrer</span>
                    </>
                  ) : (
                    <>
                      <FaPencilAlt className="mr-1" />
                      <span className="hidden sm:inline">Modifier</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="p-3 sm:p-4 bg-orange-50 rounded-lg mb-3 sm:mb-4 shadow-sm">
                <h3 className="font-semibold text-orange-800 mb-2 sm:mb-3 border-b border-orange-200 pb-2 flex justify-between items-center">
                  <span>Informations de contact</span>
                  <button 
                    onClick={() => {
                      const newUsername = prompt('Entrez votre nouveau prénom:', user?.firstName || user?.username);
                      if (newUsername && newUsername.trim()) {
                        // Vérifier que le prénom a changé
                        if (newUsername.trim() === user?.firstName) {
                          setNotification({
                            message: 'Le prénom est identique à l\'actuel',
                            type: 'error',
                            details: 'Veuillez choisir un prénom différent',
                            timestamp: new Date().toLocaleTimeString()
                          });
                          setTimeout(() => {
                            setNotification({ message: '', type: '', details: '', timestamp: '' });
                          }, 5000);
                          return;
                        }
                        
                        if (newUsername.trim().length < 2) {
                          setNotification({
                            message: 'Prénom trop court',
                            type: 'error',
                            details: 'Le prénom doit contenir au moins 2 caractères',
                            timestamp: new Date().toLocaleTimeString()
                          });
                          setTimeout(() => {
                            setNotification({ message: '', type: '', details: '', timestamp: '' });
                          }, 5000);
                          return;
                        }
                        
                        // Afficher un indicateur de chargement
                        setNotification({
                          message: 'Mise à jour du prénom en cours...',
                          type: 'info',
                          details: '',
                          timestamp: new Date().toLocaleTimeString()
                        });
                        
                        // Préparer les données à envoyer au serveur
                        const updateData = { 
                          firstName: newUsername.trim()
                        };
                        console.log('Données envoyées pour la mise à jour:', updateData);
                        
                        // Appel API pour mettre à jour le prénom
                        axios.patch(
                          `http://localhost:5000/api/users/${user.userId}`,
                          updateData,
                          {
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            }
                          }
                        )
                        .then(response => {
                          console.log('Réponse du serveur:', response.data);
                          // Mise à jour du contexte utilisateur avec les nouvelles données
                          if (response.data && updateUserProfile) {
                            updateUserProfile({ ...user, firstName: newUsername.trim() });
                          }
                          // Notification de succès
                          setNotification({
                            message: 'Prénom mis à jour avec succès',
                            type: 'success',
                            details: '',
                            timestamp: new Date().toLocaleTimeString()
                          });
                          
                          setTimeout(() => {
                            setNotification({ message: '', type: '', details: '', timestamp: '' });
                          }, 5000);
                        })
                        .catch(err => {
                          console.error('Erreur lors de la mise à jour du prénom:', err);
                          const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue';
                          setNotification({
                            message: 'Échec de la mise à jour du prénom',
                            type: 'error',
                            details: errorMessage,
                            timestamp: new Date().toLocaleTimeString()
                          });
                          
                          setTimeout(() => {
                            setNotification({ message: '', type: '', details: '', timestamp: '' });
                          }, 8000);
                        });
                      }
                    }}
                    className="text-xs text-orange-500 cursor-pointer hover:underline hidden group-hover:block absolute right-3 top-3"
                  >
                    <FaPencilAlt className="inline mr-1" /> Modifier
                  </button>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3 bg-white p-3 rounded-md shadow-sm relative group">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <FaEnvelope className="text-orange-500" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editedData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sahara"
                          placeholder="Email"
                        />
                      ) : (
                        <p className="text-sm sm:text-base text-gray-800 font-medium">{user?.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white p-3 rounded-md shadow-sm relative group">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <FaPhone className="text-orange-500" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500 font-medium">Téléphone</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editedData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sahara"
                          placeholder="Téléphone"
                        />
                      ) : (
                        <p className="text-sm sm:text-base text-gray-800 font-medium">
                          {user?.phone || 'Non renseigné'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option pour changer le mot de passe */}
              <div className="text-center md:text-left">
                <button 
                  onClick={() => setShowPasswordForm(true)}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Changer mon mot de passe
                </button>
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
                  className="h-12 w-12 bg-orange-100 rounded-lg mr-4 flex items-center justify-center overflow-hidden border-4 border-orange-200 shadow-md"
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
            
            {/* Bloc "À faire" unique, en pleine largeur (sans les notifications) */}
            <div>
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

        {/* Section des réservations - adaptée pour mobile, ne s'affiche que pour les utilisateurs non-admin */}
        {!user?.isAdmin && (
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
                  {reservations.voyages.map((reservation) => {
                    // Vérifier si la date du voyage est passée
                    // Utiliser la date de départ du voyage plutôt que la date de réservation
                    const today = new Date();
                    // Si le voyage a une propriété dateDepart, on l'utilise, sinon on utilise la date de réservation
                    const departureDate = reservation.dateDepart ? new Date(reservation.dateDepart) : 
                                          (reservation.voyage?.dateDepart ? new Date(reservation.voyage.dateDepart) : null);
                    const isVoyagePassed = departureDate && departureDate < today;
                    
                    return (
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
                        
                        {/* Section pour ajouter un retour d'expérience - uniquement pour les voyages passés */}
                        {isVoyagePassed && reservation.statut !== 'annulé' && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center mb-2">
                              <FaUserCircle className="text-orange-500 mr-2" />
                              <h6 className="font-medium text-gray-700">Partagez votre expérience</h6>
                            </div>
                            
                            {/* Formulaire pour ajouter un commentaire */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const content = e.target.elements.experience.value.trim();
                                if (content) {
                                  // Créer un nouveau commentaire
                                  const commentData = {
                                    content: content,
                                    voyageId: reservation.voyage?._id,
                                    userId: user.userId
                                  };
                                  
                                  // Appeler l'API pour ajouter le commentaire
                                  axios.post(
                                    `http://localhost:5000/api/voyages/${reservation.voyage?._id}/comments`,
                                    commentData,
                                    {
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      }
                                    }
                                  )
                                  .then(response => {
                                    console.log("Commentaire ajouté avec succès:", response.data);
                                    // Réinitialiser le formulaire
                                    e.target.reset();
                                    // Afficher une notification
                                    setNotification({
                                      message: 'Merci pour votre retour d\'expérience !',
                                      type: 'success',
                                      details: 'Votre commentaire a été publié avec succès.',
                                      timestamp: new Date().toLocaleTimeString()
                                    });
                                    
                                    // Rafraîchir les commentaires de l'utilisateur
                                    fetchAllComments();
                                    
                                    // Effacer la notification après 5 secondes
                                    setTimeout(() => {
                                      setNotification({ message: '', type: '', details: '', timestamp: '' });
                                    }, 5000);
                                  })
                                  .catch(error => {
                                    console.error("Erreur lors de l'ajout du commentaire:", error);
                                    // Afficher une notification d'erreur
                                    setNotification({
                                      message: 'Erreur lors de l\'ajout du commentaire',
                                      type: 'error',
                                      details: error.response?.data?.message || error.message,
                                      timestamp: new Date().toLocaleTimeString()
                                    });
                                    
                                    // Effacer la notification après 8 secondes
                                    setTimeout(() => {
                                      setNotification({ message: '', type: '', details: '', timestamp: '' });
                                    }, 8000);
                                  });
                                }
                              }}
                              className="space-y-2"
                            >
                              <textarea
                                name="experience"
                                placeholder="Racontez votre voyage et partagez vos impressions..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                rows="3"
                                required
                              ></textarea>
                              <button
                                type="submit"
                                className="w-full bg-orange-500 text-white py-2 rounded-md font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <FaPaperPlane />
                                Partager mon expérience
                              </button>
                            </form>
                          </div>
                        )}
                        
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
                  );})}
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
        )}

        {/* Section des Commentaires pour administrateur - regroupés par voyage */}
        {user?.isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-gray-200 pb-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Commentaires des clients par voyage</h3>
              <button 
                onClick={fetchAllComments}
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

            {/* Affichage des erreurs */}
            {userComments.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-red-800 font-medium">Une erreur s'est produite lors du chargement des commentaires:</h4>
                </div>
                <p className="mt-2 text-red-700">{userComments.error}</p>
                <p className="mt-2 text-red-600 text-sm">L'API des commentaires n'est pas disponible à cette adresse.</p>
              </div>
            )}

            {/* Affichage des commentaires par voyage */}
            {!userComments.loading && !userComments.error && userComments.data.length > 0 ? (
              <div className="space-y-8">
                {userComments.data.map(voyageData => (
                  <div key={voyageData.voyage._id} className="border rounded-lg overflow-hidden">
                    {/* En-tête du voyage */}
                    <div className="bg-gray-50 border-b">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center p-4">
                        {voyageData.voyage.image && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 mb-2 sm:mb-0 flex-shrink-0">
                            <img 
                              src={voyageData.voyage.image} 
                              alt={voyageData.voyage.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <h4 className="text-lg font-medium text-gray-800">{voyageData.voyage.title}</h4>
                          <p className="text-sm text-gray-600">{voyageData.voyage.destination}</p>
                          <div className="mt-1 flex items-center">
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                              {voyageData.comments.length} commentaire{voyageData.comments.length > 1 ? 's' : ''}
                            </span>
                            <button 
                              onClick={() => navigate(`/voyage/${voyageData.voyage._id}`)}
                              className="ml-3 text-xs text-blue-600 hover:underline flex items-center"
                            >
                              <FaEye className="mr-1" /> Voir le voyage
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Liste des commentaires pour ce voyage */}
                    <div className="divide-y divide-gray-200">
                      {voyageData.comments.map(comment => (
                        <div key={comment._id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="bg-orange-100 p-2 rounded-full mr-3">
                                <FaUserCircle className="text-orange-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {comment.userName || 'Utilisateur anonyme'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => openDeleteCommentModal(comment._id, comment.content)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Supprimer ce commentaire"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          <p className="text-gray-700 pl-11">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : !userComments.loading && !userComments.error ? (
              <div className="text-center py-8 text-gray-500">
                <FaComment className="mx-auto text-4xl mb-4 opacity-20" />
                <p>Aucun commentaire n'a encore été publié.</p>
              </div>
            ) : null}
          </div>
        )}

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

        {/* Modale pour changer le mot de passe */}
        {showPasswordForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Changer mon mot de passe</h3>
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sahara"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sahara"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sahara"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sahara"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sahara rounded-md"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Section des Commentaires de l'utilisateur */}
        {!user?.isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Mes Commentaires</h3>
              <button 
                onClick={() => fetchUserComments()}
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

            {/* Affichage des erreurs */}
            {userComments.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-red-800 font-medium">Une erreur s'est produite lors du chargement de vos commentaires</h4>
                </div>
                <p className="mt-2 text-red-700">{userComments.error}</p>
              </div>
            )}

            {/* Liste des commentaires */}
            {!userComments.loading && !userComments.error ? (
              userComments.data && userComments.data.length > 0 ? (
                <div className="space-y-4">
                  {userComments.data.map(comment => (
                    <div key={comment._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="bg-orange-100 p-2 rounded-full mr-3">
                            <FaUserCircle className="text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {comment.voyage?.title || 'Voyage non disponible'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openDeleteCommentModal(comment._id, comment.content)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Supprimer ce commentaire"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <p className="text-gray-700 mt-2">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaComment className="mx-auto text-4xl mb-4 opacity-20" />
                  <p>{userComments.message || "Vous n'avez pas encore publié de commentaires."}</p>
                  <p className="text-sm mt-2 text-gray-400">Partagez votre expérience après avoir participé à un voyage !</p>
                </div>
              )
            ) : null}
          </div>
        )}

        {/* Modale de confirmation de suppression de commentaire */}
        {deleteCommentModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-25 rounded-full p-2 mr-3">
                    <FaTrash className="text-white h-5 w-5" />
                  </div>
                  <h3 className="text-white text-lg font-medium">Confirmer la suppression</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 italic">"{deleteCommentModal.commentContent}"</p>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteCommentModal({ show: false, commentId: null, commentContent: '' })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDeleteComment(deleteCommentModal.commentId)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    Supprimer
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