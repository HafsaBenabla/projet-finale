import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const EditAgencyForm = ({ agency, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    stars: '0',
    image: '',
    type: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Liste des villes disponibles
  const availableCities = [
    "Agadir", "Al Hoceima", "Asilah", "Azrou", "Béni Mellal", "Casablanca",
    "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fès",
    "Ifrane", "Kénitra", "Larache", "Marrakech", "Meknès", "Merzouga",
    "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé",
    "Taghazout", "Tanger", "Taroudant", "Tétouan", "Zagora", "Toutes les villes du Maroc"
  ].sort();

  useEffect(() => {
    if (agency) {
      console.log("Données d'agence reçues pour édition:", agency);
      setFormData({
        name: agency.name || '',
        address: agency.address || '',
        city: agency.city || '',
        phone: agency.phone || '',
        email: agency.email || '',
        description: agency.description || '',
        stars: (agency.stars || 0).toString(),
        image: agency.image || '',
        type: agency.type || ''
      });
    }
  }, [agency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Champ modifié: ${name}, Nouvelle valeur: ${value}`);
    setFormData(prev => ({ ...prev, [name]: value }));
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

    try {
      console.log('État du formulaire avant soumission:', formData);
      console.log('Type d\'agence sélectionné:', formData.type);

      if (!formData.image) {
        throw new Error('Veuillez uploader une image pour l\'agence');
      }

      // Validation des données
      if (!formData.stars || formData.stars === '0') {
        throw new Error("Veuillez sélectionner le nombre d'étoiles");
      }

      if (!formData.type || formData.type.trim() === '') {
        throw new Error("Veuillez sélectionner le type d'agence");
      }
      
      // Conversion des étoiles en nombre et préparation des données
      const updatedData = {
        ...formData,
        stars: parseFloat(formData.stars),
        type: formData.type.trim()
      };
      
      console.log('Données envoyées au serveur:', updatedData);
      
      const response = await axios.put(
        `http://localhost:5000/api/agencies/${agency._id}`,
        updatedData
      );

      console.log('Réponse du serveur:', response.data);
      
      // Retourner l'agence mise à jour au parent
      onUpdate(response.data.agency || response.data);
      onClose();
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de l\'agence');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Modifier l'agence</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!isSubmitting && !error && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4">
              Les données de l'agence sont chargées. Vous pouvez maintenant modifier l'image, le type et le nombre d'étoiles.
            </div>
          )}
          
          <Form onSubmit={handleSubmit}>
            {/* Image principale */}
            <div className="mb-5">
              <Form.Label className="font-medium mb-2 block">Image de l'agence</Form.Label>
              {formData.image && (
                <div className="mb-3 border rounded p-2">
                  <img 
                    src={formData.image} 
                    alt="Agence" 
                    className="h-40 object-cover rounded-lg w-full" 
                    onError={(e) => {
                      console.error("Erreur de chargement d'image:", formData.image);
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x250?text=Image+non+disponible";
                    }}
                  />
                </div>
              )}
              <ImageUploader onImageUpload={handleImageUpload} />
              <Form.Text className="text-muted block mt-1">
                Vous pouvez changer l'image de l'agence en téléchargeant une nouvelle image ci-dessus.
              </Form.Text>
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Nom de l'agence</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="rounded-lg bg-gray-100"
                    disabled={true}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Type d'agence</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="rounded-lg border-2 border-sahara"
                  >
                    <option value="">Sélectionnez le type d'agence</option>
                    <option value="voyage">Agence de voyages</option>
                    <option value="activite">Agence d'activités</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Vous pouvez modifier le type de l'agence.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Ville</Form.Label>
                  <Form.Select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="rounded-lg bg-gray-100"
                    disabled={true}
                  >
                    <option value="">Sélectionnez une ville</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Étoiles</Form.Label>
                  <Form.Select 
                    name="stars" 
                    value={formData.stars} 
                    onChange={handleChange}
                    required
                    className="rounded-lg border-2 border-sahara"
                  >
                    <option value="0">Sélectionnez le nombre d'étoiles</option>
                    <option value="1">1 étoile</option>
                    <option value="1.5">1.5 étoiles</option>
                    <option value="2">2 étoiles</option>
                    <option value="2.5">2.5 étoiles</option>
                    <option value="3">3 étoiles</option>
                    <option value="3.5">3.5 étoiles</option>
                    <option value="4">4 étoiles</option>
                    <option value="4.5">4.5 étoiles</option>
                    <option value="5">5 étoiles</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="rounded-lg bg-gray-100"
                disabled={true} // L'adresse ne peut pas être modifiée
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="rounded-lg bg-gray-100"
                    disabled={true} // Le téléphone ne peut pas être modifié
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="rounded-lg bg-gray-100"
                    disabled={true} // L'email ne peut pas être modifié
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="rounded-lg bg-gray-100"
                style={{ minHeight: '120px' }}
                disabled={true} // La description ne peut pas être modifiée
              />
            </Form.Group>

            <div className="flex justify-end mt-6">
              <Button 
                variant="secondary"
                className="text-gray-600 mr-3 rounded-lg px-4 py-2"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                variant="primary"
                style={{ backgroundColor: '#FF8C38', borderColor: '#FF8C38' }}
                className="text-white border-0 rounded-lg px-6 py-2" 
                type="submit"
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

export default EditAgencyForm; 