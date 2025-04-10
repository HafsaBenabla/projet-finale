import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCalendarCheck, FaSearch, FaFilter, FaSyncAlt, FaTrash, FaArrowLeft, FaSpinner, FaCheckCircle, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useVoyages } from '../context/VoyagesContext';

const ReservationsManagement = () => {
  const navigate = useNavigate();
  const { refreshVoyages } = useVoyages();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    // La vérification d'administrateur est désormais gérée par le composant AdminRoute
    fetchReservations();
  }, []);

  // La fonction checkAdminStatus n'est plus nécessaire car gérée par AdminRoute

  // Fetch all reservations
  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté en tant qu\'administrateur');
      }

      // Vérifier la longueur du token
      if (token.length < 20) {
        console.error('Token trop court pour être valide:', token.length);
        throw new Error('Token invalide. Veuillez vous reconnecter.');
      }

      console.log('Tentative de récupération des réservations avec token:', token.substring(0, 10) + '...');

      const response = await axios.get('http://localhost:5000/api/reservations/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      console.log('Réponse du serveur:', response.status);
      setReservations(response.data);
    } catch (error) {
      console.error('Erreur détaillée lors du chargement des réservations:', error);
      
      // Si l'erreur est liée à l'authentification
      if (error.response?.status === 401) {
        localStorage.removeItem('token'); // Supprimer le token invalide
        setError('Token invalide ou expiré. Veuillez vous reconnecter.');
      } else {
        setError(error.response?.data?.message || error.message || 'Erreur lors du chargement des réservations');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cancel a reservation
  const handleCancelReservation = async (reservationId) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5000/api/reservations/admin/${reservationId}/cancel`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the reservations list
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res._id === reservationId 
            ? { ...res, statut: 'annulé', annulePar: 'admin', dateModification: new Date() } 
            : res
        )
      );

      // Rafraîchir les données des voyages pour mettre à jour les places disponibles partout
      refreshVoyages();

      setConfirmCancel(null);
      // Afficher le message de succès
      setSuccessMessage('Réservation annulée avec succès');
      
      // Faire disparaître automatiquement le message après 5 secondes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      setError(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue lors de l\'annulation'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort reservations
  const filteredReservations = reservations
    .filter(res => {
      // Apply search term filter
      const searchString = `${res.user?.name || ''} ${res.user?.email || ''} ${
        res.voyage?.title || ''} ${res.voyage?.destination || ''} ${
        res.activite?.name || ''} ${res.activite?.city || ''}`.toLowerCase();
      
      const matchesSearch = searchTerm === '' || searchString.includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || res.statut === statusFilter;
      
      // Apply type filter
      const matchesType = typeFilter === 'all' || res.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortOption) {
        case 'recent':
          return new Date(b.dateReservation) - new Date(a.dateReservation);
        case 'oldest':
          return new Date(a.dateReservation) - new Date(b.dateReservation);
        case 'priceHigh':
          const priceA = a.voyage?.price || a.activite?.price || 0;
          const priceB = b.voyage?.price || b.activite?.price || 0;
          return priceB - priceA;
        case 'priceLow':
          const priceALow = a.voyage?.price || a.activite?.price || 0;
          const priceBLow = b.voyage?.price || b.activite?.price || 0;
          return priceALow - priceBLow;
        default:
          return new Date(b.dateReservation) - new Date(a.dateReservation);
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Success Message - Non modal notification */}
        {successMessage && (
          <div className="fixed top-20 left-0 right-0 mx-auto w-full max-w-md z-50 transform transition-all duration-300 ease-in-out">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 shadow-lg rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button 
                      onClick={() => setSuccessMessage(null)}
                      className="inline-flex bg-green-100 rounded-md p-1.5 text-green-500 hover:bg-green-200 focus:outline-none"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <FaArrowLeft size={18} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                <FaCalendarCheck className="inline mr-2 text-sahara" />
                Gestion des Réservations
              </h1>
            </div>
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nom, email, destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par statut</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara focus:border-transparent appearance-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="confirmé">Confirmé</option>
                  <option value="en_attente">En attente</option>
                  <option value="annulé">Annulé</option>
                </select>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara focus:border-transparent appearance-none"
                >
                  <option value="all">Tous les types</option>
                  <option value="voyage">Voyages</option>
                  <option value="activite">Activités</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara focus:border-transparent appearance-none"
              >
                <option value="recent">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
                <option value="priceHigh">Prix décroissant</option>
                <option value="priceLow">Prix croissant</option>
              </select>
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={fetchReservations}
              disabled={loading}
              className="flex items-center space-x-2 bg-sahara hover:bg-sahara/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaSyncAlt className="mr-2" />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <FaSpinner className="animate-spin text-sahara text-3xl" />
            <span className="ml-2 text-gray-700">Chargement des réservations...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-6 rounded-lg mb-6">
            <p className="font-bold mb-2">Erreur de chargement:</p>
            <p className="mb-4">{error}</p>
            <div className="mt-3 flex space-x-4">
              <button 
                onClick={fetchReservations}
                className="bg-sahara text-white px-4 py-2 rounded hover:bg-sahara/90"
              >
                Réessayer
              </button>
              
              {error.includes('Token') && (
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Se reconnecter
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredReservations.length === 0 && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6">
            <p className="mb-0">Aucune réservation ne correspond à vos critères.</p>
          </div>
        )}

        {/* Reservations Table */}
        {!loading && !error && filteredReservations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-sahara">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Client</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Produit</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Type</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Personnes</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Prix Total</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Statut</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-4 px-6 text-center text-gray-500">
                        Aucune réservation trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation) => {
                      const productName = reservation.type === 'voyage' 
                        ? reservation.voyage?.title 
                        : reservation.activite?.name;
                      
                      const productLocation = reservation.type === 'voyage' 
                        ? reservation.voyage?.destination 
                        : reservation.activite?.city;
                      
                      const productPrice = reservation.type === 'voyage' 
                        ? reservation.voyage?.price 
                        : reservation.activite?.price || 0;
                      
                      const totalPrice = productPrice * reservation.nombrePersonnes;
                      
                      return (
                        <tr key={reservation._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {reservation._id.substring(0, 8)}...
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="text-gray-900">
                              {reservation.user?.name || 'Utilisateur inconnu'}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {reservation.user?.email || ''}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="font-medium text-gray-900">{productName || 'Produit inconnu'}</div>
                            <div className="text-gray-500 text-xs">{productLocation || ''}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {reservation.type === 'voyage' ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
                                Voyage
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 uppercase">
                                Activité
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(reservation.dateReservation).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 text-sm text-center text-gray-900">
                            {reservation.nombrePersonnes}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {totalPrice.toLocaleString('fr-FR')}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {reservation.statut === 'confirmé' ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Confirmé
                              </span>
                            ) : reservation.statut === 'en_attente' ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                En attente
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Annulé
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {reservation.statut !== 'annulé' ? (
                              <button
                                onClick={() => setConfirmCancel(reservation._id)}
                                disabled={loading}
                                className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                              >
                                <FaTrash className="mr-1" />
                                <span>Annuler</span>
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">
                                Annulée le {reservation.dateModification ? new Date(reservation.dateModification).toLocaleDateString('fr-FR') : 'N/A'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right text-sm text-gray-600">
              Total: {filteredReservations.length} réservation(s)
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
              <div className="flex items-center mb-4">
                <FaTrash className="text-red-500 mr-3 text-xl" />
                <h3 className="text-xl font-bold">Confirmer l'annulation</h3>
              </div>
              <p className="mb-6 text-gray-600">
                Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmCancel(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <FaTimes className="mr-2" />
                  Annuler
                </button>
                <button
                  onClick={() => handleCancelReservation(confirmCancel)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Confirmer l'annulation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsManagement; 