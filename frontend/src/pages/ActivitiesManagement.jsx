import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { Form, Button, Row, Col } from 'react-bootstrap';
import ImageUploader from '../components/ImageUploader';
import ActivitiesTable from '../components/ActivitiesTable';
import EditActivityForm from '../components/EditActivityForm';

const ActivitiesManagement = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formError, setFormError] = useState(null);
  
  // États pour le formulaire d'activité
  const [activityData, setActivityData] = useState({
    name: '',
    description: '',
    price: '',
    city: '',
    image: '',
    type: 'locale',
    duration: '',
    maxParticipants: '',
    isWeekendOnly: false,
    category: ''
  });
  
  // Liste des villes disponibles
  const availableCities = [
    "Agadir", "Al Hoceima", "Asilah", "Azrou", "Béni Mellal", "Casablanca",
    "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fès",
    "Ifrane", "Kénitra", "Larache", "Marrakech", "Meknès", "Merzouga",
    "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé",
    "Tanger", "Taroudant", "Tétouan", "Zagora"
  ].sort();
  
  const navigate = useNavigate();

  const handleEdit = (activity) => {
    setCurrentActivity(activity);
    setShowEditForm(true);
  };

  const handleDelete = (id) => {
    setActivityToDelete(id);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/activities/${activityToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'activité');
      }

      setRefreshTrigger(prev => prev + 1);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Erreur de suppression:', error);
    }
  };

  const handleUpdateSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Gestionnaires pour le formulaire d'activité
  const handleActivityChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setActivityData(prev => ({ ...prev, [name]: checked }));
    } else {
      setActivityData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleActivityImageUpload = (imageUrl) => {
    setActivityData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (!activityData.image) {
        setFormError('Veuillez uploader une image pour l\'activité');
        return;
      }

      const activityPayload = {
        ...activityData,
        price: Number(activityData.price),
        maxParticipants: Number(activityData.maxParticipants),
        duration: Number(activityData.duration)
      };

      console.log('Envoi des données activité:', activityPayload);
      const response = await axios.post('http://localhost:5000/api/activities', activityPayload);
      
      console.log('Réponse activité:', response.data);
      
      if (response.data) {
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
          category: ''
        });
        
        // Fermer le formulaire et rafraîchir la liste
        setShowAddForm(false);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      let errorMessage = 'Erreur lors de l\'ajout de l\'activité';
      
      if (error.response) {
        if (error.response.headers['content-type']?.includes('application/json')) {
          errorMessage = error.response.data.message || errorMessage;
        } else {
          errorMessage = 'Le serveur a retourné une réponse invalide';
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur';
      }
      
      setFormError(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
      
        {/* Formulaire d'ajout d'activité */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter une nouvelle activité</h2>
            
            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}
            
            <Form onSubmit={handleActivitySubmit}>
              {/* Image en premier */}
              <div className="mb-5">
                <Form.Label className="font-medium mb-2 block">Image de l'activité</Form.Label>
                <ImageUploader onImageUpload={handleActivityImageUpload} />
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Nom de l'activité</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={activityData.name}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
                      placeholder="Entrez le nom de l'activité"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Type d'activité</Form.Label>
                    <Form.Select
                      name="type"
                      value={activityData.type}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
                    >
                      <option value="locale">Activité Locale</option>
                      <option value="voyage">Activité de Voyage</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Prix (DH)</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={activityData.price}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
                      placeholder="Prix en dirhams"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Durée (heures)</Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={activityData.duration}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
                      placeholder="Durée en heures"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Nombre max. de participants</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxParticipants"
                      value={activityData.maxParticipants}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
                      placeholder="Nombre de participants"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Ville</Form.Label>
                    <Form.Select
                      name="city"
                      value={activityData.city}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
                    >
                      <option value="">Sélectionnez une ville</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Catégorie</Form.Label>
                    <Form.Select
                      name="category"
                      value={activityData.category}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
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

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  id="isWeekendOnly"
                  name="isWeekendOnly"
                  label="Disponible uniquement le weekend (samedi et dimanche)"
                  checked={activityData.isWeekendOnly}
                  onChange={handleActivityChange}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={activityData.description}
                  onChange={handleActivityChange}
                  required
                  className="rounded-lg"
                  placeholder="Description détaillée de l'activité"
                  style={{ minHeight: '120px' }}
                />
              </Form.Group>

              <div className="flex justify-end">
                <Button 
                  variant=""
                  style={{ backgroundColor: '#FF8C38', borderColor: '#FF8C38' }}
                  className="text-white border-0 rounded-lg px-6 py-2 font-semibold" 
                  type="submit"
                >
                  <FaPlus className="inline mr-2" />
                  Ajouter l'activité
                </Button>
              </div>
            </Form>
          </div>
        )}
        
        {/* Liste des activités */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <FaArrowLeft size={18} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des Activités</h1>
            </div>
            
            <button 
              className="bg-sahara text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-sahara/90 transition-colors"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              <span>Ajouter une activité</span>
            </button>
          </div>

          {/* Key element to force re-render when data changes */}
          <ActivitiesTable 
            key={refreshTrigger} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <EditActivityForm 
          activity={currentActivity}
          onClose={() => setShowEditForm(false)}
          onUpdate={handleUpdateSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6 text-gray-600">
              Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesManagement; 