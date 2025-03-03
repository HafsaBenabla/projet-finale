import React from 'react';

const Activites = () => {
  return (
    <div className="w-full pt-16">
      {/* Header */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900">Activités Locales</h1>
          <p className="mt-4 text-xl text-gray-600">Vivez des expériences authentiques avec nos guides locaux</p>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="px-6 py-2 rounded-full bg-sahara text-white">Tous</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Culture</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Aventure</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Gastronomie</button>
          <button className="px-6 py-2 rounded-full border border-gray-300 hover:border-sahara">Artisanat</button>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Activity Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-sahara/10 text-sahara rounded-full text-sm">Culture</span>
                <span className="text-gray-600">3 heures</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Atelier de Poterie Traditionnelle</h3>
              <p className="mt-2 text-gray-600">Apprenez les techniques ancestrales de la poterie marocaine</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sahara font-semibold">350 MAD / personne</span>
                <button className="px-4 py-2 bg-sahara text-white rounded-full hover:bg-sahara/90">
                  Réserver
                </button>
              </div>
            </div>
          </div>

          {/* Add more activity cards here */}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-16 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vous ne trouvez pas l'activité idéale ?</h2>
          <p className="text-gray-600 mb-8">Contactez-nous pour une expérience personnalisée</p>
          <button className="px-8 py-3 bg-sahara text-white rounded-full hover:bg-sahara/90">
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Activites;
