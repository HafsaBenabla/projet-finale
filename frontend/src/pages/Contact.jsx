import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { IoSendSharp } from 'react-icons/io5';
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

// ⚠️ IMPORTANT : REMPLACEZ CES VALEURS PAR VOS IDENTIFIANTS RÉELS EMAILJS ⚠️
// Si vous ne les remplacez pas, le formulaire ne fonctionnera pas et aucun email ne sera envoyé
const SERVICE_ID = 'service_id'; // Remplacez par votre service ID EmailJS
const TEMPLATE_ID = 'template_id'; // Remplacez par votre template ID EmailJS
const PUBLIC_KEY = 'public_key'; // Remplacez par votre clé publique EmailJS

/*
==================== CONFIGURATION EMAILJS ====================
Pour que ce formulaire de contact fonctionne, vous devez suivre ces étapes:

1. Créez un compte gratuit sur EmailJS: https://www.emailjs.com/

2. Dans votre tableau de bord EmailJS, créez un service email:
   - Cliquez sur "Add New Service"
   - Sélectionnez Gmail (ou un autre fournisseur de messagerie)
   - Connectez votre compte Gmail et suivez les instructions

3. Créez un modèle d'email:
   - Allez dans la section "Email Templates"
   - Cliquez sur "Create New Template"
   - Configurez le modèle comme ceci:
     * To Name: Votre nom
     * To Email: benablahafsa@gmail.com
     * From Name: {{name}}
     * Reply To: {{email}}
     * Subject: {{subject}}
     * Message: {{message}}

4. Remplacez les constantes ci-dessus par vos propres identifiants:
   - SERVICE_ID: Trouvé dans la section "Email Services" (ex: 'service_abc123')
   - TEMPLATE_ID: Trouvé dans la section "Email Templates" (ex: 'template_xyz789')
   - PUBLIC_KEY: Trouvé dans "Account" > "API Keys" (ex: 'user_pqr456')

IMPORTANT: 
- EmailJS a un plan gratuit qui permet d'envoyer 200 emails par mois.
- DÉSACTIVEZ LA SIMULATION en passant USE_MOCK_EMAIL à false ci-dessous.
=================================================================
*/

// Définir cette variable sur false pour envoyer de vrais emails
const USE_MOCK_EMAIL = true; // Mode simulation activé pour éviter les erreurs d'identifiants EmailJS

