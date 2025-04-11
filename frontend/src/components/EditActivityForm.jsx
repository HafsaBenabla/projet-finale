import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const EditActivityForm = ({ activity, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    price: '',
    image: '',
    type: 'locale',
    duration: '',
    maxParticipants: '',
    isWeekendOnly: false,
    category: '',
    timeSlots: [],
    voyageName: '',
    voyageId: ''
  });
  
  // Pour gérer les créneaux horaires temporaires avant de les ajouter
  const [tempTimeSlot, setTempTimeSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    availableSpots: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [voyages, setVoyages] = useState([]);

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
  }, []);

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

  // Liste des villes disponibles
  const availableCities = [
    "Agadir", "Al Hoceima", "Asilah", "Azrou", "Béni Mellal", "Casablanca",
    "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fès",
    "Ifrane", "Kénitra", "Larache", "Marrakech", "Meknès", "Merzouga",
    "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé",
    "Tanger", "Taroudant", "Tétouan", "Zagora"
  ].sort();

  useEffect(() => {
    if (activity) {
      console.log("Données reçues pour édition:", activity);
      setFormData({
        name: activity.name || '',
        description: activity.description || '',
        city: activity.city || '',
        price: activity.price?.toString() || '',
        image: activity.image || '',
        type: activity.type || 'locale',
        maxParticipants: activity.maxParticipants?.toString() || '',
        duration: activity.duration?.toString() || '',
        isWeekendOnly: activity.isWeekendOnly || false,
        category: activity.category || '',
        voyageId: activity.voyageId || '',
        timeSlots: activity.timeSlots || [],
        voyageName: activity.voyageName || ''
      });
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };
  
  // Pour ajouter un créneau horaire temporaire à la liste
  const addTimeSlot = () => {
    if (!tempTimeSlot.date || !tempTimeSlot.startTime || !tempTimeSlot.endTime || !tempTimeSlot.availableSpots) {
      alert('Veuillez remplir tous les champs du créneau horaire');
      return;
    }
    
    setFormData({
      ...formData,
      timeSlots: [...formData.timeSlots, { ...tempTimeSlot }]
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
    const updatedTimeSlots = [...formData.timeSlots];
    updatedTimeSlots.splice(index, 1);
    setFormData({
      ...formData,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.image) {
      setError('Veuillez uploader une image pour l\'activité');
      setIsSubmitting(false);
      return;
    }

    try {
      // Préparer les données à envoyer au serveur
      const activityPayload = {
        ...formData,
        price: Number(formData.price),
        maxParticipants: Number(formData.maxParticipants),
        duration: Number(formData.duration)
      };

      console.log('Envoi des données pour mise à jour:', activityPayload);

      // Corriger le chemin de l'API
      const response = await fetch(`http://localhost:5000/api/activities/${activity._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification de l\'activité');
      }

      const updatedActivity = await response.json();
      console.log('Activité mise à jour avec succès:', updatedActivity);
      
      onUpdate(updatedActivity);
      onClose();
    } catch (err) {
      console.error('Erreur de mise à jour:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Modifier l'activité</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Form.Label className="font-medium mb-2 block">Image de l'activité</Form.Label>
              {formData.image && (
                <div className="mb-3 border rounded p-2">
                  <img 
                    src={formData.image} 
                    alt="Aperçu de l'activité" 
                    className="w-full h-40 object-cover rounded"
                    onError={(e) => {
                      console.error("Erreur de chargement d'image:", formData.image);
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x250?text=Image+non+disponible";
                    }}
                  />
                </div>
              )}
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'activité</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type d'activité</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prix (MAD)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Durée (heures)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="0.5"
                    step="0.5"
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre maximum de participants</Form.Label>
                  <Form.Control
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    required
                    min="1"
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ville</Form.Label>
                  <Form.Select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
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
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isWeekendOnly"
                    name="isWeekendOnly"
                    label="Disponible uniquement le weekend"
                    checked={formData.isWeekendOnly}
                    onChange={handleChange}
                    className="mt-4"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Section des créneaux horaires - visible uniquement si activité locale + weekend */}
            {formData.type === 'locale' && formData.isWeekendOnly && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-3">Créneaux horaires disponibles</h3>
                
                {formData.timeSlots && formData.timeSlots.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Créneaux programmés :</h4>
                    <div className="space-y-2">
                      {formData.timeSlots.map((slot, index) => {
                        // Trouver le label de la date
                        const dateObj = weekendDates.find(d => d.value === slot.date);
                        const dateLabel = dateObj ? dateObj.label : new Date(slot.date).toLocaleDateString('fr-FR');
                        
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

            {/* Champ pour le nom de voyage - visible uniquement si le type est "voyage" */}
            {formData.type === 'voyage' && (
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Voyage associé</Form.Label>
                    <Form.Select
                      name="voyageId"
                      value={formData.voyageId}
                      onChange={handleChange}
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
            )}

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="rounded-lg"
              />
            </Form.Group>

            <div className="mt-4 flex justify-end space-x-3">
              <Button 
                type="button"
                variant="outline-secondary"
                onClick={onClose}
                className="px-4 py-2 rounded-lg"
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                variant=""
                style={{ backgroundColor: '#FF8C38', borderColor: '#FF8C38' }}
                className="px-4 py-2 text-white rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditActivityForm; 