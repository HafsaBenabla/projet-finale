import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

const ActivitiesTable = ({ activities, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) {
    return (
      <div className="text-center py-4">
        <FaSpinner className="animate-spin inline-block text-2xl text-sahara" />
        <p className="mt-2 text-gray-600">Chargement des activités...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600">
        <p>Aucune activité trouvée.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.map((activity) => (
            <tr key={activity._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img 
                  src={activity.image.startsWith('http') ? activity.image : `http://localhost:5000${activity.image}`}
                  alt={activity.name}
                  className="h-16 w-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Image+non+disponible";
                  }}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{activity.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  activity.type === 'locale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activity.type === 'locale' ? 'Locale' : 'Voyage'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.city}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.price} DH
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(activity)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Modifier"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => onDelete(activity._id)}
                  className="text-red-600 hover:text-red-900"
                  title="Supprimer"
                >
                  <FaTrash size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivitiesTable; 