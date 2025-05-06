import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';

const AgencyActivities = () => {
  const { agencyId } = useParams();
  const [agency, setAgency] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data for agency ID:', agencyId);

        // Récupérer les détails de l'agence
        const agencyResponse = await axios.get(`http://localhost:5000/api/agencies/${agencyId}`);
        console.log('Agency details:', agencyResponse.data);
        setAgency(agencyResponse.data);

        // Récupérer les activités de l'agence
        console.log('Fetching activities for agency...');
        const activitiesResponse = await axios.get(`http://localhost:5000/api/activities/by-agency/${agencyId}`);
        console.log('Activities received:', activitiesResponse.data);
        setActivities(activitiesResponse.data);

      } catch (err) {
        console.error('Error details:', err.response || err);
        setError(err.response?.data?.message || err.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) {
      fetchData();
    }
  }, [agencyId]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Chargement des données...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {agency && (
        <div className="mb-5 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
            <img
              src={agency.image}
              alt={agency.name}
              className="rounded-lg w-32 h-32 object-cover shadow-md"
            />
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2 text-gray-800">{agency.name}</h1>
              <div className="text-gray-600 space-y-1">
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-orange-500">📍</span> {agency.city}
                </p>
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-orange-500">⭐</span> {agency.stars} étoiles
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed border-t pt-4">{agency.description}</p>
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {activities.length > 0 
          ? `Activités proposées par ${agency?.name}`
          : `Aucune activité disponible pour ${agency?.name}`
        }
      </h2>
      
      {activities.length === 0 ? (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <p className="text-orange-700">
            Cette agence n'a pas encore d'activités disponibles.
          </p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {activities.map((activity) => (
            <Col key={activity._id}>
              <Card className="h-100 shadow-sm hover:shadow-lg transition-all duration-300 border-0">
                <div className="aspect-w-16 aspect-h-9">
                  <Card.Img
                    variant="top"
                    src={activity.image}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <Card.Body className="p-4">
                  <Card.Title className="text-xl font-semibold mb-2">{activity.name}</Card.Title>
                  <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
                    <span>📍 {activity.city}</span>
                    <span>•</span>
                    <span>⏱️ {activity.duration}h</span>
                  </div>
                  <Card.Text className="text-gray-600 mb-3 line-clamp-2">
                    {activity.description}
                  </Card.Text>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t">
                    <span className="text-xl font-bold text-orange-500">{activity.price} MAD</span>
                    <a
                      href={`/activities/${activity._id}`}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                    >
                      Voir les détails
                    </a>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default AgencyActivities; 