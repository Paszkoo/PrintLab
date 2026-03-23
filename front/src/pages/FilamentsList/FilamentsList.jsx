import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import FilamentFilterPanel from '../../components/forms/FilamentFilterPanel/FilamentFilterPanel';
import FilamentCard from '../../components/cards/FilamentCard/FilamentCard';
import AddFilamentModal from '../../components/modals/AddFilamentModal/AddFilamentModal';
import '../../styles/pages/FilamentsList.css';
import '../../styles/components/List.css';
import { useLanguage } from '../../LanguageContext';


const FilamentsList = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filaments, setFilaments] = useState([]);
  const [filteredFilaments, setFilteredFilaments] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    producers: [],
    colors: []
  });
  const [filters, setFilters] = useState({
    type: '',
    prod: '',
    color: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'type',
    sortOrder: 'asc'
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);


  useEffect(() => {
    fetchFilaments();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filaments, filters]);

  const fetchFilaments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/filaments');
      setFilaments(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania filamentów:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/filaments/filter-options');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania opcji filtrów:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...filaments];

    // Filtrowanie po typie
    if (filters.type) {
      filtered = filtered.filter(filament => 
        filament.type === filters.type
      );
    }

    // Filtrowanie po producencie
    if (filters.prod) {
      filtered = filtered.filter(filament => 
        filament.prod === filters.prod
      );
    }

    // Filtrowanie po kolorze
    if (filters.color) {
      filtered = filtered.filter(filament => 
        filament.colors && filament.colors.includes(filters.color)
      );
    }

    // Filtrowanie po cenie minimalnej
    if (filters.priceMin !== '') {
      const minPrice = Number(filters.priceMin);
      filtered = filtered.filter(filament => 
        filament.priceForKg >= minPrice
      );
    }

    // Filtrowanie po cenie maksymalnej
    if (filters.priceMax !== '') {
      const maxPrice = Number(filters.priceMax);
      filtered = filtered.filter(filament => 
        filament.priceForKg <= maxPrice
      );
    }

    // Sortowanie
    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = filters;
      let aValue, bValue;

      switch (sortBy) {
        case 'priceForKg':
          aValue = a.priceForKg || 0;
          bValue = b.priceForKg || 0;
          break;
        case 'type':
          aValue = a.type || '';
          bValue = b.type || '';
          break;
        case 'prod':
          aValue = a.prod || '';
          bValue = b.prod || '';
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredFilaments(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleAddFilament = async (filamentData) => {
    try {
      await api.post('/filaments', filamentData);
      fetchFilaments();
      setShowAddModal(false);
    } catch (error) {
      console.error('Błąd podczas dodawania filamentu:', error);
    }
  };

  const handleUpdateFilament = async (id, filamentData) => {
    try {
      await api.put(`/filaments/${id}`, filamentData);
      fetchFilaments();
    } catch (error) {
      console.error('Błąd podczas aktualizacji filamentu:', error);
    }
  };

  const handleDeleteFilament = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten filament?')) {
      try {
        await api.delete(`/filaments/${id}`);
        fetchFilaments();
      } catch (error) {
        console.error('Błąd podczas usuwania filamentu:', error);
      }
    }
  };

  return (
    <div className="filaments-list">
      <header className="filaments-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/')}>
            {t('common.back')}
          </button>
          <h1>{t('filaments.title')}</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            {t('filaments.add')}
          </button>
        </div>
      </header>

      <div className="filaments-container">
        <FilamentFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
        />

        <div className="filaments-content">
          <div className="filaments-stats">
            <p>{t('filaments.found')} {filteredFilaments.length} {t('filaments.items')}</p>
            <p>{t('filaments.all')} {filaments.length} {t('filaments.items')}</p>
          </div>

          {loading ? (
            <div className="loading">{t('filaments.loading')}</div>
          ) : (
            <div className="filaments-grid">
              {filteredFilaments.map(filament => (
                <FilamentCard
                  key={filament._id}
                  filament={filament}
                  onUpdate={handleUpdateFilament}
                  onDelete={handleDeleteFilament}
                  filterOptions={filterOptions}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddFilamentModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddFilament}
          filterOptions={filterOptions}
        />
      )}
    </div>
  );
};

export default FilamentsList;