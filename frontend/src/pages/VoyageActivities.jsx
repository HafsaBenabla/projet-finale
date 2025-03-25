import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaMoneyBillWave, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const VoyageActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/activities/voyage');
        setActivities(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-sahara border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Activités de Voyage</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez nos activités exclusives sélectionnées pour enrichir votre expérience de voyage
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity) => (
            <div key={activity._id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48">
                <img
                  src={activity.image || "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-sahara text-white px-3 py-1 rounded-full text-sm">
                  Activité de voyage
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{activity.name}</h3>
                <p className="text-gray-600 mb-4">{activity.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-sahara" />
                    <span>{activity.city}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaClock className="mr-2 text-sahara" />
                    <span>{activity.duration} heures</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaUsers className="mr-2 text-sahara" />
                    <span>Max {activity.maxParticipants} personnes</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaMoneyBillWave className="mr-2 text-sahara" />
                    <span>{activity.price} MAD</span>
                  </div>
                </div>

                <button className="mt-6 w-full bg-sahara text-white py-3 rounded-lg hover:bg-sahara/90 transition-colors">
                  Réserver cette activité
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoyageActivities; 