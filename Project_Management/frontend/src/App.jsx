import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MainLayout from './components/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';
import Profile from './pages/Profile';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { UIProvider } from './context/UIContext';
import { Toaster } from 'react-hot-toast';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#f7f8f9]">
      <div className="w-10 h-10 border-4 border-[#0c66e4] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/" />;

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#1d2125] transition-colors">
        <Navbar />
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/boards" /> : <Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {['boards', 'templates', 'home', 'members', 'settings', 'export', 'activity'].map(tab => (
              <Route
                key={tab}
                path={`/${tab}`}
                element={
                  <ProtectedRoute>
                    <Dashboard activeTab={tab} />
                  </ProtectedRoute>
                }
              />
            ))}

            <Route
              path="/card/:id"
              element={
                <ProtectedRoute>
                  <ProjectBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<Navigate to="/boards" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            reverseOrder={false}
            toastOptions={{
              className: 'font-bold text-sm rounded-xl px-6 py-4 shadow-2xl border border-gray-100 dark:bg-[#1f2937] dark:text-gray-100 dark:border-gray-700',
              duration: 4000,
            }}
          />
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;