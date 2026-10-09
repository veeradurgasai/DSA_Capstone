import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { LostItemsPage } from './pages/LostItemsPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { MatchPage } from './pages/MatchPage';
import { CampusMapPage } from './pages/CampusMapPage';
import { SearchPage } from './pages/SearchPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/lost" element={<LostItemsPage />} />
              <Route path="/found" element={<FoundItemsPage />} />
              <Route path="/lost/:id" element={<ItemDetailsPage type="LOST" />} />
              <Route path="/found/:id" element={<ItemDetailsPage type="FOUND" />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/map" element={<CampusMapPage />} />

              {/* Match routes */}
              <Route path="/matches/lost/:id" element={<MatchPage queryType="lost" />} />
              <Route path="/matches/found/:id" element={<MatchPage queryType="found" />} />
              <Route path="/matches/:id" element={<MatchPage queryType="direct" />} />

              {/* Protected Student Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/report-lost" element={<ProtectedRoute><ReportLostPage /></ProtectedRoute>} />
              <Route path="/report-found" element={<ProtectedRoute><ReportFoundPage /></ProtectedRoute>} />
              <Route path="/claims" element={<ProtectedRoute><ClaimsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;