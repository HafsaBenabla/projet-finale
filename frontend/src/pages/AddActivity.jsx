import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

const AddActivity = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    price: '',
    image: '',
    maxParticipants: '',
    duration: '',
    type: 'locale',
    category: '',
  });
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    // Log the data being sent
    console.log('Sending data:', {
      ...formData,
      price: Number(formData.price),
      maxParticipants: Number(formData.maxParticipants),
      duration: Number(formData.duration)
    });

    try {
      const response = await fetch('http://localhost:5000/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          maxParticipants: Number(formData.maxParticipants),
          duration: Number(formData.duration)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de l\'activité');
      }

      alert('Activité ajoutée avec succès!');
      
      // Rediriger vers la page appropriée selon le type d'activité
      if (formData.type === 'locale') {
        navigate('/activites-locales');
      } else if (formData.type === 'voyage') {
        navigate('/activites-voyages');
      } else {
        navigate('/activities');
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Ajouter une nouvelle activité</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'activité
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image de l'activité
            </label>
            <ImageUploader onImageUpload={handleImageUpload} />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Aperçu de l'activité" 
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                required
              />
            </div>

            {/* Type d'activité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">
                Type d'activité
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                required
              >
                <option value="locale">Activité Locale</option>
                <option value="voyage">Activité de Voyage</option>
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
                Catégorie
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                <option value="culture">Culture</option>
                <option value="aventure">Aventure</option>
                <option value="gastronomie">Gastronomie</option>
                <option value="bien-etre">Bien-être</option>
                <option value="sport-sensations">Sport & Sensations</option>
                <option value="nature-aventure">Nature & Aventure</option>
              </select>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="city">
                Ville
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                required
              >
                <option value="">Sélectionnez une ville</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="price">
                Prix (MAD)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                required
              />
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="duration">
                Durée (heures)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                required
              />
            </div>

            {/* Nombre de places - uniquement pour les activités locales */}
            {formData.type === 'locale' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="maxParticipants">
                  Places disponibles
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => {
                if (formData.type === 'locale') {
                  navigate('/activites-locales');
                } else if (formData.type === 'voyage') {
                  navigate('/activites-voyages');
                } else {
                  navigate('/activities');
                }
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sahara focus:ring-offset-2"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-sahara text-white rounded-lg hover:bg-sahara/90 focus:outline-none focus:ring-2 focus:ring-sahara focus:ring-offset-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter l\'activité'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddActivity;
