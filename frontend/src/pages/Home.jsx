import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHotel, FaArrowDown, FaCompass } from "react-icons/fa";
import { images } from "../constants/images";
import SearchBar from "../components/SearchBar";
import Destinations from "../components/Destinations";
import HotelCard from "../components/HotelCard";
import ActivityCard from "../components/ActivityCard";
import AccommodationCard from "../components/AccommodationCard";

const Home = () => {
  const [luxuryAccommodations, setLuxuryAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allVoyages, setAllVoyages] = useState([]);
  const [voyagesWithAccommodation, setVoyagesWithAccommodation] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [showFullPage, setShowFullPage] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Fetch voyages data when component mounts
    const fetchVoyages = async () => {
      try {
        console.log('Début de la récupération des voyages pour la page d\'accueil');
        const response = await fetch('http://localhost:5000/api/voyages');
        const data = await response.json();
        
        console.log('Tous les voyages récupérés (brut):', data);
        setAllVoyages(data);
        
        // Filtrer les voyages qui ont des images d'hébergement
        const voyagesWithHebergementImage = data.filter(v => v.hebergementImage && v.hebergementImage.trim() !== '');
        console.log(`Nombre de voyages avec hebergementImage: ${voyagesWithHebergementImage.length}`);
        
        // Détails pour le débogage
        voyagesWithHebergementImage.forEach(v => {
          console.log(`Détail de hebergementImage pour voyage ${v._id} - ${v.title}:`, {
            hebergement: v.hebergement || 'Non défini',
            hebergementImage: v.hebergementImage,
            typeHebergementImage: typeof v.hebergementImage,
            validUrl: v.hebergementImage?.startsWith('http'),
            destination: v.destination,
            price: v.price,
            duration: v.duration
          });
        });
        
        // Sauvegarder les voyages avec des hébergements et des images
        setVoyagesWithAccommodation(voyagesWithHebergementImage);
        
        // Créer des objets d'hébergement de luxe pour l'affichage sur la page d'accueil
        // On priorise les voyages avec des images d'hébergement
        const accommodationsWithImages = voyagesWithHebergementImage.map(voyage => ({
          id: voyage._id,
          name: voyage.hebergement || voyage.title,
          location: voyage.destination,
          price: voyage.price,
          rating: 4.8,
          image: voyage.hebergementImage,
          type: 'Hébergement',
          features: voyage.inclusions ? voyage.inclusions.slice(0, 3) : [],
          agencyPackage: {
            id: voyage._id,
            name: voyage.title,
            duration: `${voyage.duration} jour${voyage.duration > 1 ? 's' : ''}`
          }
        }));
        
        // Limiter à 4 hébergements
        setLuxuryAccommodations(accommodationsWithImages.slice(0, 4));
      } catch (error) {
        console.error('Error fetching voyages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Nouvelle fonction pour récupérer les activités
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const response = await fetch('http://localhost:5000/api/activities');
        const data = await response.json();
        console.log('Activités récupérées:', data);
        
        // Limiter à 4 activités pour l'affichage sur la page d'accueil
        setActivities(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoadingActivities(false);
      }
    };
    
    fetchVoyages();
    fetchActivities(); // Appeler la fonction pour charger les activités
  }, []);

  const handleExploreClick = () => {
    setShowFullPage(true);
    // Scroll smoothly to the Destinations section
    setTimeout(() => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <div className="w-full">
      {/* Hero Section prenant toute la hauteur de l'écran */}
      <section 
        className="relative min-h-screen w-full bg-cover bg-center flex flex-col"
        style={{ 
          backgroundImage: `url(${images.hero})`,
          height: '100vh' // Force la hauteur à 100% de la hauteur de la fenêtre
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60" />
        <div className="w-full max-w-[1400px] mx-auto px-4 relative flex-grow flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-center mb-4 sm:mb-6 tracking-tight">
            Le Maroc Authentique
            <span className="block mt-2 text-orange-400">Vous Attend</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-center mb-8 sm:mb-12 max-w-3xl px-4">
            Découvrez toutes les merveilles du Maroc, des montagnes aux plages, des médinas aux déserts
          </p>

          {/* Search Bar */}
          <SearchBar />
          
          {/* Bouton Explorer redesigné */}
          {!showFullPage && (
            <div className="mt-16 mb-8 text-center">
              <div className="relative inline-block">
                <button 
                  onClick={handleExploreClick}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`
                    relative overflow-hidden px-10 py-4 rounded-full font-bold text-lg
                    transition-all duration-500 ease-in-out
                    ${isHovered ? 'bg-white text-sahara shadow-[0_0_20px_rgba(255,255,255,0.7)]' : 'bg-sahara text-white'}
                    group hover:pl-14
                  `}
                >
                  <span className={`absolute left-4 transform transition-all duration-500 ease-in-out ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <FaCompass className="text-xl" />
                  </span>
                  Explorez le Maroc
                </button>
                
                {/* Effet de pulsation circulaire */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <span className="flex h-10 w-10">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sahara opacity-30"></span>
                      <span className="relative flex justify-center items-center rounded-full h-10 w-10 bg-sahara">
                        <FaArrowDown className="text-white text-sm animate-bounce" />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Texte incitant à explorer */}
              <p className="text-white/80 text-sm mt-16 animate-pulse">Découvrez nos offres exclusives en scrollant</p>
            </div>
          )}
        </div>
        
        {/* Effet de vagues au bas de la section Hero */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-0 transform">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[70px]">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50/90"></path>
          </svg>
        </div>
      </section>

      {/* Sections conditionnellement affichées uniquement si l'utilisateur clique sur Explorer */}
      {showFullPage && (
        <>
          {/* Destinations Section */}
          <Destinations />

          {/* Hébergements de Luxe Section */}
          <section className="py-12 sm:py-16 bg-gray-50">
            <div className="w-full max-w-[1400px] mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Hébergements de Luxe
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Découvrez notre sélection d'hébergements d'exception à travers le Maroc
                </p>
              </div>

              {loading ? (
                <div className="col-span-full text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sahara"></div>
                  <p className="mt-2 text-gray-600">Chargement des hébergements...</p>
                </div>
              ) : (
                <>
                  {/* Affichage des hébergements de voyages */}
                  {voyagesWithAccommodation.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                      {voyagesWithAccommodation.slice(0, 4).map(voyage => (
                        <AccommodationCard
                          key={voyage._id}
                          voyageId={voyage._id}
                          hebergementName={voyage.hebergement}
                          hebergementImage={voyage.hebergementImage}
                          destination={voyage.destination}
                          price={voyage.price}
                          duration={voyage.duration}
                          voyageTitle={voyage.title}
                        />
                      ))}
                    </div>
                  ) : (
                    // Message si aucun hébergement n'est disponible
                    <div className="text-center py-10 bg-gray-100 rounded-lg">
                      <p className="text-gray-600">Aucun hébergement n'est disponible pour le moment.</p>
                      <p className="text-gray-500 mt-2">Ajoutez des voyages avec des informations d'hébergement pour les voir apparaître ici.</p>
                    </div>
                  )}
                  
                  {/* Bouton pour voir plus d'hébergements */}
                  {voyagesWithAccommodation.length > 4 && (
                    <div className="text-center mt-8">
                      <Link 
                        to="/voyages" 
                        className="inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-lg hover:bg-sahara/90 transition-colors"
                      >
                        <FaHotel className="mr-2" /> Voir plus d'hébergements
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Activities Section */}
          <section className="py-12 sm:py-16">
            <div className="w-full max-w-[1400px] mx-auto px-4">
              <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Activités Incontournables
                </h2>
                <p className="text-lg sm:text-xl text-gray-600">
                  Vivez des expériences uniques au Maroc
                </p>
              </div>

              {loadingActivities ? (
                <div className="col-span-full text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sahara"></div>
                  <p className="mt-2 text-gray-600">Chargement des activités...</p>
                </div>
              ) : (
                <>
                  {activities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {activities.map((activity) => (
                        <ActivityCard 
                          key={activity._id}
                          id={activity._id}
                          name={activity.name}
                          image={activity.image}
                          description={activity.description}
                          duration={activity.duration}
                          price={activity.price}
                          voyageId={activity.voyageId}
                          city={activity.city}
                          maxParticipants={activity.maxParticipants}
                          type={activity.type || 'locale'}
                          isWeekendOnly={activity.isWeekendOnly}
                          timeSlots={activity.timeSlots}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-100 rounded-lg">
                      <p className="text-gray-600">Aucune activité n'est disponible pour le moment.</p>
                      <p className="text-gray-500 mt-2">Ajoutez des activités pour les voir apparaître ici.</p>
                    </div>
                  )}
                  
                  {/* Bouton pour voir plus d'activités si nécessaire */}
                  {activities.length > 4 && (
                    <div className="text-center mt-8">
                      <Link 
                        to="/activites" 
                        className="inline-flex items-center px-6 py-3 bg-sahara text-white font-semibold rounded-lg hover:bg-sahara/90 transition-colors"
                      >
                        Voir plus d'activités
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-12 sm:py-16 bg-orange-500 text-white">
            <div className="w-full max-w-[1400px] mx-auto px-4 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Restez Informé</h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                Recevez nos meilleures offres et découvrez nos nouveautés
              </p>
              <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  className="w-full sm:flex-1 px-6 py-3 rounded-full text-gray-800 outline-none"
                />
                <button className="w-full sm:w-auto px-8 py-3 bg-white text-orange-500 font-semibold rounded-full hover:bg-gray-100 transition-colors">
                  S'inscrire
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
