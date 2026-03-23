import React from 'react';
import '../../../styles/components/FilamentFilterPanel.css';
import { useLanguage } from '../../../LanguageContext';

const FilamentFilterPanel = ({ filters, onFilterChange, filterOptions }) => {
  const { t } = useLanguage();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handleReset = () => {
    onFilterChange({
      type: '',
      prod: '',
      color: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'type',
      sortOrder: 'asc'
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>{t('filaments.filters.title')}</h2>
        <button className="reset-btn" onClick={handleReset}>
          {t('filaments.filters.clear')}
        </button>
      </div>

      <div className="filter-section">
        <h3>{t('filaments.filters.type')}</h3>
        <select
          name="type"
          value={filters.type}
          onChange={handleInputChange}
          className="filter-select"
        >
          <option value="">{t('filaments.filters.type.all')}</option>
          {filterOptions.types.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h3>{t('filaments.filters.producer')}</h3>
        <select
          name="prod"
          value={filters.prod}
          onChange={handleInputChange}
          className="filter-select"
        >
          <option value="">{t('filaments.filters.producer.all')}</option>
          {filterOptions.producers.map(prod => (
            <option key={prod} value={prod}>
              {prod}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <h3>{t('filaments.filters.color')}</h3>
        <select
          name="color"
          value={filters.color}
          onChange={handleInputChange}
          className="filter-select"
        >
          <option value="">{t('filaments.filters.color.all')}</option>
          {filterOptions.colors.map(color => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      {/* <div className="filter-section">
        <h3>Zakres cenowy</h3>
        <div className="price-range">
          <input
            type="number"
            name="priceMin"
            placeholder="Min"
            value={filters.priceMin}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="price-input"
          />
          <div className="price-separator">-</div>
          <input
            type="number"
            name="priceMax"
            placeholder="Max"
            value={filters.priceMax}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="price-input"
          />
          <span className="price-unit">zł/kg</span>
        </div>
      </div> */}

      <div className="filter-section">
        <h3>{t('filaments.filters.sort')}</h3>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleInputChange}
          className="filter-select"
        >
          <option value="type">{t('filaments.filters.sortBy.type')}</option>
          <option value="prod">{t('filaments.filters.sortBy.prod')}</option>
          <option value="priceForKg">{t('filaments.filters.sortBy.price')}</option>
          <option value="createdAt">{t('filaments.filters.sortBy.createdAt')}</option>
        </select>

        <div className="sort-order">
          <label>
            <input
              type="radio"
              name="sortOrder"
              value="asc"
              checked={filters.sortOrder === 'asc'}
              onChange={handleInputChange}
            />
            {t('filaments.filters.order.asc')}
          </label>
          <label>
            <input
              type="radio"
              name="sortOrder"
              value="desc"
              checked={filters.sortOrder === 'desc'}
              onChange={handleInputChange}
            />
            {t('filaments.filters.order.desc')}
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilamentFilterPanel;