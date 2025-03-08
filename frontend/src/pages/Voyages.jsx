import React, { useState, useMemo } from 'react';

const Voyages = () => {
  // Données des voyages
  const voyages = [
    {
      id: 1,
      title: "Circuit des Villes Impériales",
      description: "8 jours de découverte à travers les plus belles villes du Maroc",
      image: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg",
      destination: "Marrakech",
      duration: "8+ jours",
      price: 8900,
      budget: "Standard"
    },
    {
      id: 2,
      title: "Escapade dans le Sahara",
      description: "Une aventure inoubliable dans les dunes dorées du désert",
      image: "https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg",
      destination: "Sahara",
      duration: "4-7 jours",
      price: 6500,
      budget: "Standard"
    },
    {
      id: 3,
      title: "Découverte de Fès",
      description: "Immersion dans la plus ancienne médina du monde",
      image: "https://images.pexels.com/photos/4502973/pexels-photo-4502973.jpeg",
      destination: "Fès",
      duration: "2-3 jours",
      price: 3500,
      budget: "Économique"
    },
    {
      id: 4,
      title: "Luxe à Marrakech",
      description: "Séjour de luxe dans la ville rouge avec spa et activités premium",
      image: "https://images.pexels.com/photos/2404046/pexels-photo-2404046.jpeg",
      destination: "Marrakech",
      duration: "4-7 jours",
      price: 15000,
      budget: "Premium"
    },
    {
      id: 5,
      title: "Trek dans l'Atlas",
      description: "Randonnée spectaculaire dans les montagnes de l'Atlas",
      image: "https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg",
      destination: "Atlas",
      duration: "4-7 jours",
      price: 5500,
      budget: "Économique"
    },
    {
      id: 6,
      title: "Culture et Gastronomie",
      description: "Un voyage culinaire à travers les saveurs du Maroc",
      image: "https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg",
      destination: "Fès",
      duration: "2-3 jours",
      price: 4500,
      budget: "Standard"
    }
  ];

  // États pour les filtres
  const [destinationFilter, setDestinationFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  // Liste des destinations uniques
  const destinations = [...new Set(voyages.map(voyage => voyage.destination))];

  // Filtrage des voyages
  const filteredVoyages = useMemo(() => {
    return voyages.filter(voyage => {
      const matchDestination = !destinationFilter || voyage.destination === destinationFilter;
      const matchDuration = !durationFilter || voyage.duration === durationFilter;
      const matchBudget = !budgetFilter || voyage.budget === budgetFilter;
      return matchDestination && matchDuration && matchBudget;
    });
  }, [destinationFilter, durationFilter, budgetFilter]);

  return (
    <div className="w-full pt-16">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Nos Voyages</h1>
          <p className="mt-4 text-xl text-gray-600">Découvrez nos circuits et séjours organisés</p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            <select 
              className="px-4 py-2 border rounded-lg text-gray-700"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
            >
              <option value="">Toutes les destinations</option>
              {destinations.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
            <select 
              className="px-4 py-2 border rounded-lg text-gray-700"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
            >
              <option value="">Toutes les durées</option>
              <option value="2-3 jours">2-3 jours</option>
              <option value="4-7 jours">4-7 jours</option>
              <option value="8+ jours">8+ jours</option>
            </select>
            <select 
              className="px-4 py-2 border rounded-lg text-gray-700"
              value={budgetFilter}
              onChange={(e) => setBudgetFilter(e.target.value)}
            >
              <option value="">Tous les budgets</option>
              <option value="Économique">Économique</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voyages Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVoyages.map((voyage) => (
            <div key={voyage.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
              <div className="h-48 overflow-hidden">
                <img 
                  src={voyage.image} 
                  alt={voyage.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">
                    {voyage.destination}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {voyage.duration}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{voyage.title}</h3>
                <p className="mt-2 text-gray-600">{voyage.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sahara font-semibold">À partir de {voyage.price} MAD</span>
                  <button className="px-4 py-2 bg-sahara text-white rounded-full hover:bg-sahara/90 transition-colors">
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Voyages;
