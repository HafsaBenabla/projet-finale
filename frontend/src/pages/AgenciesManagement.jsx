import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaArrowLeft, FaEdit, FaTrash, FaSpinner, FaStar, FaStarHalfAlt, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { Form, Button, Row, Col } from 'react-bootstrap';
import ImageUploader from '../components/ImageUploader';

const AgenciesManagement = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // États pour le formulaire d'agence
  const [agencyData, setAgencyData] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    stars: '0',
    image: ''
  });
  const [formError, setFormError] = useState(null);
  
  const navigate = useNavigate();

  // Liste des villes disponibles
  const availableCities = [
    "Agadir",
    "Al Hoceima",
    "Asilah",
    "Azrou",
    "Béni Mellal",
    "Casablanca",
    "Chefchaouen",
    "Dakhla",
    "El Jadida",
    "Errachidia",
    "Essaouira",
    "Fès",
    "Ifrane",
    "Kénitra",
    "Larache",
    "Marrakech",
    "Meknès",
    "Merzouga",
    "Mohammedia",
    "Nador",
    "Ouarzazate",
    "Oujda",
    "Rabat",
    "Safi",
    "Salé",
    "Tanger",
    "Taroudant",
    "Tétouan",
    "Zagora"
  ].sort();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        console.log('Tentative de récupération des agences...');
        
        // Utiliser axios pour plus de fiabilité
        const response = await axios.get('http://localhost:5000/api/agencies', {
          headers: { 'Accept': 'application/json' },
          timeout: 10000 // 10 secondes de timeout
        });
        
        console.log('Statut de la réponse:', response.status);
        console.log('Données reçues:', response.data);
        
        // Si les données sont disponibles
        const data = response.data;
        console.log('Nombre d\'agences:', Array.isArray(data) ? data.length : 'Non disponible (pas un tableau)');
        
        // Si les données ne sont pas dans le format attendu
        if (!Array.isArray(data)) {
          console.error('Les données reçues ne sont pas un tableau:', data);
          // Si c'est un objet avec une propriété qui pourrait contenir le tableau d'agences
          if (data && typeof data === 'object') {
            const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              console.log('Utilisation d\'un tableau trouvé dans l\'objet réponse:', possibleArrays[0]);
              setAgencies(possibleArrays[0]);
              return;
            }
          }
          setAgencies([]); // Définir un tableau vide au lieu de lancer une erreur
        } else {
          setAgencies(data);
        }
      } catch (err) {
        console.error('Erreur détaillée:', err);
        
        // Message d'erreur plus utile
        if (err.code === 'ECONNABORTED') {
          setError('La connexion au serveur a pris trop de temps. Vérifiez que le serveur est bien démarré et répond rapidement.');
        } else if (err.code === 'ERR_NETWORK') {
          setError('Erreur réseau. Vérifiez votre connexion et que le serveur est démarré sur http://localhost:5000');
        } else {
          setError(`Erreur: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, [refreshTrigger]);

  const handleEdit = (agencyId) => {
    navigate(`/admin/agencies/edit/${agencyId}`);
  };

  const handleDelete = (agencyId) => {
    setAgencyToDelete(agencyId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/agencies/${agencyToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'agence');
      }

      setRefreshTrigger(prev => prev + 1);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Erreur de suppression:', error);
    }
  };

  // Gestionnaires pour le formulaire d'agence
  const handleAgencyChange = (e) => {
    setAgencyData({ ...agencyData, [e.target.name]: e.target.value });
  };

  const handleAgencyImageUpload = (imageUrl) => {
    setAgencyData(prev => ({
      ...prev,
      image: imageUrl
    }));
  };

  const handleAgencySubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (!agencyData.image) {
        setFormError('Veuillez uploader une image pour l\'agence');
        return;
      }

      // Validation des données
      if (!agencyData.stars || agencyData.stars === '0') {
        throw new Error("Veuillez sélectionner le nombre d'étoiles");
      }
      
      // Conversion des étoiles en nombre et préparation des données
      const formData = {
        ...agencyData,
        stars: parseFloat(agencyData.stars)
      };
      
      console.log('Envoi des données agence:', formData);
      const response = await axios.post('http://localhost:5000/api/agencies', formData);
      
      // Vérification du type de contenu
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La réponse du serveur n\'est pas au format JSON');
      }

      console.log('Réponse agence:', response.data);
      
      if (response.data.agency || response.data) {
        const savedAgency = response.data.agency || response.data;
        console.log('Agence sauvegardée avec succès:', savedAgency);
        alert('Agence ajoutée avec succès!');
        
        // Réinitialiser le formulaire
        setAgencyData({
          name: '',
          address: '',
          city: '',
          phone: '',
          email: '',
          description: '',
          stars: '0',
          image: ''
        });
        
        // Fermer le formulaire et rafraîchir la liste
        setShowAddForm(false);
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error('Erreur lors de la sauvegarde de l\'agence');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      let errorMessage = 'Erreur lors de l\'ajout de l\'agence';
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état non-2xx
        if (error.response.headers['content-type']?.includes('application/json')) {
          errorMessage = error.response.data.message || errorMessage;
        } else {
          errorMessage = 'Le serveur a retourné une réponse invalide';
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = 'Impossible de contacter le serveur';
      }
      
      setFormError(errorMessage);
      alert(errorMessage);
    }
  };

  // Fonction pour rendre les étoiles en fonction de la note
  const renderStars = (stars) => {
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex text-yellow-500">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} />
        ))}
        {hasHalfStar && <FaStarHalfAlt />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaStar key={`empty-${i}`} className="text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Formulaire d'ajout d'agence */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
            <button 
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={20} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter une nouvelle agence</h2>
            
            {formError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}
            
            <Form onSubmit={handleAgencySubmit}>
              {/* Image en premier */}
              <div className="mb-5">
                <Form.Label className="font-medium mb-2 block">Image de l'agence</Form.Label>
                <ImageUploader onImageUpload={handleAgencyImageUpload} />
              </div>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Nom de l'agence</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={agencyData.name}
                      onChange={handleAgencyChange}
                      required
                      className="rounded-lg"
                      placeholder="Entrez le nom de l'agence"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Ville</Form.Label>
                    <Form.Select
                      name="city"
                      value={agencyData.city}
                      onChange={handleAgencyChange}
                      required
                      className="rounded-lg"
                    >
                      <option value="">Sélectionnez une ville</option>
                      <option value="Toutes les villes du Maroc">Toutes les villes du Maroc</option>
                      <option disabled>──────────</option>
                      {availableCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Nombre d'étoiles</Form.Label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const currentValue = parseFloat(agencyData.stars);
                          if (currentValue > 1) {
                            setAgencyData({ ...agencyData, stars: (currentValue - 0.5).toString() });
                          }
                        }}
                        className="bg-sahara text-white px-3 py-1 rounded-l-lg"
                      >
                        -
                      </button>
                      <div
                        className="px-4 py-1 border-t border-b border-gray-300 min-w-[60px] text-center"
                      >
                        {agencyData.stars === '0' ? '-' : agencyData.stars}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentValue = parseFloat(agencyData.stars) || 0;
                          if (currentValue < 5) {
                            setAgencyData({ ...agencyData, stars: (currentValue + 0.5).toString() });
                          }
                        }}
                        className="bg-sahara text-white px-3 py-1 rounded-r-lg"
                      >
                        +
                      </button>
                      <div className="ml-3 text-yellow-500 flex">
                        {renderStars(parseFloat(agencyData.stars) || 0)}
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Adresse</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={agencyData.address}
                  onChange={handleAgencyChange}
                  required
                  className="rounded-lg"
                  placeholder="Adresse complète de l'agence"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Téléphone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={agencyData.phone}
                      onChange={handleAgencyChange}
                      required
                      className="rounded-lg"
                      placeholder="Numéro de téléphone"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={agencyData.email}
                      onChange={handleAgencyChange}
                      required
                      className="rounded-lg"
                      placeholder="Adresse email"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={agencyData.description}
                  onChange={handleAgencyChange}
                  required
                  className="rounded-lg"
                  placeholder="Description détaillée de l'agence"
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
                  Ajouter l'agence
                </Button>
              </div>
            </Form>
          </div>
        )}
        
        {/* Liste des agences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <FaArrowLeft size={18} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Gestion des Agences</h1>
            </div>
            
            <button 
              className="bg-sahara text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-sahara/90 transition-colors"
              onClick={() => setShowAddForm(true)}
            >
              <FaPlus />
              <span>Ajouter une agence</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-sahara text-3xl" />
              <p className="ml-2">Chargement des agences...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              <p className="font-bold">Erreur de chargement:</p>
              <p>{error}</p>
              <p className="mt-2">Vérifiez que votre serveur backend est bien démarré sur http://localhost:5000</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Debug info */}
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p>Nombre d'agences: <span className="font-semibold">{agencies.length}</span></p>
                  </div>
                  <button 
                    onClick={() => setRefreshTrigger(prev => prev + 1)} 
                    className="bg-sahara text-white px-3 py-1 rounded flex items-center text-sm"
                  >
                    <FaSpinner className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </button>
                </div>
              </div>
              
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Nom</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Ville</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Téléphone</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Note</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!agencies || agencies.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-4 px-6 text-center text-gray-500">
                        Aucune agence trouvée
                      </td>
                    </tr>
                  ) : (
                    agencies.map((agency) => (
                      <tr key={agency._id || 'unknown'} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{agency._id ? agency._id.substring(0, 8) + '...' : 'ID manquant'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{agency.name || 'Non spécifié'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{agency.city || 'Non spécifié'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{agency.email || 'Non spécifié'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{agency.phone || 'Non spécifié'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {renderStars(agency.stars || 0)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(agency._id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Modifier"
                              disabled={!agency._id}
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(agency._id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Supprimer"
                              disabled={!agency._id}
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
              Êtes-vous sûr de vouloir supprimer cette agence ? Cette action est irréversible.
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

export default AgenciesManagement; 