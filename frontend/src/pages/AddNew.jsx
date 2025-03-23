import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

const AddNew = () => {
  const navigate = useNavigate();
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
    notIncluded: []
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

  // Log l'état initial
  useEffect(() => {
    console.log('État initial de activeForm:', activeForm);
  }, []);

  // Log chaque changement de activeForm
  useEffect(() => {
    console.log('activeForm a changé:', activeForm);
  }, [activeForm]);

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
    setVoyageData(prev => ({
      ...prev,
      image: imageUrl
    }));
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

      const response = await axios.post('http://localhost:5000/api/voyages', voyageData);
      
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
      
      if (response.data.agency) {
        console.log('Agence sauvegardée avec succès:', response.data.agency);
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
        
        navigate('/');
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

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4" style={{ color: '#2c3e50', fontWeight: '600' }}>
        Tableau de bord administrateur
      </h2>
      
      <Row className="g-4 mb-5">
        {/* Carte pour Activité */}
        <Col md={4}>
          <Card 
            style={activeForm === 'activity' ? activeCardStyle : cardStyle}
            onClick={() => {
              console.log('Clic sur la carte Activité');
              console.log('État actuel de activeForm:', activeForm);
              setActiveForm('activity');
            }}
            className="text-center p-4"
          >
            <Card.Body>
              <div style={cardIconStyle}>
                <i className="fas fa-hiking"></i>
              </div>
              <Card.Title style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Ajouter une Activité
              </Card.Title>
              <Card.Text style={{ color: '#666' }}>
                Créez une nouvelle activité locale pour les voyageurs
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Carte pour Voyage */}
        <Col md={4}>
          <Card 
            style={activeForm === 'voyage' ? activeCardStyle : cardStyle}
            onClick={() => setActiveForm('voyage')}
            className="text-center p-4"
          >
            <Card.Body>
              <div style={cardIconStyle}>
                <i className="fas fa-plane-departure"></i>
              </div>
              <Card.Title style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Ajouter un Voyage
              </Card.Title>
              <Card.Text style={{ color: '#666' }}>
                Créez un nouveau package de voyage
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Carte pour Agence */}
        <Col md={4}>
          <Card 
            style={activeForm === 'agency' ? activeCardStyle : cardStyle}
            onClick={() => setActiveForm('agency')}
            className="text-center p-4"
          >
            <Card.Body>
              <div style={cardIconStyle}>
                <i className="fas fa-building"></i>
              </div>
              <Card.Title style={{ color: '#2c3e50', fontSize: '1.5rem', marginBottom: '1rem' }}>
                Ajouter une Agence
              </Card.Title>
              <Card.Text style={{ color: '#666' }}>
                Enregistrez une nouvelle agence de voyage
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="deletion-section py-5" style={{ background: '#f8f9fa', borderRadius: '20px', marginTop: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        <h2 className="text-center mb-4" style={{ color: '#dc3545', fontWeight: '600', fontSize: '2rem' }}>
          <i className="fas fa-shield-alt me-2"></i>
          Zone de Suppression
        </h2>
        <p className="text-center text-muted mb-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Cette zone permet de supprimer des éléments de la base de données. Attention, cette action est irréversible.
        </p>

        <Row className="g-4 mb-5">
          {/* Carte pour Supprimer Activité */}
          <Col md={4}>
            <Card 
              style={{
                ...cardStyle,
                border: activeForm === 'delete-activity' ? '2px solid #dc3545' : '1px solid rgba(220, 53, 69, 0.2)',
                transform: activeForm === 'delete-activity' ? 'translateY(-5px)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setActiveForm('delete-activity')}
              className="text-center p-4 h-100"
            >
              <Card.Body>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(220, 53, 69, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <i className="fas fa-hiking" style={{ fontSize: '1.5rem', color: '#dc3545' }}></i>
                </div>
                <Card.Title style={{ color: '#dc3545', fontSize: '1.3rem', marginBottom: '1rem' }}>
                  Supprimer une Activité
                </Card.Title>
                <Card.Text style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  Suppression sécurisée d'une activité existante
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte pour Supprimer Voyage */}
          <Col md={4}>
            <Card 
              style={{
                ...cardStyle,
                border: activeForm === 'delete-voyage' ? '2px solid #dc3545' : '1px solid rgba(220, 53, 69, 0.2)',
                transform: activeForm === 'delete-voyage' ? 'translateY(-5px)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setActiveForm('delete-voyage')}
              className="text-center p-4 h-100"
            >
              <Card.Body>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(220, 53, 69, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <i className="fas fa-plane-departure" style={{ fontSize: '1.5rem', color: '#dc3545' }}></i>
                </div>
                <Card.Title style={{ color: '#dc3545', fontSize: '1.3rem', marginBottom: '1rem' }}>
                  Supprimer un Voyage
                </Card.Title>
                <Card.Text style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  Suppression sécurisée d'un voyage existant
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Carte pour Supprimer Agence */}
          <Col md={4}>
            <Card 
              style={{
                ...cardStyle,
                border: activeForm === 'delete-agency' ? '2px solid #dc3545' : '1px solid rgba(220, 53, 69, 0.2)',
                transform: activeForm === 'delete-agency' ? 'translateY(-5px)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setActiveForm('delete-agency')}
              className="text-center p-4 h-100"
            >
              <Card.Body>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(220, 53, 69, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <i className="fas fa-building" style={{ fontSize: '1.5rem', color: '#dc3545' }}></i>
                </div>
                <Card.Title style={{ color: '#dc3545', fontSize: '1.3rem', marginBottom: '1rem' }}>
                  Supprimer une Agence
                </Card.Title>
                <Card.Text style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  Suppression sécurisée d'une agence existante
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Formulaires de suppression simplifiés */}
        <Row className="justify-content-center mt-4">
          <Col md={6}>
            {activeForm === 'delete-activity' && (
              <Card style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 4px 6px rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.2)'
              }}>
                <Card.Body className="p-4">
                  <Form onSubmit={handleActivityDelete}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#dc3545', fontWeight: '500', fontSize: '1.1rem' }}>
                        ID de l'activité à supprimer
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={deleteActivityId}
                        onChange={(e) => setDeleteActivityId(e.target.value)}
                        required
                        style={{ 
                          borderRadius: '8px',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          padding: '0.75rem',
                          fontSize: '1rem'
                        }}
                        placeholder="Entrez l'ID de l'activité"
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                      <Button 
                        type="submit"
                        style={{
                          backgroundColor: '#dc3545',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="fas fa-trash-alt me-2"></i>
                        Supprimer l'activité
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {activeForm === 'delete-voyage' && (
              <Card style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 4px 6px rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.2)'
              }}>
                <Card.Body className="p-4">
                  <Form onSubmit={handleVoyageDelete}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#dc3545', fontWeight: '500', fontSize: '1.1rem' }}>
                        ID du voyage à supprimer
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={deleteVoyageId}
                        onChange={(e) => setDeleteVoyageId(e.target.value)}
                        required
                        style={{ 
                          borderRadius: '8px',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          padding: '0.75rem',
                          fontSize: '1rem'
                        }}
                        placeholder="Entrez l'ID du voyage"
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                      <Button 
                        type="submit"
                        style={{
                          backgroundColor: '#dc3545',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="fas fa-trash-alt me-2"></i>
                        Supprimer le voyage
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {activeForm === 'delete-agency' && (
              <Card style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 4px 6px rgba(220, 53, 69, 0.1)',
                border: '1px solid rgba(220, 53, 69, 0.2)'
              }}>
                <Card.Body className="p-4">
                  <Form onSubmit={handleAgencyDelete}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: '#dc3545', fontWeight: '500', fontSize: '1.1rem' }}>
                        ID de l'agence à supprimer
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={deleteAgencyId}
                        onChange={(e) => setDeleteAgencyId(e.target.value)}
                        required
                        style={{ 
                          borderRadius: '8px',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          padding: '0.75rem',
                          fontSize: '1rem'
                        }}
                        placeholder="Entrez l'ID de l'agence"
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                      <Button 
                        type="submit"
                        style={{
                          backgroundColor: '#dc3545',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="fas fa-trash-alt me-2"></i>
                        Supprimer l'agence
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </div>

      {/* Formulaire pour Activité avec log de débogage */}
      {console.log('Avant la condition de rendu du formulaire, activeForm:', activeForm)}
      {activeForm === 'activity' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '2rem' }}>
          {console.log('Rendu du formulaire d\'activité')}
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
                    <option value="Toutes les villes du Maroc">Toutes les villes du Maroc</option>
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
    </Container>
  );
};

export default AddNew; 