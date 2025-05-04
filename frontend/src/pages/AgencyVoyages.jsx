import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaClock, FaMoneyBillWave, FaMapMarkerAlt, FaSpinner, FaArrowLeft, FaStar, FaPhone, FaEnvelope, FaChevronRight, FaBed, FaConciergeBell, FaCompass } from 'react-icons/fa';

const AgencyVoyages = () => {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  
  const [voyages, setVoyages] = useState([]);
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgencyDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/agencies/${agencyId}`);
        if (!response.ok) {
          throw new Error('Agence non trouvée');
        }
        const data = await response.json();
        setAgency(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchAgencyVoyages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/voyages/by-agency/${agencyId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setVoyages([]);
          } else {
            throw new Error('Erreur lors de la récupération des voyages');
          }
        } else {
          const data = await response.json();
          setVoyages(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencyDetails();
    fetchAgencyVoyages();
  }, [agencyId]);

  const navigateToVoyageDetail = (voyageId) => {
    navigate(`/voyage/${voyageId}`);
  };

  const goBack = () => {
    navigate(-1);
  };

  // Fonction pour rendre les étoiles
  const renderStars = (starsCount) => {
    const stars = parseFloat(starsCount) || 0;
    const validStars = Math.min(Math.max(stars, 0), 5);
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar 
            key={star}
            className={`${star <= validStars ? 'text-yellow-400' : 'text-gray-300'} ${star - 0.5 === validStars ? 'opacity-70' : ''}`} 
            size={16}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-16 w-16 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin mb-5 shadow-md"></div>
          <p className="text-gray-600 font-light tracking-wide">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white p-10 shadow-lg rounded-lg">
          <h1 className="text-2xl font-light text-red-600 mb-4">Une erreur est survenue</h1>
          <p className="text-gray-700 mb-8 font-light">{error}</p>
          <button 
            onClick={goBack} 
            className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-xl hover:translate-y-[-2px] font-medium"
          >
            <FaArrowLeft className="mr-2" /> Retour à la page précédente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="w-full bg-white shadow-md mb-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button 
            onClick={goBack} 
            className="flex items-center text-gray-500 hover:text-orange-500 transition-colors text-sm font-medium group"
          >
            <FaArrowLeft className="mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" size={12} /> Retour
          </button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* En-tête avec infos de l'agence */}
        {agency && (
          <div className="mb-16">
            <div className="flex flex-col md:flex-row bg-white shadow-[0_15px_40px_rgba(8,_112,_184,_0.07)] overflow-hidden rounded-md border border-gray-100">
              <div className="relative w-full md:w-64 h-64 bg-white flex items-center justify-center p-8">
                <img 
                  src={agency.image}
                  alt={`Agence ${agency.name}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 p-8 relative">
                <h1 className="text-3xl font-light tracking-wide mb-4 text-gray-800">{agency.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-gray-600 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
                    <FaMapMarkerAlt className="mr-2" size={12} />
                    <span className="font-light tracking-wider">{agency.city}</span>
                  </div>
                  <div className="ml-4 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                    {renderStars(agency.stars)}
                  </div>
                </div>
                {agency.description && (
                  <p className="text-gray-600 italic">{agency.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Liste des voyages */}
        {voyages.length === 0 ? (
          <div className="bg-white p-16 shadow-[0_15px_40px_rgba(8,_112,_184,_0.07)] text-center max-w-2xl mx-auto rounded-md border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-50 to-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-orange-100/50">
              <FaCalendarAlt className="text-orange-400" size={30} />
            </div>
            <h3 className="text-2xl font-light text-gray-600 mb-4">Aucun voyage disponible</h3>
            <p className="text-gray-400 font-light max-w-md mx-auto mb-10">
              Cette agence n'a pas encore publié d'offres de voyage. Revenez ultérieurement pour découvrir ses futures destinations.
            </p>
            <button 
              onClick={goBack} 
              className="inline-flex items-center bg-orange-500 text-white px-8 py-3 rounded-lg shadow-sm hover:shadow-md font-light text-sm hover:bg-orange-600 transition-all border border-orange-600/50 tracking-widest uppercase"
            >
              <FaArrowLeft className="mr-2" size={12} /> Retour aux agences
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-light text-gray-600 mb-16 text-center">
              <span className="relative inline-block">
                Voyages proposés
                <span className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-orange-300/50 to-white rounded-full"></span>
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {voyages.map((voyage) => (
                <div 
                  key={voyage._id} 
                  className="group bg-white overflow-hidden cursor-pointer transition-all duration-700 hover:shadow-[0_15px_40px_rgba(8,_112,_184,_0.07)] rounded-lg border border-gray-100 hover:border-orange-300/50"
                  onClick={() => navigateToVoyageDetail(voyage._id)}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img 
                      src={voyage.image} 
                      alt={voyage.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-2000 ease-out"
                      onError={(e) => {
                        e.target.src = "https://images.pexels.com/photos/2577274/pexels-photo-2577274.jpeg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-60 group-hover:opacity-50 transition-opacity duration-700"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="text-xl font-light text-white mb-3 tracking-wider shadow-text">{voyage.title}</h3>
                      <div className="flex items-center text-white/90 text-xs bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                        <FaMapMarkerAlt className="mr-2" size={10} />
                        <span className="font-light tracking-wider">{voyage.destination}</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm text-orange-500 text-sm px-3 py-1 font-medium shadow-sm rounded-full border border-white/50 tracking-wide">
                        {voyage.price.toLocaleString()} DH
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2 shadow-sm border border-orange-200">
                          <FaCalendarAlt className="text-orange-500" size={14} />
                        </div>
                        <span className="text-sm font-light text-gray-500">{voyage.duration} jours</span>
                      </div>
                      
                      <div className="h-8 w-px bg-gray-100"></div>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2 shadow-sm border border-orange-200">
                          <FaUsers className="text-orange-500" size={14} />
                        </div>
                        <span className="text-sm font-light text-gray-500">{voyage.availableSpots} places</span>
                      </div>
                      
                      <div className="h-8 w-px bg-gray-100"></div>
                      
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2 shadow-sm border border-orange-200">
                          <FaConciergeBell className="text-orange-500" size={14} />
                        </div>
                        <span className="text-sm font-light text-gray-500">Services</span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <button className="w-full py-3 text-sm bg-orange-500 text-white uppercase tracking-widest font-light hover:bg-orange-600 transition-all flex items-center justify-center shadow-sm hover:shadow-md border border-orange-600/50 rounded-lg">
                        Voir les détails <FaChevronRight className="ml-2" size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgencyVoyages; 