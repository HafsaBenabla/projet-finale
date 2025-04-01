import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

const ActivitiesTable = ({ onEdit, onDelete }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('Tentative de récupération des activités...');
        const response = await fetch('http://localhost:5000/api/activities');
        
        console.log('Statut de la réponse:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des activités (${response.status}): ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Nombre d\'activités récupérées:', Array.isArray(data) ? data.length : 'Format inattendu');
        setActivities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur détaillée:', err);
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:5000');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <FaSpinner className="animate-spin text-sahara text-3xl" />
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">ID</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Titre</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Ville</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Prix (DH)</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Durée</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {activities.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-4 px-6 text-center text-gray-500">
                Aucune activité trouvée
              </td>
            </tr>
          ) : (
            activities.map((activity) => (
              <tr key={activity._id || activity.id || 'unknown'} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{activity._id || activity.id || 'ID manquant'}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{activity.name || activity.title || 'Sans titre'}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{activity.city || 'Non spécifié'}</td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  {activity.price ? Number(activity.price).toLocaleString() : '0'} DH
                </td>
                <td className="py-3 px-4 text-sm text-gray-900">{activity.duration || '0'} heures</td>
                <td className="py-3 px-4 text-sm text-gray-900">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onEdit(activity)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Modifier"
                      disabled={!activity._id && !activity.id}
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(activity._id || activity.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Supprimer"
                      disabled={!activity._id && !activity.id}
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
  );
};

export default ActivitiesTable; 