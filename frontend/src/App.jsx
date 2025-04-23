import React, { Suspense, Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Voyages from './pages/Voyages'
import VoyageDetail from './pages/VoyageDetail'
import PackageDetail from './pages/PackageDetail'
import ActivitesHome from './pages/ActivitesHome'
import ActivitesVoyages from './pages/ActivitesVoyages'
import ActivitesLocales from './pages/ActivitesLocales'
import ActivityDetail from './pages/ActivityDetail'
import AddNew from './pages/AddNew'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CityAgencies from './pages/CityAgencies'
import AgencyVoyages from './pages/AgencyVoyages'
import AddActivity from './pages/AddActivity'
import ActivitiesManagement from './pages/ActivitiesManagement'
import VoyagesManagement from './pages/VoyagesManagement'
import AgenciesManagement from './pages/AgenciesManagement'
import ReservationsManagement from './pages/ReservationsManagement'
import AdminDashboard from './pages/AdminDashboard'
import { VoyagesProvider } from './context/VoyagesContext'
import { AuthProvider } from './context/AuthContext'
import AdminRoute from './components/AdminRoute'

// Composant ErrorBoundary plus robuste
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erreur capturée:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Une erreur est survenue</h1>
            <p className="text-gray-700 mb-4">
              Nous sommes désolés pour ce problème.
            </p>
            <div className="mb-4 flex justify-center space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Recharger
              </button>
              <button 
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant de chargement simplifié
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    <p className="ml-3">Chargement...</p>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <VoyagesProvider>
          <Router>
            <div className="flex flex-col min-h-screen font-poppins bg-white text-gray-900">
              <Navbar />
              <main className="flex-grow pt-20">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/voyages" element={<Voyages />} />
                    <Route path="/voyage/:id" element={<VoyageDetail />} />
                    <Route path="/packages/:id" element={<PackageDetail />} />
                    <Route path="/activites" element={<ActivitesHome />} />
                    <Route path="/activites-voyages" element={<ActivitesVoyages />} />
                    <Route path="/activites-locales" element={<ActivitesLocales />} />
                    <Route path="/activities/:id" element={<ActivityDetail />} />
                    <Route path="/activite/:id" element={<ActivityDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/city/:cityName" element={<CityAgencies />} />
                    <Route path="/city-agencies/:cityName" element={<CityAgencies />} />
                    <Route path="/agency-voyages/:agencyId" element={<AgencyVoyages />} />
                    
                    {/* Routes administratives */}
                    <Route path="/admin/dashboard" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/add" element={
                      <AdminRoute>
                        <AddNew />
                      </AdminRoute>
                    } />
                    <Route path="/admin/activities" element={
                      <AdminRoute>
                        <ActivitiesManagement />
                      </AdminRoute>
                    } />
                    <Route path="/admin/voyages" element={
                      <AdminRoute>
                        <VoyagesManagement />
                      </AdminRoute>
                    } />
                    <Route path="/admin/agencies" element={
                      <AdminRoute>
                        <AgenciesManagement />
                      </AdminRoute>
                    } />
                    <Route path="/admin/reservations" element={
                      <AdminRoute>
                        <ReservationsManagement />
                      </AdminRoute>
                    } />
                    
                    {/* Routes alternatives */}
                    <Route path="/ajouter-activite" element={<AddActivity />} />
                    <Route path="/gestion-activites" element={<ActivitiesManagement />} />
                    
                    {/* Route de redirection fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </VoyagesProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
