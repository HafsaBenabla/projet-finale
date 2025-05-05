import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ImageUploader from './ImageUploader';
import { Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useVoyages } from '../context/VoyagesContext';

const EditVoyageForm = ({ voyage, onClose, onUpdate }) => {
  const { updateVoyageInContext, clearCache } = useVoyages();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    destination: '',
    duration: '',
    image: '',
    agencyId: '',
    agencyName: '',
    availableSpots: '',
    maxPlaces: '',
    hebergement: '',
    hebergementImage: '',
    departureDate: '',
    returnDate: '',
    inclusions: [],
    programme: []
  });
  
  const [agencies, setAgencies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Liste des villes disponibles
  const availableCities = [
    "Agadir", "Al Hoceima", "Asilah", "Azrou", "Béni Mellal", "Casablanca",
    "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fès",
    "Ifrane", "Kénitra", "Larache", "Marrakech", "Meknès", "Merzouga",
    "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé",
    "Tanger", "Taghazout", "Taroudant", "Tétouan", "Zagora"
  ].sort();

  // Charger les agences
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

  useEffect(() => {
    if (voyage) {
      console.log("Données reçues pour édition:", voyage);
      // Formatage des dates pour l'affichage dans le formulaire
      let formattedDepartureDate = '';
      let formattedReturnDate = '';
      
      // Vérifier si departureDate existe et le formater correctement
      if (voyage.departureDate) {
        try {
          // Tentative de formatage de la date
          const departureDate = new Date(voyage.departureDate);
          // Vérifier si la date est valide
          if (!isNaN(departureDate.getTime())) {
            formattedDepartureDate = departureDate.toISOString().split('T')[0];
            console.log("Date de départ formatée:", formattedDepartureDate);
          } else {
            console.error("Date de départ invalide:", voyage.departureDate);
          }
        } catch (error) {
          console.error("Erreur lors du formatage de la date de départ:", error);
        }
      }
      
      // Vérifier si returnDate existe et le formater correctement
      if (voyage.returnDate) {
        try {
          // Tentative de formatage de la date
          const returnDate = new Date(voyage.returnDate);
          // Vérifier si la date est valide
          if (!isNaN(returnDate.getTime())) {
            formattedReturnDate = returnDate.toISOString().split('T')[0];
            console.log("Date de retour formatée:", formattedReturnDate);
          } else {
            console.error("Date de retour invalide:", voyage.returnDate);
          }
        } catch (error) {
          console.error("Erreur lors du formatage de la date de retour:", error);
        }
      }
      
      setFormData({
        title: voyage.title || '',
        description: voyage.description || '',
        destination: voyage.destination || '',
        price: voyage.price?.toString() || '',
        duration: voyage.duration?.toString() || '',
        image: voyage.image || '',
        agencyId: voyage.agencyId || '',
        agencyName: voyage.agencyName || '',
        availableSpots: voyage.availableSpots?.toString() || '',
        maxPlaces: voyage.maxPlaces?.toString() || '',
        hebergement: voyage.hebergement || '',
        hebergementImage: voyage.hebergementImage || '',
        departureDate: formattedDepartureDate,
        returnDate: formattedReturnDate,
        inclusions: voyage.inclusions || [],
        programme: voyage.programme || []
      });
      
      // Logs supplémentaires pour vérifier les dates
      console.log("Dates d'origine:", {
        departureDate: voyage.departureDate,
        returnDate: voyage.returnDate
      });
      
      console.log("Dates formatées:", {
        departureDate: formattedDepartureDate,
        returnDate: formattedReturnDate
      });
    }
  }, [voyage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Modification du champ ${name}:`, {
      ancienneValeur: formData[name],
      nouvelleValeur: value
    });
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Nouveau state:', newData);
      return newData;
    });
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleHebergementImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      hebergementImage: imageUrl
    }));
  };

  const handleAgencyChange = (e) => {
    const selectedAgency = agencies.find(agency => agency._id === e.target.value);
    if (selectedAgency) {
      setFormData(prev => ({
        ...prev,
        agencyId: selectedAgency._id,
        agencyName: selectedAgency.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convertir explicitement en nombre entier avec parseInt
      const availableSpotsValue = parseInt(formData.availableSpots, 10);
      console.log('Valeur des places disponibles avant envoi:', {
        valeurBrute: formData.availableSpots,
        valeurConvertie: availableSpotsValue
      });

      const voyagePayload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        destination: formData.destination,
        duration: Number(formData.duration),
        image: formData.image,
        agencyId: formData.agencyId,
        agencyName: formData.agencyName,
        availableSpots: availableSpotsValue, // Utiliser la valeur convertie
        maxPlaces: Number(formData.maxPlaces),
        hebergement: formData.hebergement,
        hebergementImage: formData.hebergementImage,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        inclusions: formData.inclusions,
        programme: formData.programme
      };

      console.log('Données envoyées au serveur:', voyagePayload);

      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Vous devez être connecté pour modifier un voyage");
      }

      const response = await axios.put(
        `http://localhost:5000/api/voyages/${voyage._id}`,
        voyagePayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Réponse du serveur:', response.data);
      updateVoyageInContext(response.data);
      clearCache();
      onUpdate(response.data);
      onClose();
    } catch (err) {
      console.error('Erreur lors de la modification:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du voyage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Modifier le voyage</h2>
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
              Les données du voyage sont chargées. Vous pouvez maintenant les modifier.
            </div>
          )}
          
          <Form onSubmit={handleSubmit}>
            {/* Image principale */}
            <div className="mb-5">
              <Form.Label className="font-medium mb-2 block">Image principale</Form.Label>
              {formData.image && (
                <div className="mb-3 border rounded p-2">
                  <img 
                    src={formData.image} 
                    alt="Voyage" 
                    className="h-40 object-cover rounded-lg w-full" 
                    onError={(e) => {
                      console.error("Erreur de chargement d'image principale:", formData.image);
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
                <Form.Group className="mb-4">
                  <Form.Label>Titre du voyage</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Agence organisatrice</Form.Label>
                  <Form.Select
                    name="agencyId"
                    value={formData.agencyId}
                    onChange={handleAgencyChange}
                    required
                    className="rounded-lg"
                  >
                    <option value="">Sélectionnez une agence</option>
                    {agencies.map((agency) => (
                      <option key={agency._id} value={agency._id}>
                        {agency.name} ({agency.city})
                      </option>
                    ))}
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
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-4">
                  <Form.Label>Durée (jours)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-4">
                  <Form.Label>Places disponibles</Form.Label>
                  <Form.Control
                    type="number"
                    name="availableSpots"
                    value={formData.availableSpots}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log('Modification des places disponibles:', {
                        valeurPrecedente: formData.availableSpots,
                        nouvelleValeur: newValue,
                        type: typeof newValue
                      });
                      setFormData(prev => ({
                        ...prev,
                        availableSpots: newValue
                      }));
                    }}
                    required
                    min="0"
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Destination</Form.Label>
                  <Form.Select
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  >
                    <option value="">Sélectionnez une destination</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Hébergement</Form.Label>
                  <Form.Control
                    type="text"
                    name="hebergement"
                    value={formData.hebergement}
                    onChange={handleChange}
                    className="rounded-lg"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Image de l'hébergement */}
            <div className="mb-5">
              <Form.Label className="font-medium mb-2 block">Image de l'hébergement</Form.Label>
              {formData.hebergementImage && (
                <div className="mb-3 border rounded p-2">
                  <img 
                    src={formData.hebergementImage} 
                    alt="Hébergement" 
                    className="h-40 object-cover rounded-lg w-full" 
                    onError={(e) => {
                      console.error("Erreur de chargement d'image d'hébergement:", formData.hebergementImage);
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x250?text=Image+d'hébergement+non+disponible";
                    }}
                  />
                </div>
              )}
              <ImageUploader onImageUpload={handleHebergementImageUpload} />
            </div>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Date de départ</Form.Label>
                  <Form.Control
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleChange}
                    className="rounded-lg"
                  />
                  <Form.Text className="text-muted">
                    {formData.departureDate ? 
                      `Date sélectionnée: ${new Date(formData.departureDate).toLocaleDateString('fr-FR')}` : 
                      "Format: AAAA-MM-JJ"}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label>Date de retour</Form.Label>
                  <Form.Control
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleChange}
                    className="rounded-lg"
                  />
                  <Form.Text className="text-muted">
                    {formData.returnDate ? 
                      `Date sélectionnée: ${new Date(formData.returnDate).toLocaleDateString('fr-FR')}` : 
                      "Format: AAAA-MM-JJ"}
                  </Form.Text>
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
                className="rounded-lg"
                style={{ minHeight: '120px' }}
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

export default EditVoyageForm; 