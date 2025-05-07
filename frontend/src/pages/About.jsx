import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGlobe, FaHandshake, FaHeart, FaMapMarkedAlt, FaUserFriends, FaLeaf, FaArrowRight, FaQuoteLeft, FaImage } from 'react-icons/fa';
import { images } from '../constants/images';

export default function About() {
  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section avec image de fond */}
      <section className="relative bg-cover bg-center h-[70vh] flex items-center justify-center" style={{ backgroundImage: `url(${'https://images.unsplash.com/photo-1550698286-f7909463a2a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-sahara/80 to-black/50"></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Découvrez Notre Histoire</h1>
            <div className="w-24 h-1 bg-sahara mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light">
              Nous sommes plus qu'une simple plateforme de voyage — nous sommes votre passerelle vers l'âme du Maroc
            </p>
          </motion.div>
        </div>
        
        {/* Vague décorative en bas */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" fill="#ffffff">
            <path d="M0,96L80,85.3C160,75,320,53,480,58.7C640,64,800,96,960,96C1120,96,1280,64,1360,48L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* Section Mission avec design moderne */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative p-2 bg-gradient-to-r from-sahara/20 to-gray-200 rounded-lg transform transition-transform duration-300 hover:scale-[1.02] shadow-2xl">
                <div className="absolute inset-0 border-2 border-sahara/20 rounded-lg"></div>
                <img 
                  src={"https://i.pinimg.com/736x/ff/0b/41/ff0b4119b3b862c5e46354333225e38c.jpg"} 
                  alt="Notre mission" 
                  className="w-full h-auto rounded-lg shadow-inner object-cover transform transition-all duration-500 hover:brightness-105"
                  style={{ maxHeight: "450px" }}
                />
                <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black/30 to-transparent rounded-b-lg"></div>
              </div>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6 relative">
                <span className="text-sahara">#</span> Notre Mission
                <div className="w-16 h-1 bg-sahara mt-4"></div>
              </h2>
              <div className="relative mb-10">
                <FaQuoteLeft className="text-4xl text-sahara/20 absolute -left-6 -top-4" />
                <p className="text-xl text-gray-700 italic mb-6 pl-4">
                  "Créer des expériences de voyage authentiques qui connectent les cœurs et les cultures."
                </p>
              </div>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nous nous engageons à promouvoir un tourisme responsable et durable, 
                qui bénéficie aux communautés locales tout en offrant des expériences 
                authentiques à nos voyageurs.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Chaque voyage que nous organisons est une opportunité de créer des 
                connexions significatives entre les voyageurs et la culture marocaine, 
                tout en préservant les traditions et l'environnement local.
              </p>
              <Link 
                to="/voyages" 
                className="px-6 py-3 bg-sahara text-white rounded-full inline-flex items-center gap-2 hover:bg-sahara/90 transition-colors font-medium shadow-md hover:shadow-lg no-underline"
                style={{ textDecoration: 'none' }}
              >
                <span>Découvrir nos voyages</span> <FaArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Galerie photos */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Le Maroc en Images</h2>
            <p className="text-xl text-gray-600">
              Laissez-vous inspirer par la beauté et la diversité du Maroc
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://i.pinimg.com/736x/20/6c/1d/206c1d9afa25c5d799b24773b473349e.jpg",  // Marrakech sunset
              "https://i.pinimg.com/736x/4f/d8/3a/4fd83a6dd7d40478b6a121fdf7a61042.jpg",  // Desert camp
              "https://i.pinimg.com/736x/69/38/e5/6938e5437244f6dc91d052a883dc7d23.jpg",  // Chefchaouen
              "https://i.pinimg.com/736x/07/3c/6e/073c6e897bc8e1afc940e9485fa7271c.jpg",  // Riad courtyard
              "https://i.pinimg.com/736x/48/36/cc/4836cc1bcddf502b96e39acee2d5fdce.jpg",  // Desert sunset
              "https://i.pinimg.com/736x/bf/84/fc/bf84fcda0fcc3ead073ffd04ece62f88.jpg",  // Moroccan door
              "https://i.pinimg.com/736x/46/0b/d2/460bd249a56c17cb0c7e62e1d9854e64.jpg",  // Sahara dunes
              "https://i.pinimg.com/736x/14/58/08/1458086ae41e58405bc653099e3edb4b.jpg"   // Moroccan architecture
            ].map((image, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`overflow-hidden rounded-lg shadow-md ${
                  index === 0 || index === 3 ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <img 
                  src={image} 
                  alt={`Maroc en images ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                  style={{ height: index === 0 || index === 3 ? '100%' : '250px' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière de statistiques */}
      <section className="py-16 bg-sahara text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
            >
              <h3 className="text-5xl font-bold mb-2">2000+</h3>
              <p className="text-lg opacity-80">Voyageurs Satisfaits</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-5xl font-bold mb-2">40+</h3>
              <p className="text-lg opacity-80">Destinations Uniques</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-5xl font-bold mb-2">5 ans</h3>
              <p className="text-lg opacity-80">D'Excellence</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Valeurs avec design moderne */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Nos Valeurs Fondamentales</h2>
            <p className="text-xl text-gray-600">
              Ces principes guident chaque aspect de notre travail et de nos relations avec nos voyageurs et partenaires
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow hover:scale-105 duration-300"
            >
              <div className="w-16 h-16 bg-sahara rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                <FaMapMarkedAlt className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Expertise Locale</h3>
              <p className="text-gray-600 text-center">
                Notre équipe locale connaît chaque recoin du Maroc et sélectionne les meilleures expériences pour vous. Nous créons des itinéraires uniques qui révèlent l'âme véritable du pays.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow hover:scale-105 duration-300"
            >
              <div className="w-16 h-16 bg-sahara rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                <FaUserFriends className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Service Personnalisé</h3>
              <p className="text-gray-600 text-center">
                Nous travaillons étroitement avec vous pour créer des voyages qui correspondent exactement à vos envies. Chaque client est unique, et votre voyage doit l'être aussi.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow hover:scale-105 duration-300"
            >
              <div className="w-16 h-16 bg-sahara rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                <FaLeaf className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">Tourisme Durable</h3>
              <p className="text-gray-600 text-center">
                Nous nous engageons à promouvoir des pratiques touristiques qui respectent l'environnement et soutiennent les communautés locales, assurant ainsi un avenir prospère pour tous.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Section de témoignages avec images */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ce que disent nos voyageurs</h2>
            <p className="text-xl text-gray-600">
              Des expériences authentiques partagées par notre communauté
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Premier témoignage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-sahara flex items-center justify-center text-white text-xl font-bold">
                  Y
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold">Youssef Benali</h4>
                  <p className="text-gray-600">Voyage à Chefchaouen</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Une expérience inoubliable dans la ville bleue ! Notre guide local nous a fait découvrir des ruelles cachées et des points de vue spectaculaires. La maison d'hôtes traditionnelle était un véritable havre de paix."
              </p>
            </motion.div>

            {/* Deuxième témoignage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-sahara flex items-center justify-center text-white text-xl font-bold">
                  F
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold">Fatima Zahra</h4>
                  <p className="text-gray-600">Circuit du Sud</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Le circuit dans le Sud marocain était parfaitement organisé. Des nuits magiques dans le désert de Merzouga aux kasbahs majestueuses de Ouarzazate, chaque moment était unique. Un grand merci à toute l'équipe !"
              </p>
            </motion.div>

            {/* Troisième témoignage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 p-8 rounded-2xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-sahara flex items-center justify-center text-white text-xl font-bold">
                  K
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold">Karim Tazi</h4>
                  <p className="text-gray-600">Escapade à Essaouira</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                "Essaouira est un véritable joyau ! Entre les remparts historiques, le port animé et les plages magnifiques, nous avons vécu des moments exceptionnels. La gastronomie locale était délicieuse."
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Section CTA */}
      <section className="py-20 bg-cover bg-center relative" style={{ backgroundImage: `url(${images.ctaBackground || 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})` }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-2xl mx-auto text-center text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Prêt à Explorer le Maroc Authentique?</h2>
            <p className="text-xl mb-8">
              Rejoignez-nous pour une aventure inoubliable à travers les paysages spectaculaires et la riche culture du Maroc. Votre voyage de rêve commence ici.
            </p>
            <div className="flex justify-center">
              <Link 
                to="/contact" 
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-gray-900 transition-colors font-bold text-lg shadow-md hover:shadow-lg no-underline"
                style={{ textDecoration: 'none' }}
              >
                Contacter l'Équipe
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
