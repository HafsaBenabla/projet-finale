import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Contact() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contactez-nous</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une question ? Un projet de voyage ? Notre équipe est là pour vous aider 
              à planifier votre prochaine aventure au Maroc.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-20">
        <div className="container-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold mb-8">Nos Coordonnées</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sahara/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-xl text-sahara" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Notre Adresse</h3>
                    <p className="text-gray-600">
                      123 Avenue Mohammed V<br />
                      Marrakech, Maroc
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sahara/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-xl text-sahara" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Téléphone</h3>
                    <p className="text-gray-600">+212 5XX-XXXXXX</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-sahara/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-xl text-sahara" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Email</h3>
                    <p className="text-gray-600">contact@maghrebxplore.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    placeholder="Sujet de votre message"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sahara focus:border-transparent"
                    placeholder="Votre message..."
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Envoyer le message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
