import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { FaCog, FaPlane, FaBuilding, FaMap, FaListAlt, FaCalendarCheck, FaCalendarAlt, FaPlus } from 'react-icons/fa';

const AddNew = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeForm, setActiveForm] = useState(null);
  const [error, setError] = useState(null);
  const [agencies, setAgencies] = useState([]);
  
  // États pour le formulaire d'activité
  const [activityData, setActivityData] = useState({
    name: '',
    description: '',
    price: '',
    city: '',
    image: '',
    type: 'locale', // 'locale' ou 'voyage'
    duration: '',
    maxParticipants: '',
    isWeekendOnly: false,
    voyageId: '', // Pour les activités de type voyage
    category: ''
  });

  const [voyages, setVoyages] = useState([]);

  // États pour le formulaire de voyage
  const [voyageData, setVoyageData] = useState({
    title: '',
    description: '',
    price: '',
    destination: '',
    duration: '',
    image: '',
    agence: '',
    availableSpots: '',
    departureDate: '',
    returnDate: '',
    included: [],
    notIncluded: [],
    hebergement: '',
    hebergementImage: ''
  });

  // États pour le formulaire d'agence
  const [agencyData, setAgencyData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    stars: '0',
    image: ''
  });

  // États pour les réservations
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState(null);

  // États pour la suppression
  const [deleteActivityId, setDeleteActivityId] = useState('');
  const [deleteVoyageId, setDeleteVoyageId] = useState('');
  const [deleteAgencyId, setDeleteAgencyId] = useState('');

  // Liste des villes disponibles
  const availableCities = [
    "Agadir",
    "Al Hoceima",
    "Asilah",
    "Azrou",
    "Béni Mellal",
    "Casablanca",
    "Chefchaouen",
    "Dakhla",
    "El Jadida",
    "Errachidia",
    "Essaouira",
    "Fès",
    "Ifrane",
    "Kénitra",
    "Larache",
    "Marrakech",
    "Meknès",
    "Merzouga",
    "Mohammedia",
    "Nador",
    "Ouarzazate",
    "Oujda",
    "Rabat",
    "Safi",
    "Salé",
    "Tanger",
    "Taroudant",
    "Tétouan",
    "Zagora"
  ].sort();

  // Styles personnalisés
  const cardStyle = {
    transition: 'all 0.3s ease',
    border: 'none',
    borderRadius: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    background: '#ffffff',
    height: '100%'
  };

  const activeCardStyle = {
    ...cardStyle,
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    border: '2px solid #FF8C38',
    backgroundColor: '#fff8f3'
  };

  const cardIconStyle = {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#FF8C38'
  };

  const buttonStyle = {
    backgroundColor: '#FF8C38',
    border: 'none',
    padding: '0.8rem 2rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  };

  // États pour la gestion des fichiers
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [resetDisabled, setResetDisabled] = useState(true);

  // Activer le bouton de réinitialisation après avoir choisi des fichiers
  useEffect(() => {
    if (selectedFiles.length > 0) {
      setResetDisabled(false);
    } else {
      setResetDisabled(true);
    }
  }, [selectedFiles]);

  // Vérifier les autorisations d'administrateur au chargement
  useEffect(() => {
    // Le contrôle d'accès est maintenant géré par le composant AdminRoute
    // Charger les données nécessaires au dashboard
    fetchAgencies();
    fetchVoyages();
    fetchReservations();
  }, []);

  // Fonction pour récupérer la liste des agences
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/agencies');
        setAgencies(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des agences:', error);
      }
    };
    fetchAgencies();
  }, []);

  // Charger la liste des voyages pour le sélecteur
  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/voyages');
        if (response.ok) {
          const data = await response.json();
          setVoyages(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des voyages:', error);
      }
    };
    fetchVoyages();
  }, []);

  // Fonction pour récupérer toutes les réservations (admin)
  const fetchReservations = async () => {
    setLoadingReservations(true);
    setReservationsError(null);
    try {
      // Récupérer le token d'authentification du stockage local
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté en tant qu\'administrateur');
      }

      const response = await fetch('http://localhost:5000/api/reservations/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      let data;
      // Essayer de récupérer le texte brut de la réponse d'abord
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);
      
      try {
        // Ensuite, essayer de parser ce texte en JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        // Vérifier si la réponse contient du HTML (indiquant une erreur serveur)
        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
          throw new Error(`Le serveur a renvoyé une page HTML au lieu de JSON. Problème possible sur le serveur. Code: ${response.status}`);
        } else {
          throw new Error(`La réponse n'est pas un JSON valide: ${responseText.substring(0, 100)}...`);
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur serveur: ${response.status}`);
      }

      setReservations(data);
      console.log('Réservations récupérées:', data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setReservationsError(error.message);
    } finally {
      setLoadingReservations(false);
    }
  };

  // Fonction pour annuler une réservation (admin)
  const handleCancelReservation = async (reservationId) => {
    try {
      // Confirmation avant annulation
      if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        return;
      }

      // Récupérer le token d'authentification du stockage local
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté en tant qu\'administrateur');
      }

      const response = await fetch(`http://localhost:5000/api/reservations/admin/${reservationId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      let data;
      // Essayer de récupérer le texte brut de la réponse d'abord
      const responseText = await response.text();
      console.log('Réponse brute du serveur (annulation):', responseText);
      
      try {
        // Ensuite, essayer de parser ce texte en JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur de parsing JSON lors de l\'annulation:', parseError);
        // Vérifier si la réponse contient du HTML (indiquant une erreur serveur)
        if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html>')) {
          throw new Error(`Le serveur a renvoyé une page HTML au lieu de JSON. Problème possible sur le serveur. Code: ${response.status}`);
        } else {
          throw new Error(`La réponse n'est pas un JSON valide: ${responseText.substring(0, 100)}...`);
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `Erreur serveur: ${response.status}`);
      }

      alert(data.message || 'Réservation annulée avec succès');
      
      // Rafraîchir la liste des réservations
      fetchReservations();
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  // Gestionnaires de changement pour chaque formulaire
  const handleActivityChange = (e) => {
    setActivityData({ ...activityData, [e.target.name]: e.target.value });
  };

  const handleVoyageChange = (e) => {
    setVoyageData({ ...voyageData, [e.target.name]: e.target.value });
  };

  const handleAgencyChange = (e) => {
    setAgencyData({ ...agencyData, [e.target.name]: e.target.value });
  };

  const handleActivityImageUpload = (imageUrl) => {
    setActivityData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleVoyageImageUpload = (imageUrl) => {
    setVoyageData({
      ...voyageData,
      image: imageUrl
    });
  };

  const handleHebergementImageUpload = (imageUrl) => {
    console.log('Image d\'hébergement uploadée:', {
      imageUrl,
      isString: typeof imageUrl === 'string',
      length: imageUrl?.length,
      startsWithHttp: imageUrl?.startsWith('http')
    });
    
    setVoyageData({
      ...voyageData,
      hebergementImage: imageUrl
    });
    
    console.log('État de voyageData après mise à jour de l\'image d\'hébergement:', {
      ...voyageData,
      hebergementImage: imageUrl
    });
  };

  const handleAgencyImageUpload = (imageUrl) => {
    setAgencyData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Données du formulaire activité:', activityData);

      if (!activityData.image) {
        setError('Veuillez uploader une image pour l\'activité');
        return;
      }

      const activityPayload = {
        ...activityData,
        price: Number(activityData.price),
        maxParticipants: Number(activityData.maxParticipants),
        duration: Number(activityData.duration)
      };

      console.log('Payload envoyé au serveur:', activityPayload);

      const response = await axios.post('http://localhost:5000/api/activities', activityPayload);
      console.log('Réponse du serveur:', response.data);
      
      if (response.data) {
        if (activityData.type === 'voyage' && activityData.voyageId) {
          console.log('Mise à jour du voyage avec l\'activité:', activityData.voyageId);
          try {
            const updateResponse = await axios.put(
              `http://localhost:5000/api/voyages/${activityData.voyageId}/activities`,
              { activityId: response.data._id }
            );
            console.log('Réponse mise à jour voyage:', updateResponse.data);
          } catch (updateError) {
            console.error('Erreur lors de la mise à jour du voyage:', updateError);
            alert('L\'activité a été créée mais n\'a pas pu être associée au voyage');
            return;
          }
        }
        alert('Activité ajoutée avec succès!');
        // Réinitialiser le formulaire
        setActivityData({
          name: '',
          description: '',
          price: '',
          city: '',
          image: '',
          type: 'locale',
          duration: '',
          maxParticipants: '',
          isWeekendOnly: false,
          voyageId: '',
          category: ''
        });
        navigate('/activites');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'activité');
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'activité');
    }
  };

  const handleVoyageSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!voyageData.image) {
        setError('Veuillez uploader une image pour le voyage');
        return;
      }

      // Vérifier si l'agence est sélectionnée
      if (!voyageData.agence) {
        setError('Veuillez sélectionner une agence');
        return;
      }

      // Trouver l'objet agence complet à partir du nom sélectionné
      const selectedAgency = agencies.find(agency => agency.name === voyageData.agence);
      
      if (!selectedAgency) {
        setError('Agence introuvable, veuillez en sélectionner une autre');
        return;
      }

      // Créer l'objet à envoyer au serveur
      const voyagePayload = {
        ...voyageData,
        price: Number(voyageData.price || 0),
        duration: Number(voyageData.duration || 1),
        availableSpots: Number(voyageData.availableSpots || 10),
        // Ajouter les champs nécessaires pour le modèle Voyage
        agencyId: selectedAgency._id,
        agencyName: selectedAgency.name
      };

      // Vérifier que l'image d'hébergement est bien incluse dans le payload
      console.log('Vérification du payload avant envoi au serveur:', {
        hebergement: voyagePayload.hebergement,
        hebergementImage: voyagePayload.hebergementImage,
        imageVoyage: voyagePayload.image
      });

      // Récupérer le token d'authentification du stockage local
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Vous devez être connecté pour ajouter un voyage");
        return;
      }

      console.log('Envoi de la requête au serveur avec les données suivantes:', {
        title: voyagePayload.title,
        destination: voyagePayload.destination,
        hebergement: voyagePayload.hebergement,
        hebergementImage: voyagePayload.hebergementImage,
        image: voyagePayload.image
      });

      const response = await axios.post('http://localhost:5000/api/voyages', voyagePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Réponse complète du serveur:', response);
      
      // Vérification du type de contenu
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }

      console.log('Réponse voyage:', response.data);
      alert('Voyage ajouté avec succès!');
      navigate('/voyages');
    } catch (error) {
      console.error('Erreur complète:', error);
      let errorMessage = 'Erreur lors de l\'ajout du voyage';
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état non-2xx
        if (error.response.status === 401) {
          errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.response.headers['content-type']?.includes('application/json')) {
          errorMessage = error.response.data.message || errorMessage;
        } else {
          errorMessage = 'Le serveur a retourné une réponse invalide';
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = 'Impossible de contacter le serveur';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleAgencySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (!agencyData.image) {
        setError('Veuillez uploader une image pour l\'agence');
        return;
      }

      // Validation des données
      if (!agencyData.stars || agencyData.stars === '0') {
        throw new Error("Veuillez sélectionner le nombre d'étoiles");
      }
      
      // Conversion des étoiles en nombre et préparation des données
      const formData = {
        ...agencyData,
        stars: parseFloat(agencyData.stars)
      };
      
      console.log('Envoi des données agence:', formData);
      const response = await axios.post('http://localhost:5000/api/agencies', formData);
      
      // Vérification du type de contenu
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }

      console.log('Réponse agence:', response.data);
      
      if (response.data.agency || response.data) {
        const savedAgency = response.data.agency || response.data;
        console.log('Agence sauvegardée avec succès:', savedAgency);
        alert('Agence ajoutée avec succès!');
        
        // Réinitialiser le formulaire
        setAgencyData({
          name: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          description: '',
          stars: '0',
          image: ''
        });
        
        navigate('/admin/agencies');
      } else {
        throw new Error('Erreur lors de la sauvegarde de l\'agence');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      let errorMessage = 'Erreur lors de l\'ajout de l\'agence';
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état non-2xx
        if (error.response.headers['content-type']?.includes('application/json')) {
          errorMessage = error.response.data.message || errorMessage;
        } else {
          errorMessage = 'Le serveur a retourné une réponse invalide';
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = 'Impossible de contacter le serveur';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  // Gestionnaires de suppression
  const handleActivityDelete = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.delete(`http://localhost:5000/api/activities/${deleteActivityId}`);
      console.log('Réponse suppression activité:', response.data);
      alert('Activité supprimée avec succès!');
      setDeleteActivityId('');
      setActiveForm(null);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression de l\'activité');
      alert(error.response?.data?.message || 'Erreur lors de la suppression de l\'activité');
    }
  };

  const handleVoyageDelete = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.delete(`http://localhost:5000/api/voyages/${deleteVoyageId}`);
      console.log('Réponse suppression voyage:', response.data);
      alert('Voyage supprimé avec succès!');
      setDeleteVoyageId('');
      setActiveForm(null);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression du voyage');
      alert(error.response?.data?.message || 'Erreur lors de la suppression du voyage');
    }
  };

  const handleAgencyDelete = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.delete(`http://localhost:5000/api/agencies/${deleteAgencyId}`);
      console.log('Réponse suppression agence:', response.data);
      alert('Agence supprimée avec succès!');
      setDeleteAgencyId('');
      setActiveForm(null);
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression de l\'agence');
      alert(error.response?.data?.message || 'Erreur lors de la suppression de l\'agence');
    }
  };

  // Fonction pour vérifier si l'utilisateur a les droits d'administrateur
  // Cette fonction peut être supprimée car le contrôle est fait par AdminRoute
  const checkAdminStatus = async () => {
    // Le contrôle d'accès est maintenant géré par le composant AdminRoute
    console.log('Vérification des droits admin désactivée - gérée par AdminRoute');
  };

  // Fonction pour activer le mode admin forcé
  const enableForceAdminAccess = () => {
    // Mode admin forcé n'est plus nécessaire car la vérification est gérée par AdminRoute
    console.log('Mode admin forcé désactivé - utiliser le système de connexion normal');
  };

  // Fonction pour désactiver le mode admin forcé
  const disableForceAdminAccess = () => {
    // Mode admin forcé n'est plus nécessaire car la vérification est gérée par AdminRoute
    console.log('Mode admin forcé désactivé - utiliser le système de connexion normal');
  };

  // Naviguer vers la page de gestion des activités
  const goToActivitiesManagement = () => {
    navigate('/gestion-activites');
  };

  // Naviguer vers la page de gestion des voyages
  const goToVoyagesManagement = () => {
    navigate('/admin/voyages');
  };

  // Naviguer vers la page de gestion des agences
  const goToAgenciesManagement = () => {
    navigate('/admin/agencies');
  };

  // Naviguer vers la page de gestion des réservations
  const goToReservationsManagement = () => {
    navigate('/admin/reservations');
  };

  // Activez le formulaire approprié si spécifié dans l'état de navigation
  useEffect(() => {
    if (location.state?.activateForm) {
      console.log('Activation du formulaire:', location.state.activateForm);
      setActiveForm(location.state.activateForm);
      // Nettoyez l'état pour éviter de réactiver le formulaire lors des navigations ultérieures
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <Container className="py-5">
      <h2 className="text-center mb-5 font-bold text-orange-600 text-3xl">Tableau de Bord <span className="text-gray-800">Administratif</span></h2>
      
      {/* Section de gestion avec trois cartes */}
      <Row className="mb-5">
        <Col md={3} className="mb-4">
          <Card 
            className="h-100 shadow border-0 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={goToActivitiesManagement}
          >
            <div className="bg-gradient-to-r from-orange-400 to-amber-500 text-white p-4 text-center">
              <FaMap className="text-5xl mb-2 mx-auto" />
              <h3 className="text-xl font-bold">Gestion des Activités</h3>
            </div>
            <Card.Body className="bg-orange-50">
              <p className="text-gray-700 mb-4">
                Consultez, ajoutez, modifiez ou supprimez des activités pour les voyages et destinations locales.
              </p>
              <div className="d-flex align-items-center text-orange-600">
                <FaListAlt className="me-2" />
                <span>Voir toutes les activités</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card 
            className="h-100 shadow border-0 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={goToVoyagesManagement}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 text-center">
              <FaPlane className="text-5xl mb-2 mx-auto" />
              <h3 className="text-xl font-bold">Gestion des Voyages</h3>
            </div>
            <Card.Body className="bg-orange-50">
              <p className="text-gray-700 mb-4">
                Consultez, ajoutez, modifiez ou supprimez des voyages, circuits et packages touristiques.
              </p>
              <div className="d-flex align-items-center text-orange-600">
                <FaListAlt className="me-2" />
                <span>Voir tous les voyages</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card 
            className="h-100 shadow border-0 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={goToAgenciesManagement}
          >
            <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white p-4 text-center">
              <FaBuilding className="text-5xl mb-2 mx-auto" />
              <h3 className="text-xl font-bold">Gestion des Agences</h3>
            </div>
            <Card.Body className="bg-orange-50">
              <p className="text-gray-700 mb-4">
                Consultez, ajoutez, modifiez ou supprimez des agences partenaires et leurs informations.
              </p>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center text-orange-600">
                  <FaListAlt className="me-2" />
                  <span>Voir toutes les agences</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card 
            className="h-100 shadow border-0 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={goToReservationsManagement}
          >
            <div className="bg-gradient-to-r from-red-500 to-amber-600 text-white p-4 text-center">
              <FaCalendarCheck className="text-5xl mb-2 mx-auto" />
              <h3 className="text-xl font-bold">Gestion des Réservations</h3>
            </div>
            <Card.Body className="bg-orange-50">
              <p className="text-gray-700 mb-4">
                Consultez et gérez les réservations d'activités et de voyages des clients.
              </p>
              <div className="d-flex align-items-center text-orange-600">
                <FaListAlt className="me-2" />
                <span>Voir toutes les réservations</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Formulaire pour Activité */}
      {activeForm === 'activity' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
          <Form className="mt-4" onSubmit={handleActivitySubmit}>
            <h3 className="mb-4" style={{ color: '#2c3e50' }}>Ajouter une Activité</h3>
            
            {/* Type d'activité */}
            <Form.Group className="mb-4">
              <Form.Label>Type d'activité</Form.Label>
              <Form.Select
                name="type"
                value={activityData.type}
                onChange={handleActivityChange}
                required
                style={{ borderRadius: '8px' }}
              >
                <option value="locale">Activité Locale</option>
                <option value="voyage">Activité de Voyage</option>
              </Form.Select>
            </Form.Group>

            {/* Image en premier */}
            <div className="mb-4">
              <Form.Label className="font-medium mb-2 block">Image de l'activité</Form.Label>
              <ImageUploader onImageUpload={handleActivityImageUpload} />
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'activité</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={activityData.name}
                    onChange={handleActivityChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={activityData.price}
                    onChange={handleActivityChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Durée (heures)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={activityData.duration}
                    onChange={handleActivityChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre maximum de participants</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxParticipants"
                    value={activityData.maxParticipants}
                    onChange={handleActivityChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {activityData.type === 'locale' ? (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ville</Form.Label>
                      <Form.Select
                        name="city"
                        value={activityData.city}
                        onChange={handleActivityChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Sélectionnez une ville</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Catégorie</Form.Label>
                      <Form.Select
                        name="category"
                        value={activityData.category}
                        onChange={handleActivityChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="culture">Culture</option>
                        <option value="aventure">Aventure</option>
                        <option value="gastronomie">Gastronomie</option>
                        <option value="bien-etre">Bien-être</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isWeekendOnly"
                    label="Disponible uniquement le weekend (samedi et dimanche)"
                    checked={activityData.isWeekendOnly}
                    onChange={(e) => handleActivityChange({
                      target: {
                        name: 'isWeekendOnly',
                        value: e.target.checked
                      }
                    })}
                  />
                </Form.Group>
              </>
            ) : (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Voyage associé</Form.Label>
                      <Form.Select
                        name="voyageId"
                        value={activityData.voyageId}
                        onChange={handleActivityChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Sélectionnez un voyage</option>
                        {voyages.map((voyage) => (
                          <option key={voyage._id} value={voyage._id}>
                            {voyage.title} - {voyage.destination}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ville de l'activité</Form.Label>
                      <Form.Select
                        name="city"
                        value={activityData.city}
                        onChange={handleActivityChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Sélectionnez une ville</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Catégorie</Form.Label>
                      <Form.Select
                        name="category"
                        value={activityData.category}
                        onChange={handleActivityChange}
                        required
                        style={{ borderRadius: '8px' }}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="culture">Culture</option>
                        <option value="aventure">Aventure</option>
                        <option value="gastronomie">Gastronomie</option>
                        <option value="bien-etre">Bien-être</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={activityData.description}
                onChange={handleActivityChange}
                required
                style={{ borderRadius: '8px', minHeight: '100px' }}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                style={{
                  backgroundColor: '#C6A05B',
                  border: 'none',
                  padding: '10px 30px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }} 
                type="submit"
              >
                Ajouter l'activité
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Formulaire pour Voyage */}
      {activeForm === 'voyage' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Form className="mt-4" onSubmit={handleVoyageSubmit}>
            <h3 className="mb-4" style={{ color: '#2c3e50' }}>Ajouter un Voyage</h3>
            
            {/* Image en premier */}
            <div className="mb-4">
              <Form.Label className="font-medium mb-2 block">Image du voyage</Form.Label>
              <ImageUploader onImageUpload={handleVoyageImageUpload} />
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Titre du voyage</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={voyageData.title}
                    onChange={handleVoyageChange}
                    required
                    style={{ borderRadius: '8px' }}
                    placeholder="Entrez le titre du voyage"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Agence organisatrice</Form.Label>
                  <Form.Select
                    name="agence"
                    value={voyageData.agence}
                    onChange={handleVoyageChange}
                    required
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">Sélectionnez une agence</option>
                    {agencies.map((agency) => (
                      <option key={agency._id} value={agency.name}>
                        {agency.name} ({agency.city})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix (MAD)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={voyageData.price}
                    onChange={handleVoyageChange}
                    required
                    min="0"
                    style={{ borderRadius: '8px' }}
                    placeholder="Prix en dirhams"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Durée (jours)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={voyageData.duration}
                    onChange={handleVoyageChange}
                    required
                    min="1"
                    style={{ borderRadius: '8px' }}
                    placeholder="Nombre de jours"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Places disponibles</Form.Label>
                  <Form.Control
                    type="number"
                    name="availableSpots"
                    value={voyageData.availableSpots}
                    onChange={handleVoyageChange}
                    required
                    min="1"
                    style={{ borderRadius: '8px' }}
                    placeholder="Nombre de places"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Destination</Form.Label>
                  <Form.Select
                    name="destination"
                    value={voyageData.destination}
                    onChange={handleVoyageChange}
                    required
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">Sélectionnez une ville</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Hébergement</Form.Label>
                  <Form.Control
                    type="text"
                    name="hebergement"
                    value={voyageData.hebergement}
                    onChange={handleVoyageChange}
                    style={{ borderRadius: '8px' }}
                    placeholder="Nom et type d'hébergement (ex: Hôtel Atlas 5*, Riad traditionnel, etc.)"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Image de l'hébergement</Form.Label>
                  <ImageUploader onImageUpload={handleHebergementImageUpload} />
                  <Form.Text className="text-muted">
                    Cette image sera affichée dans la section "Hébergements de Luxe" sur la page d'accueil.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de départ</Form.Label>
                  <Form.Control
                    type="date"
                    name="departureDate"
                    value={voyageData.departureDate}
                    onChange={handleVoyageChange}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de retour</Form.Label>
                  <Form.Control
                    type="date"
                    name="returnDate"
                    value={voyageData.returnDate}
                    onChange={handleVoyageChange}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description détaillée</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={voyageData.description}
                onChange={handleVoyageChange}
                required
                style={{ borderRadius: '8px', minHeight: '120px' }}
                placeholder="Décrivez le programme du voyage, les points d'intérêt, etc."
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                style={{
                  ...buttonStyle,
                  fontSize: '1.1rem',
                  padding: '0.8rem 2.5rem'
                }} 
                type="submit" 
                className="mt-3"
              >
                <i className="fas fa-plus-circle me-2"></i>
                Ajouter le voyage
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Formulaire pour Agence */}
      {activeForm === 'agency' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Form className="mt-4" onSubmit={handleAgencySubmit}>
            <h3 className="mb-4" style={{ color: '#2c3e50' }}>Ajouter une Agence</h3>
            
            {/* Image en premier */}
            <div className="mb-4">
              <Form.Label className="font-medium mb-2 block">Image de l'agence</Form.Label>
              <ImageUploader onImageUpload={handleAgencyImageUpload} />
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'agence</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={agencyData.name}
                    onChange={handleAgencyChange}
                    required
                    style={{ borderRadius: '8px' }}
                    placeholder="Entrez le nom de l'agence"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ville</Form.Label>
                  <Form.Select
                    name="city"
                    value={agencyData.city}
                    onChange={handleAgencyChange}
                    required
                    style={{ 
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '1rem',
                      borderColor: '#dee2e6',
                      backgroundColor: '#fff'
                    }}
                    className="focus:border-sahara focus:ring-1 focus:ring-sahara"
                  >
                    <option value="">Sélectionnez une ville</option>
                    <option value="Toutes les villes du Maroc">Toutes les villes du Maroc (visible partout)</option>
                    <option disabled>──────────</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre d'étoiles</Form.Label>
                  <div className="d-flex align-items-center">
                    <Button
                      onClick={() => {
                        const currentValue = parseFloat(agencyData.stars);
                        if (currentValue > 1) {
                          setAgencyData({ ...agencyData, stars: (currentValue - 0.5).toString() });
                        }
                      }}
                      style={{
                        backgroundColor: '#FF8C38',
                        border: 'none',
                        borderRadius: '8px 0 0 8px',
                        padding: '0.5rem 1rem'
                      }}
                      type="button"
                    >
                      -
                    </Button>
                    <div
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #ced4da',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}
                    >
                      {agencyData.stars === '0' ? '-' : agencyData.stars}
                    </div>
                    <Button
                      onClick={() => {
                        const currentValue = parseFloat(agencyData.stars) || 0;
                        if (currentValue < 5) {
                          setAgencyData({ ...agencyData, stars: (currentValue + 0.5).toString() });
                        }
                      }}
                      style={{
                        backgroundColor: '#FF8C38',
                        border: 'none',
                        borderRadius: '0 8px 8px 0',
                        padding: '0.5rem 1rem'
                      }}
                      type="button"
                    >
                      +
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={agencyData.address}
                onChange={handleAgencyChange}
                required
                style={{ borderRadius: '8px' }}
                placeholder="Adresse complète de l'agence"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={agencyData.phone}
                    onChange={handleAgencyChange}
                    required
                    style={{ borderRadius: '8px' }}
                    placeholder="Numéro de téléphone"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={agencyData.email}
                    onChange={handleAgencyChange}
                    required
                    style={{ borderRadius: '8px' }}
                    placeholder="Adresse email"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={agencyData.description}
                onChange={handleAgencyChange}
                required
                style={{ borderRadius: '8px', minHeight: '120px' }}
                placeholder="Description détaillée de l'agence"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                style={{
                  ...buttonStyle,
                  fontSize: '1.1rem',
                  padding: '0.8rem 2.5rem'
                }} 
                type="submit" 
                className="mt-3"
              >
                <i className="fas fa-plus-circle me-2"></i>
                Ajouter l'agence
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Section des réservations */}
      {activeForm === 'reservations' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 className="mb-4">Gestion des réservations</h3>
          
          {loadingReservations ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status" style={{ color: '#FF8C38' }}>
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-2">Chargement des réservations...</p>
            </div>
          ) : reservationsError ? (
            <div className="alert alert-danger">
              <strong>Erreur:</strong> {reservationsError}
            </div>
          ) : reservations.length === 0 ? (
            <div className="alert alert-info">
              Aucune réservation trouvée.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Détails</th>
                    <th>Nombre de personnes</th>
                    <th>Date de réservation</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr key={reservation._id} className={reservation.statut === 'annulé' ? 'table-danger' : ''}>
                      <td>{reservation._id.substring(0, 8)}...</td>
                      <td>
                        {reservation.user ? (
                          <>
                            <div>{reservation.user.name}</div>
                            <small className="text-muted">{reservation.user.email}</small>
                          </>
                        ) : (
                          <span className="text-muted">Utilisateur inconnu</span>
                        )}
                      </td>
                      <td>
                        {reservation.type === 'voyage' ? (
                          <span className="badge bg-primary">Voyage</span>
                        ) : (
                          <span className="badge bg-success">Activité</span>
                        )}
                      </td>
                      <td>
                        {reservation.type === 'voyage' && reservation.voyage ? (
                          <>
                            <div><strong>{reservation.voyage.title}</strong></div>
                            <small>{reservation.voyage.destination}</small>
                          </>
                        ) : reservation.type === 'activite' && reservation.activite ? (
                          <>
                            <div><strong>{reservation.activite.name}</strong></div>
                            <small>{reservation.activite.city}</small>
                          </>
                        ) : (
                          <span className="text-muted">Détails non disponibles</span>
                        )}
                      </td>
                      <td className="text-center">{reservation.nombrePersonnes}</td>
                      <td>{new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}</td>
                      <td>
                        {reservation.statut === 'confirmé' ? (
                          <span className="badge bg-success">Confirmé</span>
                        ) : reservation.statut === 'en_attente' ? (
                          <span className="badge bg-warning text-dark">En attente</span>
                        ) : (
                          <span className="badge bg-danger">
                            Annulé
                            {reservation.annulePar && ` (par ${reservation.annulePar})`}
                          </span>
                        )}
                      </td>
                      <td>
                        {reservation.statut !== 'annulé' ? (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCancelReservation(reservation._id)}
                          >
                            Annuler
                          </Button>
                        ) : (
                          <small className="text-muted">
                            Annulée le {reservation.dateModification ? new Date(reservation.dateModification).toLocaleDateString('fr-FR') : 'N/A'}
                          </small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="mt-3 text-end">
            <Button 
              style={buttonStyle} 
              onClick={fetchReservations}
              disabled={loadingReservations}
            >
              {loadingReservations ? 'Chargement...' : 'Actualiser les réservations'}
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AddNew; 