import React from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { images } from "../constants/images";
import SearchBar from "../components/SearchBar";
import Destinations from "../components/Destinations";
import HotelCard from "../components/HotelCard";
import ActivityCard from "../components/ActivityCard";

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
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section 
        className="relative h-[80vh] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${images.hero})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="w-full max-w-[1400px] mx-auto px-4 relative h-full flex flex-col items-center justify-center text-white">
          <h1 className="text-6xl md:text-7xl font-bold text-center mb-6 tracking-tight">
            Le Sahara Marocain
            <span className="block mt-2 text-orange-400">Vous Attend</span>
          </h1>
          <p className="text-xl md:text-2xl text-center mb-12 max-w-3xl">
            Découvrez la magie des dunes dorées et vivez une aventure inoubliable
          </p>

          {/* Search Bar */}
          <SearchBar />
        </div>
      </section>

      {/* Destinations Section */}
      <Destinations />

      {/* Hotels Section */}
      <section className="py-16 bg-gray-50">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Hébergements de Luxe
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez notre sélection d'hébergements d'exception à travers le Maroc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Activités Incontournables
            </h2>
            <p className="text-xl text-gray-600">
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
      <section className="py-16 bg-orange-500 text-white">
        <div className="w-full max-w-[1400px] mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Restez Informé</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Recevez nos meilleures offres et découvrez nos nouveautés
          </p>
          <div className="max-w-xl mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="Votre email" 
              className="flex-1 px-6 py-3 rounded-full text-gray-800 outline-none"
            />
            <button className="px-8 py-3 bg-white text-orange-500 font-semibold rounded-full hover:bg-gray-100 transition-colors">
              S'inscrire
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