const Contact = () => {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    status: 'idle', // 'idle', 'submitting', 'success', 'error'
    message: '',
    isOutsideBusinessHours: false
  });

  // Fonction pour vérifier si l'heure actuelle est en dehors des heures de travail
  const checkBusinessHours = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (dimanche) à 6 (samedi)
    const hours = now.getHours(); // 0-23
    
    // Vérifier si c'est le weekend (0 = dimanche, 6 = samedi)
    if (dayOfWeek === 0) {
      return true; // Dimanche: fermé toute la journée
    }
    
    if (dayOfWeek === 6 && hours >= 13) {
      return true; // Samedi après 13h: fermé
    }
    
    // Vérifier si c'est en dehors des heures de bureau en semaine (lundi-vendredi)
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && (hours < 9 || hours >= 18)) {
      return true; // Lundi-Vendredi: fermé avant 9h et après 18h
    }
    
    return false; // Dans les heures d'ouverture
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    // Valider que tous les champs sont remplis
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormStatus({
        status: 'error',
        message: 'Veuillez remplir tous les champs.'
      });
      return false;
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        status: 'error',
        message: 'Veuillez entrer une adresse email valide.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider le formulaire avant soumission
    if (!validateForm()) {
      return;
    }

    // Vérifier si nous sommes en dehors des heures de travail
    const isOutsideBusinessHours = checkBusinessHours();

    setFormStatus({
      status: 'submitting',
      message: 'Envoi en cours...',
      isOutsideBusinessHours
    });

    try {
      // S'assurer que le mode simulation est actif pour éviter les erreurs d'identifiants
      const useSimulation = USE_MOCK_EMAIL || !SERVICE_ID || SERVICE_ID === 'service_id' || !TEMPLATE_ID || !PUBLIC_KEY;
      
      if (useSimulation) {
        // Simulation d'envoi d'email pour test
        console.log('Simulation d\'envoi d\'email:', {
          to: 'benablahafsa@gmail.com',
          from: `${formData.name} <${formData.email}>`,
          subject: formData.subject,
          message: formData.message,
          sentOutsideBusinessHours: isOutsideBusinessHours,
          simulationMode: true
        });
        
        // Simuler un délai d'envoi
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Succès simulé
        console.log('Email simulé envoyé avec succès!');
      } else {
        // Envoyer le formulaire réellement avec EmailJS
        const result = await emailjs.sendForm(
          SERVICE_ID,
          TEMPLATE_ID,
          formRef.current,
          PUBLIC_KEY
        );
        console.log('Email envoyé avec succès!', result.text);
      }
      
      // Réinitialiser le formulaire et mettre à jour le statut
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setFormStatus({
        status: 'success',
        message: 'Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
        isOutsideBusinessHours
      });
      
      // Réinitialiser le statut après 5 secondes
      setTimeout(() => {
        setFormStatus({
          status: 'idle',
          message: '',
          isOutsideBusinessHours: false
        });
      }, 5000);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      const useSimulation = USE_MOCK_EMAIL || !SERVICE_ID || SERVICE_ID === 'service_id';
      let errorMessage;
      
      if (useSimulation) {
        errorMessage = 'Erreur simulée lors de l\'envoi du message.';
      } else {
        errorMessage = 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez vérifier les identifiants EmailJS ou réessayer plus tard.';
      }
      
      setFormStatus({
        status: 'error',
        message: errorMessage,
        isOutsideBusinessHours: checkBusinessHours()
      });
    }
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-white">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              <span className="block text-orange-500 mb-2">Contactez-nous</span>
              <span className="block text-3xl md:text-4xl font-medium">Notre équipe est à votre écoute</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une question ? Un projet de voyage ? Nous sommes là pour vous aider 
              à planifier votre prochaine aventure au Maroc.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16">
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:pr-8 lg:border-r border-gray-100"
            >
              <h2 className="text-2xl font-bold mb-8 text-gray-900">Nos Coordonnées</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-xl text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Notre Adresse</h3>
                    <p className="text-gray-600">
                      123 Avenue Mohammed V<br />
                      Marrakech, Maroc
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-xl text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
                    <p className="text-gray-600">+212 5XX-XXXXXX</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-xl text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600">contact@maghrebxplore.com</p>
                  </div>
                </div>
              </div>

              {/* Horaires d'ouverture */}
              <div className="mt-12 p-6 bg-orange-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Lundi - Vendredi: 9h00 - 18h00</p>
                  <p>Samedi: 9h00 - 13h00</p>
                  <p>Dimanche: Fermé</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-2xl font-bold mb-8 text-gray-900">Envoyez-nous un message</h2>
              
              {formStatus.status === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message envoyé !</h3>
                  <p className="text-green-700">{formStatus.message}</p>
                  
                  {/* Message pour les heures hors travail */}
                  {formStatus.isOutsideBusinessHours && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700">
                        <strong>Note :</strong> Votre message a été envoyé en dehors de nos heures d'ouverture. 
                        Notre équipe le traitera dès le prochain jour ouvrable.
                      </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setFormStatus(prev => ({ ...prev, status: 'idle' }))}
                    className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  {formStatus.status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                      <p>{formStatus.message}</p>
                      
                      {/* Afficher un message sur les heures de travail même en cas d'erreur */}
                      {formStatus.isOutsideBusinessHours && (
                        <p className="mt-2">
                          <strong>Note :</strong> Nous sommes actuellement en dehors de nos heures d'ouverture. 
                          Notre équipe sera disponible le prochain jour ouvrable.
                        </p>
                      )}
                      
                      {!USE_MOCK_EMAIL && (
                        <p className="mt-2 text-sm">
                          Pour tester le formulaire en mode démo, veuillez contacter l'administrateur du site.
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Sujet de votre message"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Votre message..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className={`w-full px-6 py-3 ${formStatus.status === 'submitting' ? 'bg-orange-400' : 'bg-orange-500'} text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-300 flex justify-center items-center`}
                    disabled={formStatus.status === 'submitting'}
                  >
                    {formStatus.status === 'submitting' ? (
                      'Envoi en cours...'
                    ) : (
                      <>
                        Envoyer <IoSendSharp className="send-icon" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
