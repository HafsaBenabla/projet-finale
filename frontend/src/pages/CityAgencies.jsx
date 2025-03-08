import React from 'react';
import { useParams } from 'react-router-dom';

function CityAgencies() {
  const { cityName } = useParams();

  // Données des offres de voyage pour la ville
  const cityOffers = [
    {
      id: 1,
      title: "Circuit Culturel à Fès",
      description: "Découverte de la médina, visite des tanneries et des souks historiques",
      price: "800 MAD",
      duration: "1 jour",
      image: "https://images.pexels.com/photos/4502973/pexels-photo-4502973.jpeg",
      agency: {
        name: "Atlas Voyages",
        rating: 4.8,
        logo: "https://www.atlasvoyages.com/sites/all/themes/atlas/images/logo.png"
      },
      highlights: [
        "Guide professionnel",
        "Déjeuner traditionnel inclus",
        "Visite des monuments historiques"
      ]
    },
    {
      id: 2,
      title: "Excursion Gastronomique",
      description: "Découverte des saveurs locales et cours de cuisine traditionnelle",
      price: "600 MAD",
      duration: "Demi-journée",
      image: "https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg",
      agency: {
        name: "Maroc Authentique",
        rating: 4.7,
        logo: "https://www.travaux.ma/sites/default/files/styles/annonceur_logo/public/logos/maroc-authentique-voyages_logo_1594995116.jpg"
      },
      highlights: [
        "Cours de cuisine",
        "Dégustation de spécialités",
        "Visite du souk des épices"
      ]
    },
    {
      id: 3,
      title: "Tour des Artisans",
      description: "Rencontre avec les artisans locaux et démonstrations de savoir-faire",
      price: "450 MAD",
      duration: "4 heures",
      image: "https://images.pexels.com/photos/5998120/pexels-photo-5998120.jpeg",
      agency: {
        name: "Sahara Experience",
        rating: 4.9,
        logo: "https://www.saharaexperience.com/images/logo.png"
      },
      highlights: [
        "Démonstrations artisanales",
        "Shopping authentique",
        "Rencontre avec les artisans"
      ]
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Découvrez {cityName}
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Explorez les meilleures expériences et activités proposées par nos agences partenaires
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cityOffers.map((offer) => (
            <div key={offer.id} className="group relative overflow-hidden rounded-xl shadow-lg bg-white transform transition duration-500 hover:scale-105">
              <div className="h-56 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Badge de l'agence */}
              <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg flex items-center space-x-2">
                <img
                  src={offer.agency.logo}
                  alt={offer.agency.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex items-center pr-2">
                  <span className="text-sm font-semibold text-gray-900">{offer.agency.rating}</span>
                  <svg className="w-4 h-4 text-sahara ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium bg-sahara/10 text-sahara px-2 py-1 rounded-full">
                    {offer.agency.name}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>

                {/* Points forts */}
                <div className="space-y-2 mb-4">
                  {offer.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 text-sahara mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">À partir de</span>
                    <span className="text-2xl font-bold text-sahara">{offer.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 block">Durée</span>
                    <span className="text-gray-900">{offer.duration}</span>
                  </div>
                </div>

                <button className="w-full mt-6 bg-sahara text-white py-3 px-4 rounded-full hover:bg-sahara/90 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sahara/50">
                  Réserver maintenant
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CityAgencies;
