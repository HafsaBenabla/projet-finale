import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHotel } from "react-icons/fa";
import { images } from "../constants/images";
import SearchBar from "../components/SearchBar";
import Destinations from "../components/Destinations";
import HotelCard from "../components/HotelCard";
import ActivityCard from "../components/ActivityCard";
import AccommodationCard from "../components/AccommodationCard";

// Kept as fallback if no voyages with accommodations are available
const hotels = [
  {
    id: 1,
    name: 'Sahara Palace Marrakech',
    location: 'Marrakech',
    price: 8900,
    rating: 4.8,
    image: 'https://i.pinimg.com/736x/4c/bf/1f/4cbf1f5b6e463f34bb9e71337a4a72b6.jpg',
    type: 'Palace',
    features: ['Spa', 'Piscine', 'Restaurant Gastronomique', 'Vue sur l\'Atlas'],
    agencyPackage: {
      id: '1',
      name: 'Circuit des Villes Impériales',
      duration: '8+ jours'
    }
  },
  {
    id: 2,
    name: 'Riad Fès Heritage',
    location: 'Fès',
    price: 3500,
    rating: 4.6,
    image: 'https://i.pinimg.com/236x/2d/27/d1/2d27d13abdbe5c99863a189aa39e18b0.jpg',
    type: 'Riad',
    features: ['Terrasse Panoramique', 'Hammam', 'Architecture Traditionnelle'],
    agencyPackage: {
      id: '3',
      name: 'Découverte de Fès',
      duration: '2-3 jours'
    }
  },
  {
    id: 3,
    name: 'Kasbah du Désert',
    location: 'Merzouga',
    price: 6500,
    rating: 4.9,
    image: 'https://i.pinimg.com/236x/94/c2/74/94c2746c843628602c37fed233b9a72a.jpg',
    type: 'Kasbah',
    features: ['Vue sur les Dunes', 'Piscine', 'Excursions en Dromadaire'],
    agencyPackage: {
      id: '2',
      name: 'Escapade dans le Sahara',
      duration: '4-7 jours'
    }
  }
];

const activities = [
  { 
    id: 'desert-tour',
    name: 'Circuit des Villes Impériales',
    image: 'https://i.pinimg.com/736x/4c/bf/1f/4cbf1f5b6e463f34bb9e71337a4a72b6.jpg',
    voyageId: '1',
    description: 'Explorez les médinas historiques et les monuments majestueux',
    duration: '8+ jours',
    price: 8900
  },
  { 
    id: 'sahara-adventure',
    name: 'Escapade dans le Sahara',
    image: 'https://i.pinimg.com/236x/94/c2/74/94c2746c843628602c37fed233b9a72a.jpg',
    voyageId: '2',
    description: 'Vivez une expérience unique sous les étoiles du Sahara',
    duration: '4-7 jours',
    price: 6500
  },
  { 
    id: 'fes-discovery',
    name: 'Découverte de Fès',
    image: 'https://i.pinimg.com/236x/2d/27/d1/2d27d13abdbe5c99863a189aa39e18b0.jpg',
    voyageId: '3',
    description: 'Immersion dans la plus ancienne médina du monde',
    duration: '2-3 jours',
    price: 3500
  },
  { 
    id: 'atlas-trek',
    name: 'Trek dans l\'Atlas',
    image: 'https://i.pinimg.com/236x/0b/77/76/0b7776713ea85f3cbc97b2289e16a22d.jpg',
    voyageId: '5',
    description: 'Randonnée spectaculaire dans les montagnes de l\'Atlas',
    duration: '4-7 jours',
    price: 5500
  }
];

const Home = () => {
  const [luxuryAccommodations, setLuxuryAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allVoyages, setAllVoyages] = useState([]);
  const [voyagesWithAccommodation, setVoyagesWithAccommodation] = useState([]);

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
    
    fetchVoyages();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section 
        className="relative min-h-[60vh] sm:h-[80vh] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${images.hero})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="w-full max-w-[1400px] mx-auto px-4 relative h-full flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-center mb-4 sm:mb-6 tracking-tight">
            Le Maroc Authentique
            <span className="block mt-2 text-orange-400">Vous Attend</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-center mb-8 sm:mb-12 max-w-3xl px-4">
            Découvrez toutes les merveilles du Maroc, des montagnes aux plages, des médinas aux déserts
          </p>

          {/* Search Bar */}
          <SearchBar />
        </div>
      </section>

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
              ) : allVoyages.length > 0 ? (
                // Si pas d'hébergements spécifiques, afficher les voyages normaux
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {allVoyages.slice(0, 4).map((voyage) => (
                    <HotelCard 
                      key={voyage._id}
                      name={voyage.title}
                      location={voyage.destination}
                      price={voyage.price}
                      image={voyage.image}
                      rating={4.5}
                      type="Voyage"
                      features={voyage.inclusions ? voyage.inclusions.slice(0, 3) : []}
                      agencyPackage={{
                        id: voyage._id,
                        name: voyage.title,
                        duration: `${voyage.duration} jour${voyage.duration > 1 ? 's' : ''}`
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Fallback aux données statiques
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  {hotels.map((hotel) => (
                    <HotelCard 
                      key={hotel.id}
                      name={hotel.name}
                      location={hotel.location}
                      price={hotel.price}
                      image={hotel.image}
                      rating={hotel.rating}
                      type={hotel.type}
                      features={hotel.features}
                      agencyPackage={hotel.agencyPackage}
                    />
                  ))}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.map((activity) => (
              <ActivityCard 
                key={activity.id}
                id={activity.id}
                name={activity.name}
                image={activity.image}
                description={activity.description}
                duration={activity.duration}
                price={activity.price}
                voyageId={activity.voyageId}
              />
            ))}
          </div>
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
    </div>
  );
};

export default Home;
