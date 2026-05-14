import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Verification from './pages/Verification';
import VerifyCard from './pages/VerifyCard';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Requests from './pages/admin/Requests';
import Documents from './pages/admin/Documents';
import Verifications from './pages/admin/Verifications';
import Citizens from './pages/admin/Citizens';
import Blockchain from './pages/admin/Blockchain';

import Settings from './pages/admin/Settings';
import CitizenLayout from './pages/citizen/CitizenLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenRequests from './pages/citizen/CitizenRequests';
import CitizenWallet from './pages/citizen/CitizenWallet';
import ProtectedRoute from './components/auth/ProtectedRoute';
import About from './pages/About';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verification />} />
          <Route path="/verify-card/:numeroCarte" element={<VerifyCard />} />
          
          {/* Citizen Nested Routes */}
          <Route path="/citizen" element={<ProtectedRoute role="CITOYEN"><CitizenLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="requests" element={<CitizenRequests />} />
            <Route path="wallet" element={<CitizenWallet />} />
          </Route>

          {/* Admin Nested Routes */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<Requests />} />
            <Route path="documents" element={<Documents />} />
            <Route path="verifications" element={<Verifications />} />
            <Route path="citizens" element={<Citizens />} />
            <Route path="blockchain" element={<Blockchain />} />

            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/about" element={<About />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
