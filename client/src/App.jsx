import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Sidebar from './components/layout/Sidebar';
import AddOpportunityModal from './components/opportunities/AddOpportunityModal';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Resumes from './pages/Resumes';
import Login from './pages/Login';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('mysafar_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// App Layout with Sidebar (only for authenticated users)
const MainLayout = ({ children, onAddClick }) => (
  <div className="app-layout">
    <Sidebar onAddClick={onAddClick} />
    <main className="main-content">
      {children}
    </main>
  </div>
);

function App() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = () => {
    setRefreshKey(k => k + 1);
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing-client-id';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout onAddClick={() => setShowAddModal(true)}>
                <Dashboard key={`dashboard-${refreshKey}`} />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout onAddClick={() => setShowAddModal(true)}>
                <Profile key={`profile-${refreshKey}`} />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/resumes" element={
            <ProtectedRoute>
              <MainLayout onAddClick={() => setShowAddModal(true)}>
                <Resumes key={`resumes-${refreshKey}`} />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* Only show modal when layout is active */}
        {localStorage.getItem('mysafar_token') && (
          <AddOpportunityModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSaved={handleSaved}
          />
        )}
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
