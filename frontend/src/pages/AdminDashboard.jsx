import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog, FaPlane, FaBuilding, FaCalendarCheck, FaExclamationTriangle, FaSpinner, FaBookOpen } from 'react-icons/fa';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupérer le token d'authentification du stockage local
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Vous devez être connecté');
        }
        
        // Simuler un chargement pour montrer l'animation
        setTimeout(() => {
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const goToVoyagesManagement = () => {
    navigate('/admin/voyages');
  };

  const goToAgenciesManagement = () => {
    navigate('/admin/agencies');
  };

  const goToReservationsManagement = () => {
    navigate('/admin/reservations');
  };

  const goToActivitiesManagement = () => {
    navigate('/admin/activities');
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Dashboard Administrateur</h2>
          <div className="flex justify-center">
            <FaSpinner className="animate-spin text-orange-500 text-3xl" />
          </div>
          <p className="mt-3 text-gray-600">Chargement des données...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Dashboard Administrateur</h2>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Erreur: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button 
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded" 
            onClick={() => navigate('/')}
          >
            Retour à l'accueil
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center font-bold mb-6" style={{ fontSize: '24px', color: '#333' }}>
        Tableau de <span style={{ color: '#FF8C38' }}>Bord</span> Administratif
      </h2>
      
      <Row>
        {/* Carte Gestion des Activités */}
        <Col md={3} className="mb-4">
          <div style={{ height: '100%' }}>
            <div 
              style={{ 
                background: 'linear-gradient(to right, #FF9E45, #FF8C38)',
                borderRadius: '8px 8px 0 0',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={goToActivitiesManagement}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Gestion des Activités</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                <FaBookOpen style={{ fontSize: '45px', color: 'white' }}/>
              </div>
            </div>
            <div style={{ 
              border: '1px solid #eee', 
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', minHeight: '60px' }}>
                Consultez, ajoutez, modifiez ou supprimez des activités pour les voyages et destinations locales.
              </p>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); goToActivitiesManagement(); }} 
                style={{ 
                  color: '#FF8C38', 
                  textDecoration: 'none', 
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: '#FF8C38', 
                  marginRight: '8px' 
                }}></span>
                Voir toutes les activités
              </a>
            </div>
          </div>
        </Col>
        
        {/* Carte Gestion des Voyages */}
        <Col md={3} className="mb-4">
          <div style={{ height: '100%' }}>
            <div 
              style={{ 
                background: 'linear-gradient(to right, #FF8C38, #FF5733)',
                borderRadius: '8px 8px 0 0',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={goToVoyagesManagement}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Gestion des Voyages</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                <FaPlane style={{ fontSize: '45px', color: 'white' }}/>
              </div>
            </div>
            <div style={{ 
              border: '1px solid #eee', 
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', minHeight: '60px' }}>
                Consultez, ajoutez, modifiez ou supprimez des voyages, circuits et packages touristiques.
              </p>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); goToVoyagesManagement(); }} 
                style={{ 
                  color: '#FF8C38', 
                  textDecoration: 'none', 
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: '#FF8C38', 
                  marginRight: '8px' 
                }}></span>
                Voir tous les voyages
              </a>
            </div>
          </div>
        </Col>
        
        {/* Carte Gestion des Agences */}
        <Col md={3} className="mb-4">
          <div style={{ height: '100%' }}>
            <div 
              style={{ 
                background: 'linear-gradient(to right, #FF5733, #E02954)',
                borderRadius: '8px 8px 0 0',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={goToAgenciesManagement}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Gestion des Agences</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                <FaBuilding style={{ fontSize: '45px', color: 'white' }}/>
              </div>
            </div>
            <div style={{ 
              border: '1px solid #eee', 
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', minHeight: '60px' }}>
                Consultez, ajoutez, modifiez ou supprimez des agences partenaires et leurs informations.
              </p>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); goToAgenciesManagement(); }} 
                style={{ 
                  color: '#FF8C38', 
                  textDecoration: 'none', 
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: '#FF8C38', 
                  marginRight: '8px' 
                }}></span>
                Voir toutes les agences
              </a>
            </div>
          </div>
        </Col>
        
        {/* Carte Gestion des Réservations */}
        <Col md={3} className="mb-4">
          <div style={{ height: '100%' }}>
            <div 
              style={{ 
                background: 'linear-gradient(to right, #E02954, #B01C66)',
                borderRadius: '8px 8px 0 0',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={goToReservationsManagement}
            >
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Gestion des Réservations</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                <FaCalendarCheck style={{ fontSize: '45px', color: 'white' }}/>
              </div>
            </div>
            <div style={{ 
              border: '1px solid #eee', 
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px', minHeight: '60px' }}>
                Consultez et gérez les réservations d'activités et de voyages des clients.
              </p>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); goToReservationsManagement(); }} 
                style={{ 
                  color: '#FF8C38', 
                  textDecoration: 'none', 
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  backgroundColor: '#FF8C38', 
                  marginRight: '8px' 
                }}></span>
                Voir toutes les réservations
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 