import React from 'react';
import { motion } from 'framer-motion';
import { FaGlobe, FaHandshake, FaHeart } from 'react-icons/fa';
import { images } from '../constants/images';

export default function About() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="container-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">À Propos de MaghrebXplore</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Votre passerelle vers les merveilles du Maroc. Nous rendons l'exploration du Maroc 
              plus accessible, authentique et mémorable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-sahara/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGlobe className="text-2xl text-sahara" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Expertise Locale</h3>
              <p className="text-gray-600">
                Notre équipe locale connaît chaque recoin du Maroc et sélectionne les meilleures expériences pour vous.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-sahara/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHandshake className="text-2xl text-sahara" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Service Personnalisé</h3>
              <p className="text-gray-600">
                Nous travaillons étroitement avec vous pour créer des voyages qui correspondent exactement à vos envies.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-sahara/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-2xl text-sahara" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Passion du Voyage</h3>
              <p className="text-gray-600">
                Notre passion est de partager la beauté et la richesse culturelle du Maroc avec le monde entier.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-full">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
              <p className="text-xl text-gray-600 mb-8">
                Nous nous engageons à promouvoir un tourisme responsable et durable, 
                qui bénéficie aux communautés locales tout en offrant des expériences 
                authentiques à nos voyageurs.
              </p>
              <p className="text-gray-600">
                Chaque voyage que nous organisons est une opportunité de créer des 
                connexions significatives entre les voyageurs et la culture marocaine, 
                tout en préservant les traditions et l'environnement local.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
