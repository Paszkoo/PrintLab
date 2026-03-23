import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import PrintsList from './pages/PrintsList/PrintsList';
import FilamentsList from './pages/FilamentsList/FilamentsList';
import AuthPage from './pages/AuthPage/AuthPage';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { lang, setLang, t } = useLanguage();
  const toggleLang = () => setLang(lang === 'pl' ? 'en' : 'pl');

  return (
    <Router>
      <div className="App">
        <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
          <button
            onClick={toggleLang}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: '#ffffffdd',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            title={lang === 'pl' ? t('lang.english') : t('lang.polish')}
          >
            {lang === 'pl' ? 'PL' : 'EN'}
          </button>
        </div>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/print" element={<ProtectedRoute><PrintsList /></ProtectedRoute>} />
          <Route path="/filament" element={<ProtectedRoute><FilamentsList /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
