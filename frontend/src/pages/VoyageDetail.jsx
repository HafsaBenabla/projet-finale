import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMoneyBillWave, FaMapMarkerAlt, FaClock, FaUtensils, FaBed, FaCar } from 'react-icons/fa';
import { useVoyages } from '../context/VoyagesContext';

const VoyageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const voyages = useVoyages();
  const voyage = voyages.find(v => v.id === parseInt(id));

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    nombrePersonnes: 1,
    dateDepart: '',
    commentaires: ''
  });

  // Rediriger si le voyage n'existe pas
  if (!voyage) {
    navigate('/voyages');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, ajoutez la logique pour traiter la réservation
    console.log('Données de réservation:', { ...formData, voyageId: voyage.id, voyageTitle: voyage.title });
    alert('Réservation envoyée avec succès!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="relative h-96">
        <img 
          src={voyage.image} 
          alt={voyage.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{voyage.title}</h1>
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt />
                {voyage.destination}
              </span>
              <span className="flex items-center gap-2">
                <FaClock />
                {voyage.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{voyage.description}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Programme du voyage</h2>
              <div className="space-y-4">
                {voyage.programme.map((jour, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-sahara text-white rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                    <p className="text-gray-600">{jour}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Ce qui est inclus</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {voyage.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-600">
                    <div className="w-2 h-2 bg-sahara rounded-full"></div>
                    {inclusion}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire de réservation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Réserver ce voyage</h2>
              
              <div className="flex items-center justify-between mb-6 p-4 bg-sahara/10 rounded-lg">
                <div className="text-sahara">
                  <div className="text-sm">Prix par personne</div>
                  <div className="text-2xl font-bold">{voyage.price.toLocaleString()} MAD</div>
                </div>
                <div className="text-gray-600">
                  <div className="text-sm">Places disponibles</div>
                  <div className="text-xl font-semibold text-center">{voyage.maxPlaces}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Nombre de personnes</label>
                  <input
                    type="number"
                    name="nombrePersonnes"
                    value={formData.nombrePersonnes}
                    onChange={handleInputChange}
                    min="1"
                    max={voyage.maxPlaces}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Date de départ souhaitée</label>
                  <input
                    type="date"
                    name="dateDepart"
                    value={formData.dateDepart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Commentaires ou questions</label>
                  <textarea
                    name="commentaires"
                    value={formData.commentaires}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-sahara text-white py-3 rounded-lg font-semibold hover:bg-sahara/90 transition-colors focus:outline-none focus:ring-2 focus:ring-sahara focus:ring-offset-2"
                >
                  Réserver maintenant
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageDetail;
