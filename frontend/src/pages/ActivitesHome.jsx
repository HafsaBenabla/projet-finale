import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaCity, FaClock, FaUsers } from 'react-icons/fa';
import ActivityCategory from '../components/ActivityCategory';

const ActivitesHome = () => {
  const navigate = useNavigate();

  // Données pour les cartes d'activités
  const activities = [
    {
      icon: FaPlane,
      title: "Activités de Voyage",
      description: "Découvrez nos circuits complets et activités organisées par nos agences de voyage partenaires",
      image: "https://i.pinimg.com/474x/a6/f9/75/a6f97590acb7955f7511b7ff6fea51f7.jpg",
      tags: [
        { icon: <FaClock className="text-sahara text-xl" />, text: "Circuits de 2-8 jours" },
        { icon: <FaUsers className="text-sahara text-xl" />, text: "Groupes organisés" }
      ],
      onClick: () => navigate('/activites-voyages')
    },
    {
      icon: FaCity,
      title: "Activités Locales",
      description: "Profitez d'activités organisées le weekend dans votre ville avec des créneaux horaires flexibles",
      image: "https://i.pinimg.com/474x/fa/47/fa/fa47fa4e2da708641ef54c4c4732de4d.jpg",
      tags: [
        { icon: <FaClock className="text-sahara text-xl" />, text: "Créneaux de 2-4h" },
        { icon: <FaUsers className="text-sahara text-xl" />, text: "Petits groupes" }
      ],
      onClick: () => navigate('/activites-locales')
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Header */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Découvrez Nos Activités</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choisissez entre nos circuits de voyage organisés par nos agences partenaires ou nos activités locales pour profiter de votre ville le weekend
            </p>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {activities.map((activity, index) => (
            <ActivityCategory 
              key={index}
              {...activity}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitesHome; 