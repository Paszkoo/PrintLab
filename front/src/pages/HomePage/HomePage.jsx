import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/HomePage.css';
import { useLanguage } from '../../LanguageContext';
import { useAuth } from '../../AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
          {user && (
            <p className="home-welcome">
              {t('home.welcome')}, <strong>{user.name}</strong>
            </p>
          )}
        </header>
        
        <div className="home-buttons">
          <button 
            className="home-button prints-list-btn"
            onClick={() => navigate('/print')}
          >
            <div className="button-icon"></div>
            <div className="button-text">
              <h3>{t('home.printsList')}</h3>
              <p>{t('home.printsList.desc')}</p>
            </div>
          </button>

          <button 
            className="home-button prints-list-btn"
            onClick={() => navigate('/filament')}
          >
            <div className="button-icon"></div>
            <div className="button-text">
              <h3>{t('home.filamentsList')}</h3>
              <p>{t('home.filamentsList.desc')}</p>
            </div>
          </button>
          
          <button 
            className="home-button exit-btn"
            onClick={handleLogout}
          >
            <div className="button-icon"></div>
            <div className="button-text">
              <h3>{t('home.logout')}</h3>
              <p>{t('home.logout.desc')}</p>
            </div>
          </button>
        </div>
        
        <footer className="home-footer">
          <p>{t('home.version')}</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
