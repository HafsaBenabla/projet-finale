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
    console.log("Édition de l'activité:", activity);
    
    // Vérifier et traiter l'URL de l'image si nécessaire
    if (activity.image && !activity.image.startsWith('http')) {
      activity.image = `http://localhost:5000${activity.image}`;
    }
    
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
      
        {/* En-tête avec bouton retour et ajouter */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center text-gray-600 hover:text-sahara"
          >
            <FaArrowLeft className="mr-2" />
            Retour au Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-center text-gray-800">Gestion des Activités</h1>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center bg-sahara text-white px-4 py-2 rounded-lg hover:bg-sahara/90"
          >
            <FaPlus className="mr-2" />
            Ajouter une activité
          </button>
        </div>

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

        {/* Formulaire d'édition d'activité */}
        {showEditForm && currentActivity && (
          <EditActivityForm 
            activity={currentActivity} 
            onClose={() => {
              setShowEditForm(false);
              setCurrentActivity(null);
            }}
            onUpdate={(updatedActivity) => {
              setRefreshTrigger(prev => prev + 1);
              alert('Activité mise à jour avec succès !');
            }}
          />
        )}

        {/* Modal de confirmation de suppression */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
              <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.</p>
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
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tableau des activités */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Liste des Activités</h2>
          <ActivitiesTable 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            refreshTrigger={refreshTrigger} 
          />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesManagement; 