import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import JobListings from './pages/JobListings';
import JobDetail from './pages/JobDetail';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import AIInterview from './pages/AIInterview';
import SkillGapAnalyzer from './pages/SkillGapAnalyzer';
import BiasDetector from './pages/BiasDetector';
import CandidatesPage from './pages/CandidatesPage';
import RecruiterPipeline from './pages/RecruiterPipeline';
import AppLayout from './components/layout/AppLayout';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0e0e14'}}>
      <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/candidate'} replace />;
  }
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'recruiter' ? '/dashboard/recruiter' : '/dashboard/candidate'} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16161e',
              color: '#e2e2f0',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              fontSize: '14px'
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } }
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/jobs" element={<JobListings />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* App (authenticated) */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<RoleRedirect />} />
            <Route path="recruiter" element={<ProtectedRoute allowedRoles={['recruiter','admin']}><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="candidate" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
            <Route path="resume" element={<ProtectedRoute allowedRoles={['candidate']}><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="interview" element={<ProtectedRoute allowedRoles={['candidate']}><AIInterview /></ProtectedRoute>} />
            <Route path="skill-gap" element={<ProtectedRoute allowedRoles={['candidate']}><SkillGapAnalyzer /></ProtectedRoute>} />
            <Route path="bias-detector" element={<ProtectedRoute allowedRoles={['recruiter','admin']}><BiasDetector /></ProtectedRoute>} />
            <Route path="candidates" element={<ProtectedRoute allowedRoles={['recruiter','admin']}><CandidatesPage /></ProtectedRoute>} />
            <Route path="pipeline" element={<ProtectedRoute allowedRoles={['recruiter','admin']}><RecruiterPipeline /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
