import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaUsers, FaTimes, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ReservationForm = ({ activity, onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [numberOfPersons, setNumberOfPersons] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: sélection créneau/date, 2: infos client

  // Informations du client
  const [clientInfo, setClientInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  // Filtrer les créneaux qui ont encore des places disponibles pour activités locales
  const availableTimeSlots = activity.timeSlots?.filter(slot => slot.availableSpots > 0) || [];
  
  // Vérifier si le nombre maximum est dépassé
  const isMaxParticipantsExceeded = numberOfPersons > activity.maxParticipants;
  
  // Pour les activités locales avec des créneaux horaires
  const isSlotCapacityExceeded = activity.type === 'locale' && selectedTimeSlot && numberOfPersons > selectedTimeSlot.availableSpots;
  
  // Pour les activités de voyage
  const isVoyageCapacityExceeded = activity.type === 'voyage' && numberOfPersons > activity.availableSpots;
  
  const isExceeded = isMaxParticipantsExceeded || isSlotCapacityExceeded || isVoyageCapacityExceeded;
  
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    
    // Réinitialiser le nombre de personnes si c'est plus que les spots disponibles
    if (numberOfPersons > timeSlot.availableSpots) {
      setNumberOfPersons(Math.min(timeSlot.availableSpots, activity.maxParticipants));
    }
  };

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const proceedToNextStep = (e) => {
    e.preventDefault();
    
    if (activity.type === 'locale' && !selectedTimeSlot) {
      setError('Veuillez sélectionner un créneau horaire.');
      return;
    }
    
    if (activity.type === 'voyage' && !selectedDate) {
      setError('Veuillez sélectionner une date de départ.');
      return;
    }
    
    if (isExceeded) {
      setError('Le nombre de personnes sélectionné dépasse la limite disponible.');
      return;
    }

    setError('');
    setStep(2);
  };

  const goBackToTimeSlot = () => {
    setStep(1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour réserver.');
      return;
    }

    // Validation des informations client
    if (!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientInfo.email)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }

    // Validation du téléphone (format international ou local marocain)
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{8,15}$/;
    if (!phoneRegex.test(clientInfo.phone.replace(/\s+/g, ''))) {
      setError('Veuillez entrer un numéro de téléphone valide.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      let response;
      
      // Différent endpoint selon le type d'activité
      if (activity.type === 'locale') {
        response = await axios.post(
          'http://localhost:5000/api/reservations/activity',
          {
            activityId: activity._id, 
            timeSlotId: selectedTimeSlot._id,
            nombrePersonnes: numberOfPersons,
            clientInfo: {
              firstName: clientInfo.firstName,
              lastName: clientInfo.lastName,
              email: clientInfo.email,
              phone: clientInfo.phone
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else if (activity.type === 'voyage') {
        response = await axios.post(
          'http://localhost:5000/api/reservations',
          {
            type: 'voyage',
            voyageId: activity._id,
            nombrePersonnes: numberOfPersons,
            departureDate: selectedDate,
            clientName: `${clientInfo.firstName} ${clientInfo.lastName}`,
            email: clientInfo.email,
            phone: clientInfo.phone
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      setSuccess(true);
      
      // Mettre à jour le nombre de places restantes
      if (onSuccess) {
        if (activity.type === 'locale') {
          onSuccess(selectedTimeSlot._id, numberOfPersons);
        } else if (activity.type === 'voyage') {
          onSuccess(numberOfPersons);
        }
      }
      
      // Fermer le formulaire après quelques secondes
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
      setError(err.response?.data?.message || 'Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation confirmée !</h2>
            <p className="text-gray-600 mb-2">
              Votre réservation pour {activity.name} a été effectuée avec succès.
            </p>
            <p className="text-gray-600 mb-6">
              Un email de confirmation a été envoyé à {clientInfo.email}.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-sahara text-white py-3 rounded-xl font-semibold hover:bg-sahara/90 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative my-8">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="text-xl" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Réserver {activity.name}</h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Indicateur d'étape */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 1 ? 'bg-sahara text-white' : 'bg-sahara/20 text-sahara'
          }`}>
            1
          </div>
          <div className={`h-1 w-16 ${step === 1 ? 'bg-gray-300' : 'bg-sahara'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            step === 2 ? 'bg-sahara text-white' : 'bg-sahara/20 text-sahara'
          }`}>
            2
          </div>
        </div>
        
        {step === 1 ? (
          <form onSubmit={proceedToNextStep}>
            {activity.type === 'locale' ? (
              /* Sélection du créneau pour activités locales */
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-sahara" />
                    Sélectionnez un créneau
                  </div>
                </label>
                
                {availableTimeSlots.length === 0 ? (
                  <div className="text-center py-4 border rounded-lg border-gray-200">
                    <p className="text-gray-500">Aucun créneau disponible pour cette activité.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableTimeSlots.map((timeSlot, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          selectedTimeSlot === timeSlot 
                            ? 'border-sahara bg-sahara/5' 
                            : 'border-gray-200 hover:border-sahara'
                        } cursor-pointer transition-colors`}
                        onClick={() => handleTimeSlotSelect(timeSlot)}
                      >
                        <div>
                          <div className="font-medium">
                            {formatDate(timeSlot.date)}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <FaClock className="text-sahara" />
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm ${timeSlot.availableSpots < 5 ? 'text-orange-600' : 'text-gray-600'}`}>
                            {timeSlot.availableSpots} places restantes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Sélection de la date pour activités de voyage */
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-sahara" />
                    Date de départ
                  </div>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className="mt-2 text-sm text-gray-600">
                  Places disponibles: {activity.availableSpots || 0}
                </div>
              </div>
            )}
            
            {/* Nombre de personnes */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-sahara" />
                  Nombre de personnes
                </div>
              </label>
              
              <div className="flex items-center">
                <button 
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-l-lg text-xl"
                  onClick={() => setNumberOfPersons(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <div className="px-6 py-2 border-t border-b border-gray-300 text-center min-w-[60px]">
                  {numberOfPersons}
                </div>
                <button 
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-r-lg text-xl"
                  onClick={() => {
                    if (activity.type === 'locale' && selectedTimeSlot) {
                      setNumberOfPersons(prev => Math.min(
                        Math.min(selectedTimeSlot.availableSpots, activity.maxParticipants),
                        prev + 1
                      ));
                    } else if (activity.type === 'voyage') {
                      setNumberOfPersons(prev => Math.min(
                        Math.min(activity.availableSpots, activity.maxParticipants),
                        prev + 1
                      ));
                    } else {
                      setNumberOfPersons(prev => Math.min(activity.maxParticipants, prev + 1));
                    }
                  }}
                >
                  +
                </button>
              </div>
              
              {isExceeded && (
                <p className="text-red-600 text-sm mt-2">
                  {isMaxParticipantsExceeded 
                    ? `Cette activité est limitée à ${activity.maxParticipants} personnes maximum.`
                    : activity.type === 'locale'
                      ? `Il ne reste que ${selectedTimeSlot?.availableSpots} places pour ce créneau.`
                      : `Il ne reste que ${activity.availableSpots} places pour cette activité.`
                  }
                </p>
              )}
              
              {activity.type === 'locale' && selectedTimeSlot && (
                <div className="mt-2 text-gray-600 text-sm">
                  Places restantes après réservation : {selectedTimeSlot.availableSpots - numberOfPersons}
                </div>
              )}
              
              {activity.type === 'voyage' && (
                <div className="mt-2 text-gray-600 text-sm">
                  Places restantes après réservation : {activity.availableSpots - numberOfPersons}
                </div>
              )}
            </div>
            
            {/* Prix total */}
            <div className="mb-6">
              <div className="bg-sahara/10 rounded-lg p-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Prix total</span>
                  <span className="text-sahara">{activity.price * numberOfPersons} DH</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {activity.price} DH x {numberOfPersons} {numberOfPersons > 1 ? 'personnes' : 'personne'}
                </div>
              </div>
            </div>
            
            {isSlotCapacityExceeded && (
              <p className="text-red-500 text-sm mt-1">
                Il ne reste que {selectedTimeSlot.availableSpots} places disponibles pour ce créneau.
              </p>
            )}
            {isVoyageCapacityExceeded && (
              <p className="text-red-500 text-sm mt-1">
                Il ne reste que {activity.availableSpots} places disponibles pour ce voyage.
              </p>
            )}
            
            <button 
              type="submit"
              disabled={(activity.type === 'locale' && (availableTimeSlots.length === 0 || !selectedTimeSlot)) || 
                (activity.type === 'voyage' && !selectedDate) || 
                isExceeded || 
                !isAuthenticated}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                (activity.type === 'locale' && (availableTimeSlots.length === 0 || !selectedTimeSlot)) || 
                (activity.type === 'voyage' && !selectedDate) || 
                isExceeded
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : !isAuthenticated
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-sahara text-white hover:bg-sahara/90'
              }`}
            >
              {!isAuthenticated ? 'Connectez-vous pour réserver' : 'Continuer'}
            </button>
            
            {!isAuthenticated && (
              <p className="text-sm text-center mt-4 text-red-600">
                Vous devez être connecté pour réserver.
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              {/* Détails du créneau sélectionné */}
              <div className="bg-sahara/5 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Récapitulatif</h3>
                {activity.type === 'locale' && selectedTimeSlot ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedTimeSlot.date)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Horaire:</span>
                      <span className="font-medium">{selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Date de départ:</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Nombre de personnes:</span>
                  <span className="font-medium">{numberOfPersons}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Prix total:</span>
                  <span className="font-semibold text-sahara">{activity.price * numberOfPersons} DH</span>
                </div>
              </div>

              {/* Informations du client */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Vos informations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-sahara text-xs" />
                        Prénom*
                      </div>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={clientInfo.firstName}
                      onChange={handleClientInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <div className="flex items-center gap-1">
                        <FaUser className="text-sahara text-xs" />
                        Nom*
                      </div>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={clientInfo.lastName}
                      onChange={handleClientInfoChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <FaEnvelope className="text-sahara text-xs" />
                    Email*
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={clientInfo.email}
                  onChange={handleClientInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-1">
                    <FaPhone className="text-sahara text-xs" />
                    Téléphone*
                  </div>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={clientInfo.phone}
                  onChange={handleClientInfoChange}
                  placeholder="+212 XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sahara"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={goBackToTimeSlot}
                className="flex-1 py-3 rounded-xl font-semibold border border-sahara text-sahara bg-white hover:bg-sahara/10 transition-colors"
              >
                Retour
              </button>
              <button 
                type="submit"
                disabled={loading || !isAuthenticated}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  loading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : !isAuthenticated
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-sahara text-white hover:bg-sahara/90'
                }`}
              >
                {loading 
                  ? 'Réservation en cours...' 
                  : !isAuthenticated 
                    ? 'Connectez-vous pour réserver'
                    : 'Confirmer la réservation'
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservationForm; 