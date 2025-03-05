import React, { useEffect, useRef } from 'react';

const destinations = [
  {
    id: 1,
    name: 'Marrakech',
    image: 'https://images.unsplash.com/photo-1597212618440-806262de1c00?q=80&w=1000&auto=format',
    description: 'La ville rouge, célèbre pour ses souks et la place Jemaa el-Fna'
  },
  {
    id: 2,
    name: 'Chefchaouen',
    image: 'https://images.unsplash.com/photo-1553899017-4ff76981e09e?q=80&w=1000&auto=format',
    description: 'La ville bleue nichée dans les montagnes du Rif'
  },
  {
    id: 3,
    name: 'Fès',
    image: 'https://images.unsplash.com/photo-1579014485091-c5f4a1f4c855?q=80&w=1000&auto=format',
    description: 'La capitale culturelle avec sa médina millénaire'
  },
  {
    id: 4,
    name: 'Essaouira',
    image: 'https://images.unsplash.com/photo-1572206912757-5a78ff4d79be?q=80&w=1000&auto=format',
    description: 'La cité des alizés au bord de l\'océan'
  },
  {
    id: 5,
    name: 'Rabat',
    image: 'https://images.unsplash.com/photo-1597169428801-7c1eda2016f1?q=80&w=1000&auto=format',
    description: 'La capitale administrative, mélange de modernité et tradition'
  },
  {
    id: 6,
    name: 'Tanger',
    image: 'https://images.unsplash.com/photo-1553072951-b1ca589d635e?q=80&w=1000&auto=format',
    description: 'La porte de l\'Afrique, ville cosmopolite'
  },
  {
    id: 7,
    name: 'Agadir',
    image: 'https://images.unsplash.com/photo-1612857047010-c49bb6888d99?q=80&w=1000&auto=format',
    description: 'La station balnéaire aux plages dorées'
  },
  {
    id: 8,
    name: 'Ouarzazate',
    image: 'https://images.unsplash.com/photo-1545167496-c1e092d383a2?q=80&w=1000&auto=format',
    description: 'La porte du désert et ses kasbahs'
  },
  {
    id: 9,
    name: 'Merzouga',
    image: 'https://images.unsplash.com/photo-1548235890-693e8714b17f?q=80&w=1000&auto=format',
    description: 'Les dunes dorées du Sahara'
  },
  {
    id: 10,
    name: 'Asilah',
    image: 'https://images.unsplash.com/photo-1597169428801-7c1eda2016f1?q=80&w=1000&auto=format',
    description: 'La perle blanche de l\'Atlantique'
  }
];

const Destinations = () => {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleMouseEnter = () => {
      track.style.animationPlayState = 'paused';
      track.querySelectorAll('.carousel-item').forEach(item => {
        item.style.animationPlayState = 'paused';
      });
    };

    const handleMouseLeave = () => {
      track.style.animationPlayState = 'running';
      track.querySelectorAll('.carousel-item').forEach(item => {
        item.style.animationPlayState = 'running';
      });
    };

    track.addEventListener('mouseenter', handleMouseEnter);
    track.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      track.removeEventListener('mouseenter', handleMouseEnter);
      track.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Quadruple the array to ensure ultra-smooth infinite scroll
  const extendedDestinations = [...destinations, ...destinations, ...destinations, ...destinations];

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Destinations Populaires
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Découvrez les plus belles villes du Maroc, chacune avec son charme unique et son histoire fascinante
        </p>
        
        <div className="carousel-container">
          <div className="carousel-track" ref={trackRef}>
            {extendedDestinations.map((destination, index) => (
              <div
                key={`${destination.id}-${index}`}
                className="carousel-item"
                style={{ '--parallax-delay': (index % 10) * 0.2 }}
              >
                <div className="destination-card">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1553899017-4ff76981e09e?q=80&w=1000&auto=format';
                    }}
                  />
                  <div className="destination-overlay">
                    <div className="destination-content">
                      <h3>{destination.name}</h3>
                      <p>{destination.description}</p>
                      <button className="mt-4 px-6 py-2 bg-sahara text-white rounded-full text-sm hover:bg-sahara/90 transition-all duration-300 ease-out transform hover:scale-105">
                        Explorer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destinations;
