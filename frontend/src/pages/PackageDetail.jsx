import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaHotel, FaClock, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

const PackageDetail = () => {
  const { id } = useParams();
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [packageData, setPackageData] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    numberOfPersons: 1
  });
  const [reservationStatus, setReservationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch voyage data
  const fetchVoyageData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/voyages/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPackageData(data);
      } else {
        setReservationStatus({
          type: 'error',
          message: 'Erreur lors du chargement du voyage'
        });
      }
    } catch (error) {
      setReservationStatus({
        type: 'error',
        message: 'Erreur de connexion au serveur'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyageData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voyageId: id,
          ...formData
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setReservationStatus({
          type: 'success',
          message: 'Réservation effectuée avec succès!'
        });
        // Refresh voyage data to get updated available spots
        fetchVoyageData();
        setShowReservationForm(false);
      } else {
        setReservationStatus({
          type: 'error',
          message: data.message || 'Erreur lors de la réservation'
        });
      }
    } catch (error) {
      setReservationStatus({
        type: 'error',
        message: 'Erreur de connexion au serveur'
      });
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!packageData) {
    return <div>Voyage non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="relative h-[60vh]">
        <img 
          src={packageData.image}
          alt={packageData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="container mx-auto px-4">
            <div className="text-white max-w-3xl">
              <h1 className="text-5xl font-bold mb-4">{packageData.name}</h1>
              <p className="text-2xl mb-6">Par {packageData.agencyName}</p>
              <div className="flex flex-wrap items-center gap-6 text-lg">
                <span className="flex items-center gap-2.5 text-xl">
                  <FaClock className="text-xl" />
                  {formatDuration(packageData.duration)}
                </span>
                <span className="flex items-center gap-2.5 text-xl">
                  <FaMoneyBillWave className="text-xl" />
                  {packageData.price.toLocaleString()} DH
                </span>
                <span className="flex items-center gap-2.5 text-xl">
                  <FaMapMarkerAlt className="text-xl" />
                  {packageData.destination}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{packageData.description}</p>
            </div>

            {/* Itinéraire */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Itinéraire</h2>
              <div className="space-y-6">
                {packageData.itinerary.map((day) => (
                  <div key={day.day} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-sahara text-white rounded-full flex items-center justify-center font-bold">
                      J{day.day}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{day.title}</h3>
                      <p className="text-gray-600">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prix et Réservation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-primary">{packageData.price} DH</p>
                <p className="text-gray-600">par personne</p>
              </div>
              
              {!showReservationForm ? (
                <button
                  onClick={() => setShowReservationForm(true)}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition duration-300"
                >
                  Réserver maintenant
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre de personnes</label>
                    <input
                      type="number"
                      name="numberOfPersons"
                      value={formData.numberOfPersons}
                      onChange={handleInputChange}
                      min="1"
                      max={packageData.maxParticipants}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition duration-300"
                    >
                      Confirmer la réservation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReservationForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {reservationStatus && (
                <div className={`mt-4 p-3 rounded ${
                  reservationStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {reservationStatus.message}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <p className="flex items-center text-gray-600">
                  <FaUsers className="mr-2" />
                  Places disponibles: {packageData.maxParticipants}
                </p>
                <p className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  {packageData.duration}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetail;