import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'
import RoutesPage from './pages/RoutesPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import DriverDashboard from './components/DriverDashboard'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'

function HomeRoute() {
  const { profile, loading } = useAuth();
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2 text-gray-500 font-medium">
        <Loader2 className="h-5 w-5 animate-spin text-red-600" /> {t('loadingLabel')}
      </div>
    );
  }
  if (profile?.role === 'driver') return <DriverDashboard />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </AuthProvider>
  )
}
