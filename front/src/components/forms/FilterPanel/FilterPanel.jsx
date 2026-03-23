import React from 'react';
import '../../../styles/components/FilterPanel.css';
import { useLanguage } from '../../../LanguageContext';

const FilterPanel = ({ filters, onFilterChange, filterOptions }) => {
  const { t } = useLanguage();
  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const handleCheckboxChange = (mode) => {
    // Jeśli checkbox jest już zaznaczony, odznacz go (ustaw na '')
    // Jeśli nie jest zaznaczony, zaznacz go
    switch(mode){
      case "vaseMode": 
        if(filters.vaseMode === true){
          handleChange("vaseMode", false)
        }else handleChange("vaseMode", true)
        break;
      case "fuzzyMode":
        if(filters.fuzzyMode === true){
          handleChange("fuzzyMode", false)
        }else handleChange("fuzzyMode", true)
        break;
    }
  };

  const clearFilters = () => {
    onFilterChange({
      vaseMode: '',
      fuzzyMode: '',
      category: '',
      filament_type: '',
      size_type: '',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>{t('prints.filters.title')}</h3>
        <button className="clear-filters-btn" onClick={clearFilters}>
          {t('prints.filters.clear')}
        </button>
      </div>

      <div className="filter-group">
        
        <label>
          <input
            type="checkbox"
            name="printMode.vaseMode"
            checked={filters.vaseMode === true}
            onChange={() => handleCheckboxChange('vaseMode')}
          />
          {t('prints.filters.vaseMode')}
        </label>
        <label>
          <input
            type="checkbox"
            name="printMode.fuzzyMode"
            checked={filters.fuzzyMode === true}
            onChange={() => handleCheckboxChange('fuzzyMode')}
          />
          {t('prints.filters.fuzzyMode')}
        </label>
      </div>

      <div className="filter-group">
        <label>{t('prints.filters.filamentType')}</label>
        <select
          value={filters.filament_type}
          onChange={(e) => handleChange('filament_type', e.target.value)}
        >
          <option value="">{t('prints.filters.all')}</option>
          {filterOptions.filamentTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>{t('prints.filters.category')}</label>
        <select
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="">{t('prints.filters.all')}</option>
          {filterOptions.categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>


      <div className="filter-group">
        <label>{t('prints.filters.sortBy')}</label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <option value="name">{t('prints.filters.sortBy.name')}</option>
          <option value="quantity">{t('prints.filters.sortBy.quantity')}</option>
          <option value="printTime">{t('prints.filters.sortBy.printTime')}</option>
          <option value="price">{t('prints.filters.sortBy.price')}</option>
          <option value="category">{t('prints.filters.sortBy.category')}</option>
          <option value="filament_type">{t('prints.filters.sortBy.filamentType')}</option>
          <option value="createdAt">{t('prints.filters.sortBy.createdAt')}</option>
        </select>
      </div>

      <div className="filter-group">
        <label>{t('prints.filters.order')}</label>
        <select
          value={filters.sortOrder}
          onChange={(e) => handleChange('sortOrder', e.target.value)}
        >
          <option value="asc">{t('prints.filters.order.asc')}</option>
          <option value="desc">{t('prints.filters.order.desc')}</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;