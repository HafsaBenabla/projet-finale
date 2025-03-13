import React, { createContext, useContext } from 'react';

const VoyagesContext = createContext();

export const voyagesData = [
  {
    id: 1,
    title: "Circuit des Villes Impériales",
    description: "8 jours de découverte à travers les plus belles villes du Maroc. Explorez les médinas historiques, les souks animés et les monuments majestueux. Profitez d'une expérience authentique avec des hébergements de charme et une cuisine locale raffinée.",
    image: "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg",
    destination: "Marrakech",
    duration: "8+ jours",
    price: 8900,
    budget: "Standard",
    maxPlaces: 20,
    inclusions: [
      "Transport en 4x4 climatisé",
      "Hébergement en hôtels 4 étoiles",
      "Petit-déjeuner et dîner inclus",
      "Guide touristique professionnel",
      "Visites et entrées aux monuments",
      "Excursions dans le désert"
    ],
    programme: [
      "Jour 1: Arrivée à Marrakech - Installation à l'hôtel",
      "Jour 2: Visite guidée de Marrakech",
      "Jour 3: Route vers Essaouira",
      "Jour 4: Découverte des souks et de la médina",
      "Jour 5: Excursion dans l'Atlas",
      "Jour 6: Visite des palmeraies",
      "Jour 7: Journée libre et shopping",
      "Jour 8: Transfert à l'aéroport"
    ]
  },
  {
    id: 2,
    title: "Escapade dans le Sahara",
    description: "Une aventure inoubliable dans les dunes dorées du désert. Vivez une expérience unique sous les étoiles du Sahara, avec des nuits en campement de luxe, des balades à dos de chameau et des couchers de soleil spectaculaires.",
    image: "https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg",
    destination: "Sahara",
    duration: "4-7 jours",
    price: 6500,
    budget: "Standard",
    maxPlaces: 15,
    inclusions: [
      "Transport en 4x4 tout-terrain",
      "Hébergement en campement de luxe",
      "Pension complète",
      "Guide saharien expérimenté",
      "Balade à dos de chameau",
      "Soirées traditionnelles"
    ],
    programme: [
      "Jour 1: Départ vers le désert - Arrêt aux oasis",
      "Jour 2: Découverte des dunes - Balade à dos de chameau",
      "Jour 3: Exploration des villages berbères",
      "Jour 4: Activités dans le désert - Nuit sous les étoiles",
      "Jour 5: Retour vers la civilisation"
    ]
  },
  {
    id: 3,
    title: "Découverte de Fès",
    description: "Immersion dans la plus ancienne médina du monde. Découvrez l'artisanat traditionnel, les tanneries historiques et la riche culture de la capitale spirituelle du Maroc.",
    image: "https://images.pexels.com/photos/4502973/pexels-photo-4502973.jpeg",
    destination: "Fès",
    duration: "2-3 jours",
    price: 3500,
    budget: "Économique",
    maxPlaces: 25,
    inclusions: [
      "Transferts aéroport",
      "Hébergement en riad traditionnel",
      "Petit-déjeuner marocain",
      "Guide local certifié",
      "Visite des tanneries",
      "Atelier d'artisanat"
    ],
    programme: [
      "Jour 1: Arrivée à Fès - Visite de la médina",
      "Jour 2: Découverte des tanneries et ateliers d'artisanat",
      "Jour 3: Visite des monuments historiques - Départ"
    ]
  },
  {
    id: 4,
    title: "Luxe à Marrakech",
    description: "Séjour de luxe dans la ville rouge avec spa et activités premium. Profitez des meilleurs hôtels, restaurants gastronomiques et expériences exclusives que Marrakech a à offrir.",
    image: "https://images.pexels.com/photos/2404046/pexels-photo-2404046.jpeg",
    destination: "Marrakech",
    duration: "4-7 jours",
    price: 15000,
    budget: "Premium",
    maxPlaces: 10,
    inclusions: [
      "Transferts privés en limousine",
      "Suite dans un palace 5 étoiles",
      "Pension complète gastronomique",
      "Spa et soins quotidiens",
      "Guide privé",
      "Activités VIP"
    ],
    programme: [
      "Jour 1: Accueil VIP - Installation au palace",
      "Jour 2: Spa et visite privée de la médina",
      "Jour 3: Golf et déjeuner gastronomique",
      "Jour 4: Shopping de luxe et hammam",
      "Jour 5: Excursion privée dans l'Atlas"
    ]
  },
  {
    id: 5,
    title: "Trek dans l'Atlas",
    description: "Randonnée spectaculaire dans les montagnes de l'Atlas. Découvrez des paysages à couper le souffle, des villages berbères authentiques et le plus haut sommet d'Afrique du Nord.",
    image: "https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg",
    destination: "Atlas",
    duration: "4-7 jours",
    price: 5500,
    budget: "Économique",
    maxPlaces: 12,
    inclusions: [
      "Transport depuis Marrakech",
      "Hébergement en gîte et bivouac",
      "Pension complète",
      "Guide de montagne qualifié",
      "Équipement de trek",
      "Mules pour le portage"
    ],
    programme: [
      "Jour 1: Départ de Marrakech - Village d'Imlil",
      "Jour 2: Début du trek - Col de Tizi n'Mzik",
      "Jour 3: Randonnée vers le refuge du Toubkal",
      "Jour 4: Ascension du Toubkal",
      "Jour 5: Descente et retour à Marrakech"
    ]
  },
  {
    id: 6,
    title: "Culture et Gastronomie",
    description: "Un voyage culinaire à travers les saveurs du Maroc. Apprenez à cuisiner les plats traditionnels, découvrez les épices locales et dégustez les meilleures spécialités marocaines.",
    image: "https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg",
    destination: "Fès",
    duration: "2-3 jours",
    price: 4500,
    budget: "Standard",
    maxPlaces: 18,
    inclusions: [
      "Transferts en ville",
      "Hébergement en maison d'hôtes",
      "Tous les repas inclus",
      "Cours de cuisine",
      "Visite du marché aux épices",
      "Dégustations"
    ],
    programme: [
      "Jour 1: Accueil et premier cours de cuisine",
      "Jour 2: Visite du marché et atelier tajine",
      "Jour 3: Pâtisseries marocaines et départ"
    ]
  }
];

export const VoyagesProvider = ({ children }) => {
  return (
    <VoyagesContext.Provider value={voyagesData}>
      {children}
    </VoyagesContext.Provider>
  );
};

export const useVoyages = () => {
  const context = useContext(VoyagesContext);
  if (context === undefined) {
    throw new Error('useVoyages must be used within a VoyagesProvider');
  }
  return context;
};
