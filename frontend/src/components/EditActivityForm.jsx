import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import { Form, Button, Row, Col } from 'react-bootstrap';

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
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
        voyageId: activity.voyageId || ''
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
              <Col md={12}>
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
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {formData.type === 'locale' && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isWeekendOnly"
                  label="Disponible uniquement le weekend (samedi et dimanche)"
                  checked={formData.isWeekendOnly}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'isWeekendOnly',
                      value: e.target.checked,
                      type: 'checkbox',
                      checked: e.target.checked
                    }
                  })}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="rounded-lg"
                rows="4"
              />
            </Form.Group>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline-secondary" 
                onClick={onClose}
                className="mx-2"
              >
                Annuler
              </Button>
              <Button
                variant="primary" 
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: '#FF8C38', borderColor: '#FF8C38' }}
              >
                {isSubmitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditActivityForm; 