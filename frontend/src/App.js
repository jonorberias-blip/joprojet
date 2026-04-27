import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Home         from './pages/Home';
import Signup       from './pages/Signup';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import ParametresSite from './pages/ParametresSite';
import Livres       from './pages/Livres';
import Membres      from './pages/Membres';
import Emprunts     from './pages/Emprunts';
import Utilisateurs from './pages/Utilisateurs';
import EspaceEtudiant from './pages/EspaceEtudiant';
import { Retards, Reservations } from './pages/RetardsReservations';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  if (user.role === 'etudiant') return <Navigate to="/etudiant" />;
  return children;
}

function EtudiantRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'etudiant') return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/"             element={<Home />} />
      <Route path="/signup"       element={user ? <Navigate to="/etudiant" /> : <Signup />} />
      <Route path="/login" element={user ? (user.role === 'etudiant' ? <Navigate to="/etudiant" /> : <Navigate to="/dashboard" />) : <Login />} />
      <Route path="/etudiant"     element={<EtudiantRoute><EspaceEtudiant /></EtudiantRoute>} />
      <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/livres"       element={<PrivateRoute><Livres /></PrivateRoute>} />
      <Route path="/membres"      element={<PrivateRoute><Membres /></PrivateRoute>} />
      <Route path="/emprunts"     element={<PrivateRoute><Emprunts /></PrivateRoute>} />
      <Route path="/retards"      element={<PrivateRoute><Retards /></PrivateRoute>} />
      <Route path="/reservations" element={<PrivateRoute><Reservations /></PrivateRoute>} />
      <Route path="/utilisateurs" element={<PrivateRoute adminOnly><Utilisateurs /></PrivateRoute>} />
      <Route path="/parametres"   element={<PrivateRoute adminOnly><ParametresSite /></PrivateRoute>} />
      <Route path="*"             element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}