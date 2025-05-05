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
  const [voyages, setVoyages] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState([]);
  
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
    category: '',
    timeSlots: [],
    voyageName: '',
    voyageId: '',
    agencyId: ''
  });
  
  // Pour gérer les créneaux horaires temporaires avant de les ajouter
  const [tempTimeSlot, setTempTimeSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    availableSpots: ''
  });

  // Charger la liste des activités
  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    }
  };

  // Charger les activités au montage et quand refreshTrigger change
  useEffect(() => {
    fetchActivities();
  }, [refreshTrigger]);

  // Chargement des voyages existants
  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/voyages');
        setVoyages(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des voyages:', error);
      }
    };
    
    fetchVoyages();
  }, [refreshTrigger]);
  
  // Pour générer automatiquement les dates du week-end
  const getUpcomingWeekendDates = () => {
    const today = new Date();
    const dates = [];
    
    // Trouver le prochain samedi
    let nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (6 - today.getDay()) % 7);
    
    // Trouver le prochain dimanche
    let nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + (7 - today.getDay()) % 7);
    
    // Si aujourd'hui est dimanche, passer au week-end suivant
    if (today.getDay() === 0) {
      nextSaturday.setDate(nextSaturday.getDate() + 7);
      nextSunday.setDate(nextSunday.getDate() + 7);
    }
    
    // Formater les dates
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    dates.push({ value: formatDate(nextSaturday), label: `Samedi ${nextSaturday.getDate()}/${nextSaturday.getMonth() + 1}` });
    dates.push({ value: formatDate(nextSunday), label: `Dimanche ${nextSunday.getDate()}/${nextSunday.getMonth() + 1}` });
    
    // Ajouter les dates du week-end suivant
    let nextWeekSaturday = new Date(nextSaturday);
    nextWeekSaturday.setDate(nextWeekSaturday.getDate() + 7);
    
    let nextWeekSunday = new Date(nextSunday);
    nextWeekSunday.setDate(nextWeekSunday.getDate() + 7);
    
    dates.push({ value: formatDate(nextWeekSaturday), label: `Samedi ${nextWeekSaturday.getDate()}/${nextWeekSaturday.getMonth() + 1}` });
    dates.push({ value: formatDate(nextWeekSunday), label: `Dimanche ${nextWeekSunday.getDate()}/${nextWeekSunday.getMonth() + 1}` });
    
    return dates;
  };
  
  const weekendDates = getUpcomingWeekendDates();
  
  // Pour ajouter un créneau horaire temporaire à la liste
  const addTimeSlot = () => {
    if (!tempTimeSlot.date || !tempTimeSlot.startTime || !tempTimeSlot.endTime || !tempTimeSlot.availableSpots) {
      alert('Veuillez remplir tous les champs du créneau horaire');
      return;
    }
    
    setActivityData({
      ...activityData,
      timeSlots: [...activityData.timeSlots, { ...tempTimeSlot }]
    });
    
    // Réinitialiser le formulaire temporaire
    setTempTimeSlot({
      date: '',
      startTime: '',
      endTime: '',
      availableSpots: ''
    });
  };
  
  // Pour supprimer un créneau horaire
  const removeTimeSlot = (index) => {
    const updatedTimeSlots = [...activityData.timeSlots];
    updatedTimeSlots.splice(index, 1);
    setActivityData({
      ...activityData,
      timeSlots: updatedTimeSlots
    });
  };
  
  // Gestionnaire pour les changements dans le formulaire temporaire de créneau
  const handleTimeSlotChange = (e) => {
    const { name, value } = e.target;
    setTempTimeSlot({
      ...tempTimeSlot,
      [name]: value
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Vérifier si l'image est présente
      if (!activityData.image) {
        setFormError('Veuillez ajouter une image pour l\'activité');
        setIsSubmitting(false);
        return;
      }

      // Vérifier si une agence est sélectionnée
      if (!activityData.agencyId) {
        setFormError('Veuillez sélectionner une agence');
        setIsSubmitting(false);
        return;
      }

      // Trouver l'agence sélectionnée
      const selectedAgency = agencies.find(agency => agency._id === activityData.agencyId);
      if (!selectedAgency) {
        setFormError('Agence non trouvée');
        setIsSubmitting(false);
        return;
      }

      const activityPayload = {
        name: activityData.name,
        description: activityData.description,
        price: Number(activityData.price),
        city: activityData.city,
        image: activityData.image,
        type: activityData.type,
        duration: activityData.duration,
        maxParticipants: Number(activityData.maxParticipants),
        isWeekendOnly: activityData.isWeekendOnly,
        voyageId: activityData.voyageId,
        category: activityData.category,
        agencyId: activityData.agencyId,
        agencyName: selectedAgency.name,
        timeSlots: activityData.timeSlots
      };

      console.log('Envoi des données de l\'activité:', activityPayload);

      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Vous devez être connecté pour ajouter une activité");
      }

      const response = await axios.post(
        'http://localhost:5000/api/activities',
        activityPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Réponse du serveur:', response.data);

      if (response.data) {
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
          category: '',
          agencyId: '',
          timeSlots: []
        });
        
        // Mettre à jour la liste des activités immédiatement
        setActivities(prevActivities => [...prevActivities, response.data]);
        
        // Fermer le formulaire
        setShowAddForm(false);
        
        // Déclencher le rafraîchissement
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setFormError(err.response?.data?.message || err.message || 'Erreur lors de l\'ajout de l\'activité');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chargement des agences existantes
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/agencies');
        setAgencies(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des agences:', error);
      }
    };
    
    fetchAgencies();
  }, [refreshTrigger]);

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
            
            <Form onSubmit={handleSubmit}>
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
                      placeholder="Nom de l'activité"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Agence organisatrice</Form.Label>
                    <Form.Select
                      name="agencyId"
                      value={activityData.agencyId}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
                    >
                      <option value="">Sélectionnez une agence</option>
                      {agencies.filter(agency => agency.type === 'activite').map((agency) => (
                        <option key={agency._id} value={agency._id}>
                          {agency.name} - {agency.city === "Toutes les villes du Maroc" ? "Disponible dans toutes les villes" : `Disponible à ${agency.city}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
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
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Voyage associé</Form.Label>
                    <Form.Select
                      name="voyageId"
                      value={activityData.voyageId}
                      onChange={handleActivityChange}
                      required
                      className="rounded-lg"
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
              </Row>

              <Row>
                <Col md={6}>
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
                <Col md={6}>
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
                      <option value="sport-sensations">Sport & Sensations</option>
                      <option value="nature-aventure">Nature & Aventure</option>
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

              {/* Section des créneaux horaires - visible uniquement si activité locale + weekend */}
              {activityData.type === 'locale' && activityData.isWeekendOnly && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold mb-3">Créneaux horaires disponibles</h3>
                  
                  {activityData.timeSlots.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Créneaux programmés :</h4>
                      <div className="space-y-2">
                        {activityData.timeSlots.map((slot, index) => {
                          // Trouver le label de la date
                          const dateObj = weekendDates.find(d => d.value === slot.date);
                          const dateLabel = dateObj ? dateObj.label : slot.date;
                          
                          return (
                            <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                              <div>
                                <span className="font-medium">📅 {dateLabel}</span> • 
                                <span className="ml-2">⏰ {slot.startTime} - {slot.endTime}</span> • 
                                <span className="ml-2">💺 {slot.availableSpots} places</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Ajouter un nouveau créneau :</h4>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Date</Form.Label>
                          <Form.Select
                            name="date"
                            value={tempTimeSlot.date}
                            onChange={handleTimeSlotChange}
                            className="rounded-lg"
                          >
                            <option value="">Sélectionnez une date</option>
                            {weekendDates.map((date, index) => (
                              <option key={index} value={date.value}>
                                {date.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Heure de début</Form.Label>
                          <Form.Control
                            type="time"
                            name="startTime"
                            value={tempTimeSlot.startTime}
                            onChange={handleTimeSlotChange}
                            className="rounded-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Heure de fin</Form.Label>
                          <Form.Control
                            type="time"
                            name="endTime"
                            value={tempTimeSlot.endTime}
                            onChange={handleTimeSlotChange}
                            className="rounded-lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Places disponibles</Form.Label>
                          <Form.Control
                            type="number"
                            name="availableSpots"
                            value={tempTimeSlot.availableSpots}
                            onChange={handleTimeSlotChange}
                            min="1"
                            className="rounded-lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="d-flex align-items-end">
                        <Button
                          type="button"
                          variant="outline-primary"
                          className="w-100 rounded-lg"
                          onClick={addTimeSlot}
                        >
                          Ajouter ce créneau
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </div>
              )}

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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="inline mr-2 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <FaPlus className="inline mr-2" />
                      Ajouter l'activité
                    </>
                  )}
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
            activities={activities}
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