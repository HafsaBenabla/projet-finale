import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaSpinner, FaTimes, FaSyncAlt } from 'react-icons/fa';
import axios from 'axios';
import { Form, Button, Row, Col } from 'react-bootstrap';
import ImageUploader from '../components/ImageUploader';
import EditVoyageForm from '../components/EditVoyageForm';
import { useVoyages } from '../context/VoyagesContext';

const VoyagesManagement = () => {
  const { refreshVoyages, clearCache } = useVoyages();
  const [voyages, setVoyages] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voyageToDelete, setVoyageToDelete] = useState(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState(null);
  const [currentVoyage, setCurrentVoyage] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

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
    notIncluded: [],
    hebergement: '',
    hebergementImage: ''
  });
  
  // Liste des villes disponibles
  const availableCities = [
    "Agadir", "Al Hoceima", "Asilah", "Azrou", "Béni Mellal", "Casablanca",
    "Chefchaouen", "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fès",
    "Ifrane", "Kénitra", "Larache", "Marrakech", "Meknès", "Merzouga",
    "Mohammedia", "Nador", "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé",
    "Tanger", "Tarazout", "Taroudant", "Tétouan", "Zagora"
  ].sort();
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVoyages = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/voyages');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des voyages');
        }
        const data = await response.json();
        setVoyages(data);
      } catch (err) {
        setError(err.message);
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoyages();
  }, [refreshTrigger]);

  // Récupérer la liste des agences pour le formulaire
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

  const handleEdit = (voyageId) => {
    // Trouver le voyage à éditer
    const voyageToEdit = voyages.find(v => v._id === voyageId);
    if (voyageToEdit) {
      console.log('Édition du voyage:', voyageToEdit);
      
      // Vérifier et traiter les URLs des images si nécessaire
      if (voyageToEdit.image && !voyageToEdit.image.startsWith('http')) {
        voyageToEdit.image = `http://localhost:5000${voyageToEdit.image}`;
      }
      
      if (voyageToEdit.hebergementImage && !voyageToEdit.hebergementImage.startsWith('http')) {
        voyageToEdit.hebergementImage = `http://localhost:5000${voyageToEdit.hebergementImage}`;
      }
      
      // Vérifier et formater les dates si elles existent
      console.log('Dates originales du voyage:', {
        departureDate: voyageToEdit.departureDate,
        returnDate: voyageToEdit.returnDate,
        departureType: typeof voyageToEdit.departureDate,
        returnType: typeof voyageToEdit.returnDate
      });
      
      // S'assurer que les dates sont des chaînes correctement formatées
      if (voyageToEdit.departureDate) {
        try {
          const departureDate = new Date(voyageToEdit.departureDate);
          if (!isNaN(departureDate.getTime())) {
            // Date valide, réassignation au format YYYY-MM-DD
            voyageToEdit.departureDate = departureDate.toISOString().split('T')[0];
          } else {
            console.error('Format de date de départ invalide:', voyageToEdit.departureDate);
          }
        } catch (err) {
          console.error('Erreur lors du traitement de la date de départ:', err);
        }
      }
      
      if (voyageToEdit.returnDate) {
        try {
          const returnDate = new Date(voyageToEdit.returnDate);
          if (!isNaN(returnDate.getTime())) {
            // Date valide, réassignation au format YYYY-MM-DD
            voyageToEdit.returnDate = returnDate.toISOString().split('T')[0];
          } else {
            console.error('Format de date de retour invalide:', voyageToEdit.returnDate);
          }
        } catch (err) {
          console.error('Erreur lors du traitement de la date de retour:', err);
        }
      }
      
      console.log('Dates formatées du voyage:', {
        departureDate: voyageToEdit.departureDate,
        returnDate: voyageToEdit.returnDate
      });
      
      setCurrentVoyage(voyageToEdit);
      setShowEditForm(true);
    } else {
      console.error('Voyage non trouvé:', voyageId);
      alert('Voyage non trouvé. Veuillez rafraîchir la page et réessayer.');
    }
  };

  const handleUpdateSuccess = (updatedVoyage) => {
    // Mettre à jour la liste des voyages après une édition réussie
    console.log('Voyage mis à jour avec succès:', updatedVoyage);
    alert('Voyage mis à jour avec succès!');
    
    // Forcer un rafraîchissement du contexte global pour mettre à jour toutes les cartes
    clearCache();
    
    // Rafraîchir la liste des voyages dans ce composant
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = (voyageId) => {
    setVoyageToDelete(voyageId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Vous devez être connecté pour supprimer un voyage');
        setShowDeleteConfirm(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/voyages/${voyageToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
        throw new Error(errorData.message || 'Erreur lors de la suppression du voyage');
      }
      
      // Forcer un rafraîchissement du contexte global pour mettre à jour toutes les cartes
      clearCache();

      // Mettre à jour la liste locale des voyages en supprimant le voyage
      setVoyages(prevVoyages => prevVoyages.filter(voyage => voyage._id !== voyageToDelete));
      
      // Incrémenter le déclencheur de rafraîchissement pour recharger les données
      setRefreshTrigger(prev => prev + 1);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Erreur de suppression:', error);
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  };

  // Gestionnaires pour le formulaire de voyage
  const handleVoyageChange = (e) => {
    setVoyageData({ ...voyageData, [e.target.name]: e.target.value });
  };

  const handleVoyageImageUpload = (imageUrl) => {
    setVoyageData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleHebergementImageUpload = (imageUrl) => {
    console.log('URL de l\'image d\'hébergement reçue :', imageUrl);
    
    setVoyageData(prev => ({
      ...prev,
      hebergementImage: imageUrl
    }));
    
    console.log('État mis à jour avec l\'image d\'hébergement :', imageUrl);
  };

  const handleVoyageSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (!voyageData.image) {
        setFormError('Veuillez uploader une image pour le voyage');
        return;
      }

      // Vérifier si l'agence est sélectionnée
      if (!voyageData.agence) {
        setFormError('Veuillez sélectionner une agence');
        return;
      }

      // Trouver l'objet agence complet à partir du nom sélectionné
      const selectedAgency = agencies.find(agency => agency.name === voyageData.agence);
      
      if (!selectedAgency) {
        setFormError('Agence introuvable, veuillez en sélectionner une autre');
        return;
      }

      // Créer une copie du payload pour éviter de modifier l'état directement
      const voyagePayload = {
        ...voyageData,
        price: Number(voyageData.price),
        duration: Number(voyageData.duration),
        availableSpots: Number(voyageData.availableSpots),
        agencyId: selectedAgency._id,
        agencyName: selectedAgency.name
      };

      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Vous devez être connecté pour ajouter un voyage");
      }

      const response = await axios.post('http://localhost:5000/api/voyages', voyagePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        // Réinitialiser le formulaire
        setVoyageData({
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
          notIncluded: [],
          hebergement: '',
          hebergementImage: ''
        });
        
        // Fermer le formulaire et rafraîchir la liste
        setShowAddForm(false);
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      let errorMessage = 'Erreur lors de l\'ajout du voyage';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
        } else if (error.response.headers['content-type']?.includes('application/json')) {
          errorMessage = error.response.data.message || errorMessage;
        } else {
          errorMessage = 'Le serveur a retourné une réponse invalide';
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur';
      }
      
      setFormError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
      
        {/* Formulaire d'édition de voyage */}
        {showEditForm && currentVoyage && (
          <EditVoyageForm 
            voyage={currentVoyage} 
            onClose={() => setShowEditForm(false)} 
            onUpdate={handleUpdateSuccess}
          />
        )}
      
        {/* Formulaire d'ajout de voyage */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un nouveau voyage</h2>
            
            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}
            
            <Form onSubmit={handleVoyageSubmit}>
              {/* Image en premier */}
              <div className="mb-5">
                <Form.Label className="font-medium mb-2 block">Image du voyage</Form.Label>
                <ImageUploader onImageUpload={handleVoyageImageUpload} />
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Titre du voyage</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={voyageData.title}
                      onChange={handleVoyageChange}
                      required
                      className="rounded-lg"
                      placeholder="Entrez le titre du voyage"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Agence organisatrice</Form.Label>
                    <Form.Select
                      name="agence"
                      value={voyageData.agence}
                      onChange={handleVoyageChange}
                      required
                      className="rounded-lg"
                    >
                      <option value="">Sélectionnez une agence</option>
                      {agencies.filter(agency => agency.type === 'voyage').map((agency) => (
                        <option key={agency._id} value={agency.name}>
                          {agency.name} - {agency.city === "Toutes les villes du Maroc" ? "Disponible dans toutes les villes" : `Disponible à ${agency.city}`}
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
                      value={voyageData.price}
                      onChange={handleVoyageChange}
                      required
                      className="rounded-lg"
                      placeholder="Prix en dirhams"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Durée (jours)</Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={voyageData.duration}
                      onChange={handleVoyageChange}
                      required
                      className="rounded-lg"
                      placeholder="Nombre de jours"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label>Places disponibles</Form.Label>
                    <Form.Control
                      type="number"
                      name="availableSpots"
                      value={voyageData.availableSpots}
                      onChange={handleVoyageChange}
                      required
                      className="rounded-lg"
                      placeholder="Nombre de places"
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
                      value={voyageData.destination}
                      onChange={handleVoyageChange}
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
                      value={voyageData.hebergement}
                      onChange={handleVoyageChange}
                      className="rounded-lg"
                      placeholder="Nom et type d'hébergement (ex: Hôtel Atlas 5*, Riad traditionnel)"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Image de l'hébergement</Form.Label>
                    <ImageUploader onImageUpload={handleHebergementImageUpload} />
                    <Form.Text className="text-muted">
                      Cette image sera affichée dans la section "Hébergements de Luxe" sur la page d'accueil.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Date de départ</Form.Label>
                    <Form.Control
                      type="date"
                      name="departureDate"
                      value={voyageData.departureDate}
                      onChange={handleVoyageChange}
                      className="rounded-lg"
                    />
                    <Form.Text className="text-muted">
                      {voyageData.departureDate ? 
                        `Date sélectionnée: ${new Date(voyageData.departureDate).toLocaleDateString('fr-FR')}` : 
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
                      value={voyageData.returnDate}
                      onChange={handleVoyageChange}
                      className="rounded-lg"
                    />
                    <Form.Text className="text-muted">
                      {voyageData.returnDate ? 
                        `Date sélectionnée: ${new Date(voyageData.returnDate).toLocaleDateString('fr-FR')}` : 
                        "Format: AAAA-MM-JJ"}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Description détaillée</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={voyageData.description}
                  onChange={handleVoyageChange}
                  required
                  className="rounded-lg"
                  placeholder="Description détaillée du voyage, programme, activités incluses, etc."
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
                  Ajouter le voyage
                </Button>
              </div>
            </Form>
          </div>
        )}
        
        {/* Liste des voyages */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <FaArrowLeft size={18} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des Voyages</h1>
            </div>
            
            <button 
              className="bg-sahara text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-sahara/90 transition-colors"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              <span>Ajouter un voyage</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-sahara text-3xl" />
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              <p className="font-bold mb-2">Erreur de chargement:</p>
              <p>{error}</p>
              <div className="mt-3">
                <button 
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }}
                  className="bg-sahara text-white px-3 py-1 rounded text-sm hover:bg-sahara/90"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p>Nombre de voyages: <span className="font-semibold">{voyages.length}</span></p>
                  </div>
                  <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="flex items-center bg-sahara hover:bg-sahara/90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FaSyncAlt className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                  </button>
                </div>
              </div>
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Titre</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Destination</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Prix (DH)</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Durée</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Places</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {voyages.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-4 px-6 text-center text-gray-500">
                        Aucun voyage trouvé
                      </td>
                    </tr>
                  ) : (
                    voyages.map((voyage) => (
                      <tr key={voyage._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{voyage._id?.substring(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{voyage.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{voyage.destination}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{voyage.price?.toLocaleString()} DH</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{voyage.duration} jours</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{voyage.availableSpots || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(voyage._id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Modifier"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(voyage._id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Supprimer"
                            >
                              <FaTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
            <p className="mb-6 text-gray-600">
              Êtes-vous sûr de vouloir supprimer ce voyage ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

export default VoyagesManagement; 