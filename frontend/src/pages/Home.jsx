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
    price: 1130,
    rating: 4.8,
    image: 'https://i.pinimg.com/564x/d2/10/d3/d210d3d08f6fe04cf4b7f7e78f71c9c9.jpg',
    type: 'Palace',
    features: ['Spa', 'Piscine', 'Restaurant Gastronomique', 'Vue sur l\'Atlas'],
    agencyPackage: {
      id: 'circuit-imperial-marrakech',
      name: 'Circuit des Villes Impériales',
      duration: '8 jours'
    }
  },
  {
    id: 2,
    name: 'Riad Fès Heritage',
    location: 'Fès',
    price: 780,
    rating: 4.6,
    image: 'https://i.pinimg.com/564x/8c/21/98/8c219814458f9c9d06b05a46c5300e5d.jpg',
    type: 'Riad',
    features: ['Terrasse Panoramique', 'Hammam', 'Architecture Traditionnelle'],
    agencyPackage: {
      id: 'decouverte-fes',
      name: 'Découverte de Fès',
      duration: '3 jours'
    }
  },
  {
    id: 3,
    name: 'Ocean View Essaouira',
    location: 'Essaouira',
    price: 920,
    rating: 4.7,
    image: 'https://i.pinimg.com/564x/d9/5a/86/d95a86c6c5491c96b6c4b3c64c0d44f3.jpg',
    type: 'Boutique Hôtel',
    features: ['Vue sur Océan', 'Surf', 'Restaurant de Fruits de Mer'],
    agencyPackage: null
  },
  {
    id: 4,
    name: 'Kasbah du Désert',
    location: 'Merzouga',
    price: 850,
    rating: 4.9,
    image: 'https://i.pinimg.com/564x/a0/cc/97/a0cc97e6b9d95b8f6b52f5e8f8d4c7b4.jpg',
    type: 'Kasbah',
    features: ['Vue sur les Dunes', 'Piscine', 'Excursions en Dromadaire'],
    agencyPackage: {
      id: 'escapade-sahara',
      name: 'Escapade dans le Sahara',
      duration: '5 jours'
    }
  }
];

const activities = [
  { 
    id: 'excursion-desert',
    name: 'Tour du Désert', 
    image: images.desertTour 
  },
  { 
    id: 'hammam-traditionnel',
    name: 'Hammam Traditionnel', 
    image: 'https://i.pinimg.com/564x/2c/ba/09/2cba09b4bf4d1998d63dd0e9a01c2b7f.jpg'
  },
  { 
    id: 'cours-cuisine',
    name: 'Cours de Cuisine', 
    image: 'https://i.pinimg.com/564x/57/c6/fa/57c6fa9d423d3e67f6142598142c7d71.jpg'
  },
  { 
    id: 'randonnee-atlas',
    name: 'Randonnée Atlas', 
    image: images.hiking 
  },
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
