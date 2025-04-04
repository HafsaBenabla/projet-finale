import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaSearch, FaFilter, FaSyncAlt, FaTrash, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const ReservationsManagement = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    checkAdminStatus();
    fetchReservations();
  }, []);

  // Vérifier si l'utilisateur est un administrateur
  const checkAdminStatus = async () => {
    try {
      // Variable pour forcer l'accès admin (pour le débogage)
      let forceAdminAccess = localStorage.getItem('forceAdminAccess') === 'true';
      
      const token = localStorage.getItem('token');
      console.log('Token récupéré:', token ? 'Token présent' : 'Token absent');
      console.log('Force admin access:', forceAdminAccess);
      
      if (!token && !forceAdminAccess) {
        alert('Vous devez être connecté pour accéder à cette page');
        navigate('/');
        return;
      }

      // Si le mode forcé est activé, on permet l'accès
      if (forceAdminAccess) {
        console.log('Accès administrateur forcé activé, vérification du token ignorée');
        return;
      }

      console.log('Vérification du token auprès du serveur...');
      const response = await fetch('http://localhost:5000/api/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification du token: ${response.status}`);
      }

      const data = await response.json();
      
      const userRole = data.user?.role || '';
      const userEmail = data.user?.email || '';
      const adminEmail = 'benablahafsa@gmail.com';
      
      const isAdmin = userRole.toLowerCase() === 'admin';
      const isAdminEmail = userEmail.toLowerCase() === adminEmail.toLowerCase();
      
      const hasAdminAccess = isAdmin && isAdminEmail;
      
      if (!hasAdminAccess) {
        alert("Accès réservé à l'administrateur");
        navigate('/');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des droits admin:', error);
      alert(`Erreur d'authentification: ${error.message}`);
      navigate('/');
    }
  };

  // Fetch all reservations
  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté en tant qu\'administrateur');
      }

      const response = await axios.get('http://localhost:5000/api/reservations/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      setReservations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement des réservations');
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

      setConfirmCancel(null);
      alert('Réservation annulée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      alert(`Erreur: ${error.response?.data?.message || 'Une erreur est survenue'}`);
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
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-bold mb-2">Erreur de chargement:</p>
            <p>{error}</p>
            <div className="mt-3">
              <button 
                onClick={fetchReservations}
                className="bg-sahara text-white px-3 py-1 rounded text-sm hover:bg-sahara/90"
              >
                Réessayer
              </button>
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
              <h3 className="text-xl font-bold mb-4">Confirmer l'annulation</h3>
              <p className="mb-6 text-gray-600">
                Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmCancel(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleCancelReservation(confirmCancel)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
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