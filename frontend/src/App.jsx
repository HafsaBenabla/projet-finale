import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

const App = () => {
  return (
    <AuthProvider>
      <VoyagesProvider>
        <Router>
          <div className="flex flex-col min-h-screen font-poppins bg-white text-gray-900 scroll-smooth md:scroll-auto">
            <Navbar />
            <main className="flex-grow pt-20">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/voyages" element={<Voyages />} />
                <Route path="/voyage/:id" element={<VoyageDetail />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/activites" element={<ActivitesHome />} />
                <Route path="/activites-voyages" element={<ActivitesVoyages />} />
                <Route path="/activites-locales" element={<ActivitesLocales />} />
                <Route path="/activities/:id" element={<ActivityDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/city/:cityName" element={<CityAgencies />} />
                <Route path="/agency-voyages/:agencyId" element={<AgencyVoyages />} />
                <Route path="/ajouter-activite" element={<AddActivity />} />
                <Route path="/gestion-activites" element={<ActivitiesManagement />} />
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
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </VoyagesProvider>
    </AuthProvider>
  )
}

export default App
