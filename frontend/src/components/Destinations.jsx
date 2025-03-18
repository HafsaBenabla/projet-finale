import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const destinations = [
  {
    id: 1,
    name: 'Marrakech',
    image: 'https://i.pinimg.com/736x/4c/bf/1f/4cbf1f5b6e463f34bb9e71337a4a72b6.jpg',
    description: 'La ville rouge, célèbre pour ses souks et la place Jemaa el-Fna'
  },
  {
    id: 2,
    name: 'Chefchaouen',
    image: 'https://i.pinimg.com/236x/24/14/0c/24140ca8ae24d75c5bb4004307d265e4.jpg',
    description: 'La ville bleue nichée dans les montagnes du Rif'
  },
  {
    id: 3,
    name: 'Fès',
    image: 'https://i.pinimg.com/236x/2d/27/d1/2d27d13abdbe5c99863a189aa39e18b0.jpg',
    description: 'La capitale culturelle avec sa médina millénaire'
  },
  {
    id: 4,
    name: 'Essaouira',
    image: 'https://i.pinimg.com/236x/2b/6d/a5/2b6da5455e9a4990265b06b939887845.jpg',
    description: 'La cité des alizés au bord de l\'océan'
  },
  {
    id: 5,
    name: 'Rabat',
    image: 'https://i.pinimg.com/236x/ae/34/0b/ae340b43d0c7243e61a4e328e6e9309d.jpg',
    description: 'La capitale administrative, mélange de modernité et tradition'
  },
  {
    id: 6,
    name: 'Tanger',
    image: 'https://i.pinimg.com/236x/0b/6d/85/0b6d859d10802e8bfb6da715180435f1.jpg',
    description: 'La porte de l\'Afrique, ville cosmopolite'
  },
  {
    id: 7,
    name: 'Agadir',
    image: 'https://i.pinimg.com/236x/43/8d/98/438d98af94ec18e88b92eb314eec6609.jpg',
    description: 'La station balnéaire aux plages dorées'
  },
  {
    id: 8,
    name: 'Ouarzazate',
    image: 'https://i.pinimg.com/236x/0b/77/76/0b7776713ea85f3cbc97b2289e16a22d.jpg',
    description: 'La porte du désert et ses kasbahs'
  },
  {
    id: 9,
    name: 'Merzouga',
    image: 'https://i.pinimg.com/236x/94/c2/74/94c2746c843628602c37fed233b9a72a.jpg',
    description: 'Les dunes dorées du Sahara'
  },
  {
    id: 10,
    name: 'Asilah',
    image: 'https://i.pinimg.com/236x/30/07/43/300743d4e51420ce07eb822a4bd448d8.jpg',
    description: 'La perle blanche de l\'Atlantique'
  }
];

const Destinations = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clone les premiers éléments et les ajoute à la fin pour un défilement infini
    const firstCards = container.querySelectorAll('.destination-card');
    firstCards.forEach(card => {
      const clone = card.cloneNode(true);
      container.appendChild(clone);
    });

    // Animation de défilement
    container.style.animation = `scroll ${destinations.length * 10}s linear infinite`;

    // Pause sur hover
    const handleMouseEnter = () => {
      container.style.animationPlayState = 'paused';
    };

    const handleMouseLeave = () => {
      container.style.animationPlayState = 'running';
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleExplore = (cityName) => {
    navigate(`/city/${cityName}`);
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Destinations Populaires
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Découvrez les plus belles villes du Maroc, chacune avec son charme unique et son histoire fascinante
        </p>
        
        <div className="overflow-hidden relative">
          <style>
            {`
              @keyframes scroll {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(calc(-300px * ${destinations.length}));
                }
              }
            `}
          </style>
          <div 
            ref={containerRef}
            className="flex gap-8 py-4"
            style={{
              width: `calc(300px * ${destinations.length * 2} + 2rem * ${destinations.length * 2})`,
            }}
          >
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="destination-card flex-shrink-0 w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-lg relative transform transition-all duration-300 hover:scale-105 hover:z-10"
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1553899017-4ff76981e09e?q=80&w=1000&auto=format';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{destination.name}</h3>
                    <p className="text-sm mb-4 opacity-90">{destination.description}</p>
                    <button 
                      onClick={() => handleExplore(destination.name)}
                      className="px-6 py-2 bg-sahara text-white rounded-full text-sm hover:bg-sahara/90 transition-all duration-300 transform hover:scale-105"
                    >
                      Explorer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
          <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
