import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaCity, FaClock, FaUsers } from 'react-icons/fa';

const ActivitesHome = () => {
  const navigate = useNavigate();

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
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Travel Activities Card */}
          <div 
            className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer transform transition-all duration-500 hover:-translate-y-2"
            onClick={() => navigate('/activites-voyages')}
          >
            <div className="h-[400px]">
              <img 
                src="https://i.pinimg.com/736x/d2/10/d3/d210d3d08f6fe04cf4b7f7e78f71c9c9.jpg"
                alt="Activités de Voyage"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="absolute bottom-0 p-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <FaPlane className="text-2xl" />
                    <h3 className="text-2xl font-bold">Activités de Voyage</h3>
                  </div>
                  <p className="text-lg mb-6 opacity-90">
                    Découvrez nos circuits complets et activités organisées par nos agences de voyage partenaires
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
                      <FaClock /> Circuits de 2-8 jours
                    </span>
                    <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
                      <FaUsers /> Groupes organisés
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Local Activities Card */}
          <div 
            className="group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer transform transition-all duration-500 hover:-translate-y-2"
            onClick={() => navigate('/activites-locales')}
          >
            <div className="h-[400px]">
              <img 
                src="https://i.pinimg.com/736x/57/c6/fa/57c6fa9d423d3e67f6142598142c7d71.jpg"
                alt="Activités Locales"
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="absolute bottom-0 p-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <FaCity className="text-2xl" />
                    <h3 className="text-2xl font-bold">Activités Locales</h3>
                  </div>
                  <p className="text-lg mb-6 opacity-90">
                    Profitez d'activités organisées le weekend dans votre ville avec des créneaux horaires flexibles
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
                      <FaClock /> Créneaux de 2-4h
                    </span>
                    <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
                      <FaUsers /> Petits groupes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitesHome; 