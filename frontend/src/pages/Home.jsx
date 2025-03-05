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
    image: images.saharaPalace
  },
  {
    id: 2,
    name: 'Atlas Sky Hotel',
    location: 'Chefchaouen',
    price: 180,
    rating: 4.6,
    image: images.atlasSky
  },
  {
    id: 3,
    name: 'Ocean View Essaouira',
    location: 'Essaouira',
    price: 210,
    rating: 4.8,
    image: images.oceanView
  }
];

const activities = [
  { name: 'Tour du Désert', image: images.desertTour },
  { name: 'Visite de Médina', image: images.medina },
  { name: 'Surf à Essaouira', image: images.surfing },
  { name: 'Randonnée Atlas', image: images.hiking },
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
              Séjournez dans les plus beaux hôtels du Maroc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <HotelCard 
                key={hotel.id}
                name={hotel.name}
                location={hotel.location}
                price={hotel.price}
                image={hotel.image}
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
              <ActivityCard key={activity.name} name={activity.name} image={activity.image} />
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
