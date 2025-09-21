import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import UserForm from './components/UserForm';
import BulkCreateUsers from './components/BulkCreateUsers';
import ProdiDashboard from './pages/ProdiDashboard';
import ProdiForm from './components/ProdiForm';
import MataKuliahDashboard from './pages/MataKuliahDashboard';
import MataKuliahForm from './components/MataKuliahForm';
import KelasDashboard from './pages/KelasDashboard';
import KelasForm from './components/KelasForm';
import RuanganDashboard from './pages/RuanganDashboard';
import RuanganForm from './components/RuanganForm';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// App Routes component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/create"
        element={
          <ProtectedRoute>
            <UserForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/edit/:id"
        element={
          <ProtectedRoute>
            <UserForm isEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/bulk-create"
        element={
          <ProtectedRoute>
            <BulkCreateUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prodi"
        element={
          <ProtectedRoute>
            <ProdiDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prodi/create"
        element={
          <ProtectedRoute>
            <ProdiForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prodi/edit/:id"
        element={
          <ProtectedRoute>
            <ProdiForm isEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mata-kuliah"
        element={
          <ProtectedRoute>
            <MataKuliahDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mata-kuliah/create"
        element={
          <ProtectedRoute>
            <MataKuliahForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mata-kuliah/edit/:id"
        element={
          <ProtectedRoute>
            <MataKuliahForm isEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas"
        element={
          <ProtectedRoute>
            <KelasDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/create"
        element={
          <ProtectedRoute>
            <KelasForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kelas/edit/:id"
        element={
          <ProtectedRoute>
            <KelasForm isEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ruangan"
        element={
          <ProtectedRoute>
            <RuanganDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ruangan/create"
        element={
          <ProtectedRoute>
            <RuanganForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ruangan/edit/:id"
        element={
          <ProtectedRoute>
            <RuanganForm isEdit />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;