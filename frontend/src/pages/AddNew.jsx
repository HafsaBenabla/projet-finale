import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddNew = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState(null);
  const [error, setError] = useState(null);
  
  // États pour le formulaire d'activité
  const [activityData, setActivityData] = useState({
    name: '',
    description: '',
    price: '',
    city: '',
    category: '',
    image: ''
  });

  // États pour le formulaire de voyage
  const [voyageData, setVoyageData] = useState({
    title: '',
    description: '',
    price: '',
    destination: '',
    duration: '',
    image: ''
  });

  // États pour le formulaire d'agence
  const [agencyData, setAgencyData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: ''
  });

  // États pour la suppression
  const [deleteActivityId, setDeleteActivityId] = useState('');
  const [deleteVoyageId, setDeleteVoyageId] = useState('');
  const [deleteAgencyId, setDeleteAgencyId] = useState('');

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
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
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

  // Gestionnaires de soumission
  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/activities', activityData);
      console.log('Réponse activité:', response.data);
      alert('Activité ajoutée avec succès!');
      navigate('/activites');
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'activité');
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'activité');
    }
  };

  const handleVoyageSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/voyages', voyageData);
      console.log('Réponse voyage:', response.data);
      alert('Voyage ajouté avec succès!');
      navigate('/voyages');
    } catch (error) {
      console.error('Erreur complète:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout du voyage');
      alert(error.response?.data?.message || 'Erreur lors de l\'ajout du voyage');
    }
  };

  const handleAgencySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Envoi des données agence:', agencyData);
      const response = await axios.post('http://localhost:5000/api/agencies', agencyData);
      console.log('Réponse agence:', response.data);
      alert('Agence ajoutée avec succès!');
      navigate('/');
    } catch (error) {
      console.error('Erreur complète:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'ajout de l\'agence';
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
            onClick={() => setActiveForm('activity')}
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

      {/* Formulaire pour Activité */}
      {activeForm === 'activity' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Form className="mt-4" onSubmit={handleActivitySubmit}>
            <h3 className="mb-4" style={{ color: '#2c3e50' }}>Ajouter une Activité</h3>
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
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={activityData.description}
                onChange={handleActivityChange}
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ville</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={activityData.city}
                    onChange={handleActivityChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={activityData.category}
                    onChange={handleActivityChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>URL de l'image</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={activityData.image}
                onChange={handleActivityChange}
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
            <Button style={buttonStyle} type="submit" className="mt-3">
              Ajouter l'activité
            </Button>
          </Form>
        </div>
      )}

      {/* Formulaire pour Voyage */}
      {activeForm === 'voyage' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Form className="mt-4" onSubmit={handleVoyageSubmit}>
            <h3 className="mb-4" style={{ color: '#2c3e50' }}>Ajouter un Voyage</h3>
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
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={voyageData.price}
                    onChange={handleVoyageChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={voyageData.description}
                onChange={handleVoyageChange}
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Destination</Form.Label>
                  <Form.Control
                    type="text"
                    name="destination"
                    value={voyageData.destination}
                    onChange={handleVoyageChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Durée (en jours)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={voyageData.duration}
                    onChange={handleVoyageChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>URL de l'image</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={voyageData.image}
                onChange={handleVoyageChange}
                required
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
            <Button style={buttonStyle} type="submit" className="mt-3">
              Ajouter le voyage
            </Button>
          </Form>
        </div>
      )}

      {/* Formulaire pour Agence */}
      {activeForm === 'agency' && (
        <div className="form-container p-4" style={{ background: '#f8f9fa', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <Form className="mt-4" onSubmit={handleAgencySubmit}>
            <h3 className="mb-4" style={{ color: '#2c3e50' }}>Ajouter une Agence</h3>
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
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ville</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={agencyData.city}
                    onChange={handleAgencyChange}
                    required
                    style={{ borderRadius: '8px' }}
                  />
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
                style={{ borderRadius: '8px' }}
              />
            </Form.Group>
            <Button style={buttonStyle} type="submit" className="mt-3">
              Ajouter l'agence
            </Button>
          </Form>
        </div>
      )}
    </Container>
  );
};

export default AddNew; 