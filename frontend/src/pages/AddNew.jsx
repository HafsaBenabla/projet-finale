import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddNew = () => {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState(null);
  
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
    try {
      await axios.post('http://localhost:5000/api/activities', activityData);
      alert('Activité ajoutée avec succès!');
      navigate('/activites');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error);
      alert('Erreur lors de l\'ajout de l\'activité');
    }
  };

  const handleVoyageSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/voyages', voyageData);
      alert('Voyage ajouté avec succès!');
      navigate('/voyages');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du voyage:', error);
      alert('Erreur lors de l\'ajout du voyage');
    }
  };

  const handleAgencySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/agencies', agencyData);
      alert('Agence ajoutée avec succès!');
      navigate('/agencies');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'agence:', error);
      alert('Erreur lors de l\'ajout de l\'agence');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Que souhaitez-vous ajouter ?</h2>
      
      <Row className="g-4">
        {/* Carte pour Activité */}
        <Col md={4}>
          <Card 
            className="h-100 cursor-pointer" 
            onClick={() => setActiveForm('activity')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <Card.Title>Ajouter une Activité</Card.Title>
              <Card.Text>
                Créez une nouvelle activité locale pour les voyageurs
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Carte pour Voyage */}
        <Col md={4}>
          <Card 
            className="h-100" 
            onClick={() => setActiveForm('voyage')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <Card.Title>Ajouter un Voyage</Card.Title>
              <Card.Text>
                Créez un nouveau package de voyage
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Carte pour Agence */}
        <Col md={4}>
          <Card 
            className="h-100" 
            onClick={() => setActiveForm('agency')}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body className="text-center">
              <Card.Title>Ajouter une Agence</Card.Title>
              <Card.Text>
                Enregistrez une nouvelle agence de voyage
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Formulaire pour Activité */}
      {activeForm === 'activity' && (
        <Form className="mt-5" onSubmit={handleActivitySubmit}>
          <h3 className="mb-4">Ajouter une Activité</h3>
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
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Ajouter l'activité
          </Button>
        </Form>
      )}

      {/* Formulaire pour Voyage */}
      {activeForm === 'voyage' && (
        <Form className="mt-5" onSubmit={handleVoyageSubmit}>
          <h3 className="mb-4">Ajouter un Voyage</h3>
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
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Ajouter le voyage
          </Button>
        </Form>
      )}

      {/* Formulaire pour Agence */}
      {activeForm === 'agency' && (
        <Form className="mt-5" onSubmit={handleAgencySubmit}>
          <h3 className="mb-4">Ajouter une Agence</h3>
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
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Ajouter l'agence
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default AddNew; 