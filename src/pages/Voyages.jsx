import React from 'react';

const Voyages = () => {
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
            <select className="px-4 py-2 border rounded-lg text-gray-700">
              <option>Destination</option>
              <option>Marrakech</option>
              <option>Fès</option>
              <option>Sahara</option>
            </select>
            <select className="px-4 py-2 border rounded-lg text-gray-700">
              <option>Durée</option>
              <option>2-3 jours</option>
              <option>4-7 jours</option>
              <option>8+ jours</option>
            </select>
            <select className="px-4 py-2 border rounded-lg text-gray-700">
              <option>Budget</option>
              <option>Économique</option>
              <option>Standard</option>
              <option>Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voyages Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Example Voyage Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">Circuit des Villes Impériales</h3>
              <p className="mt-2 text-gray-600">8 jours de découverte à travers les plus belles villes du Maroc</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sahara font-semibold">À partir de 8900 MAD</span>
                <button className="px-4 py-2 bg-sahara text-white rounded-full hover:bg-sahara/90">
                  Détails
                </button>
              </div>
            </div>
          </div>
          
          {/* Add more voyage cards here */}
        </div>
      </div>
    </div>
  );
};

export default Voyages;
