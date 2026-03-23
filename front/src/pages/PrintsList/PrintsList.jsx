import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import FilterPanel from '../../components/forms/FilterPanel/FilterPanel';
import PrintCard from '../../components/cards/PrintCard/PrintCard';
import AddPrintModal from '../../components/modals/AddPrintModal/AddPrintModal';
import PricingSettingsModal from '../../components/modals/PricingSettingsModal/PricingSettingsModal';
import '../../styles/pages/PrintsList.css';
import '../../styles/components/List.css';
import { useLanguage } from '../../LanguageContext';

const PrintsList = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [filaments, setFilaments] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    filamentTypes: [],
    sizeTypes: [],
    categories: []
  });
  const [filters, setFilters] = useState({
    vaseMode: '',
    fuzzyMode: '',
    category: '',
    filament_type: '',
    size_type: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [electricityPrice, setElectricityPrice] = useState(1.10);
  const [pricingSettings, setPricingSettings] = useState(null);


  useEffect(() => {
    fetchModels();
    fetchFilterOptions();
    fetchFilamentsForPrices();
    fetchPricingSettings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [models, filters]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/models');
      setModels(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania modeli:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/filter-options');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania opcji filtrów:', error);
    }
  };

  const fetchFilamentsForPrices = async () => {
    try {
      const response = await api.get('/filaments');
      setFilaments(response.data || []);
    } catch (error) {
      console.error('Błąd podczas pobierania cen filamentów:', error);
    }
  };

  const fetchPricingSettings = async () => {
    try {
      const response = await api.get('/pricing-settings');
      setPricingSettings(response.data);
      setElectricityPrice(response.data.electricityPricePerKwh);
    } catch (error) {
      console.error('Błąd podczas pobierania ustawień cenowych:', error);
      setPricingSettings({
        packagingCost: 5,
        shippingPrices: { mini: 8, small: 12, medium: 15, big: 25 },
        electricityPricePerKwh: 1.10,
        marginPercent: 20,
        currency: 'zł'
      });
    }
  };

  const getFilamentObj = (fv) => fv.filament || {};
  const getFilamentId = (fv) => {
    if (!fv.filament) return null;
    return typeof fv.filament === 'object' ? fv.filament._id : fv.filament;
  };

  const sumQuantity = (m) => Array.isArray(m?.filamentVariants)
    ? m.filamentVariants.reduce((sumF, fv) => sumF + (
        Array.isArray(fv.colorVariants)
          ? fv.colorVariants.reduce((s, cv) => s + (Number(cv.quantity) || 0), 0)
          : 0
      ), 0)
    : 0;

  const applyFilters = () => {
    let filtered = [...models];

    if (filters.vaseMode) {
      filtered = filtered.filter(model => model.printMode?.vaseMode === true);
    }
    
    if (filters.fuzzyMode) {
      filtered = filtered.filter(model => model.printMode?.fuzzyMode === true);
    }

    if (filters.filament_type) {
      filtered = filtered.filter(model =>
        Array.isArray(model.filamentVariants) &&
        model.filamentVariants.some(fv => getFilamentObj(fv).type === filters.filament_type)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(model => (model.category || '') === filters.category);
    }
    
    if (filters.size_type) {
      filtered = filtered.filter(model => model.size?.type === filters.size_type);
    }

    filtered.sort((a, b) => {
      const { sortBy, sortOrder } = filters;
      let aValue, bValue;

      switch (sortBy) {
        case 'quantity':
          aValue = sumQuantity(a);
          bValue = sumQuantity(b);
          break;
        case 'printTime':
          aValue = (a.printTimeHours || 0) * 60 + (a.printTimeMinutes || 0);
          bValue = (b.printTimeHours || 0) * 60 + (b.printTimeMinutes || 0);
          break;
        case 'price': {
          const aFil = Array.isArray(a.filamentVariants) && a.filamentVariants.length > 0 ? getFilamentObj(a.filamentVariants[0]) : {};
          const bFil = Array.isArray(b.filamentVariants) && b.filamentVariants.length > 0 ? getFilamentObj(b.filamentVariants[0]) : {};
          aValue = computeUnitTotalWithShipping(a, aFil);
          bValue = computeUnitTotalWithShipping(b, bFil);
          break;
        }
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

    setFilteredModels(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };
  
  const handleQuantityChange = async (model_id, color, newQuantity, filamentId) => {
    try {
      const current = models.find(m => m._id === model_id);
      if (!current) return;

      const updatedFv = Array.isArray(current.filamentVariants) ? current.filamentVariants.map(fv => {
        const fId = getFilamentId(fv);
        if (fId === filamentId) {
          const updatedColors = Array.isArray(fv.colorVariants)
            ? fv.colorVariants.map(cv => cv.color === color ? { ...cv, quantity: Number(newQuantity) || 0 } : cv)
            : [];
          return { filament: fId, colorVariants: updatedColors };
        }
        return { filament: fId, colorVariants: fv.colorVariants };
      }) : [];

      await api.put(`/models/${model_id}`, { filamentVariants: updatedFv });
      fetchModels();
    } catch (error) {
      console.error('Błąd podczas aktualizacji stanu magazynowego:', error);
    }
  };

  const handleAddModel = async (modelData) => {
    try {
      await api.post('/models', modelData);
      fetchModels();
      setShowAddModal(false);
    } catch (error) {
      console.error('Błąd podczas dodawania modelu:', error);
    }
  };

  const handleUpdateModel = async (id, modelData) => {
    try {
      await api.put(`/models/${id}`, modelData);
      fetchModels();
    } catch (error) {
      console.error('Błąd podczas aktualizacji modelu:', error);
    }
  };

  const handlePricingSettingsUpdate = (newSettings) => {
    setPricingSettings(newSettings);
    setElectricityPrice(newSettings.electricityPricePerKwh);
    fetchModels();
  };

  const handleDeleteModel = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten model?')) {
      try {
        await api.delete(`/models/${id}`);
        fetchModels();
      } catch (error) {
        console.error('Błąd podczas usuwania modelu:', error);
      }
    }
  };

  const resolveModelWeightGrams = (model) => {
    if (typeof model.weightGrams === 'number' && !Number.isNaN(model.weightGrams)) {
      return model.weightGrams;
    }
    return 0;
  };

  const getShippingCost = (model) => {
    if (!pricingSettings?.shippingPrices) return 15;
    const packageSize = model.packageSize || 'medium';
    return pricingSettings.shippingPrices[packageSize] || 15;
  };

  const computeMaterialCostForVariant = (model, filamentObj) => {
    const grams = resolveModelWeightGrams(model);
    const priceKg = filamentObj?.priceForKg || 0;
    if (!priceKg || grams <= 0) return 0;
    return (grams / 1000) * priceKg;
  };

  const computeEnergyCost = (model) => {
    const hours = Number(model.printTimeHours) || 0;
    const minutes = Number(model.printTimeMinutes) || 0;
    const totalHours = hours + minutes / 60;
    const assumedPowerKw = 0.12;
    const energyKwh = totalHours * assumedPowerKw;
    const electricityPriceToUse = pricingSettings ? pricingSettings.electricityPricePerKwh : (Number(electricityPrice) || 0);
    return energyKwh * electricityPriceToUse;
  };

  const computeUnitTotalWithShipping = (model, filamentObj) => {
    const materialCost = computeMaterialCostForVariant(model, filamentObj);
    const energyCost = computeEnergyCost(model);
    const packagingCost = pricingSettings ? pricingSettings.packagingCost : 5;
    const shippingCost = getShippingCost(model);
    
    const margin = Number(model.margin) || 0;
    const marginMultiplier = 1 + (margin / 100);
    const baseCostWithMargin = (materialCost + energyCost + packagingCost) * marginMultiplier;
    
    return baseCostWithMargin + shippingCost;
  };

  const computeInventoryTotal = (modelsList) => {
    return Array.isArray(modelsList) ? modelsList.reduce((sum, m) => {
      if (!Array.isArray(m.filamentVariants)) return sum;
      const modelSum = m.filamentVariants.reduce((sumF, fv) => {
        const fil = getFilamentObj(fv);
        const unit = computeUnitTotalWithShipping(m, fil);
        const qty = Array.isArray(fv.colorVariants) ? fv.colorVariants.reduce((s, cv) => s + (Number(cv.quantity) || 0), 0) : 0;
        return sumF + unit * qty;
      }, 0);
      return sum + modelSum;
    }, 0) : 0;
  };

  const computeItemsOnlyValue = (modelsList) => {
    return Array.isArray(modelsList) ? modelsList.reduce((sum, m) => {
      if (!Array.isArray(m.filamentVariants)) return sum;
      const modelSum = m.filamentVariants.reduce((sumF, fv) => {
        const fil = getFilamentObj(fv);
        const materialCost = computeMaterialCostForVariant(m, fil);
        const energyCost = computeEnergyCost(m);
        const margin = Number(m.margin) || 0;
        const marginMultiplier = 1 + (margin / 100);
        const unitValue = (materialCost + energyCost) * marginMultiplier;
        const qty = Array.isArray(fv.colorVariants) ? fv.colorVariants.reduce((s, cv) => s + (Number(cv.quantity) || 0), 0) : 0;
        return sumF + unitValue * qty;
      }, 0);
      return sum + modelSum;
    }, 0) : 0;
  };

  const computeShippingPackagingValue = (modelsList) => {
    return Array.isArray(modelsList) ? modelsList.reduce((sum, m) => {
      if (!Array.isArray(m.filamentVariants)) return sum;
      const modelSum = m.filamentVariants.reduce((sumF, fv) => {
        const packagingCost = pricingSettings ? pricingSettings.packagingCost : 5;
        const shippingCost = getShippingCost(m);
        const margin = Number(m.margin) || 0;
        const marginMultiplier = 1 + (margin / 100);
        const unitValue = (packagingCost * marginMultiplier) + shippingCost;
        const qty = Array.isArray(fv.colorVariants) ? fv.colorVariants.reduce((s, cv) => s + (Number(cv.quantity) || 0), 0) : 0;
        return sumF + unitValue * qty;
      }, 0);
      return sum + modelSum;
    }, 0) : 0;
  };

  const totalInventoryAll = computeInventoryTotal(models);
  const totalInventoryFiltered = computeInventoryTotal(filteredModels);
  const totalItemsValueAll = computeItemsOnlyValue(models);
  const totalItemsValueFiltered = computeItemsOnlyValue(filteredModels);
  const totalShippingPackagingAll = computeShippingPackagingValue(models);
  const totalShippingPackagingFiltered = computeShippingPackagingValue(filteredModels);

  const currency = pricingSettings?.currency || 'zł';

  const isFiltered = filters.vaseMode !== '' ||
    filters.fuzzyMode !== '' ||
    filters.category !== '' ||
    filters.filament_type !== '' ||
    filters.size_type !== '';

  return (
    <div className="prints-list">
      <header className="prints-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/')}>
            {t('common.back')}
          </button>
          <h1>{t('prints.title')}</h1>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            {t('prints.add')}
          </button>
        </div>
      </header>

      <div className="prints-container">
        <div className="prints-sidebar">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        
        
        {/* Fixed pricing info panel */}
        <div className="pricing-info">
          <div className="pricing-info-header">
            <h3>{t('prints.pricingSettings')}</h3>
            <button className="settings-btn-small" onClick={() => setShowPricingModal(true)} title="Ustawienia cenowe">
              ⚙️
            </button>
          </div>
          
          <div className="pricing-info-content">
            {pricingSettings && (
              <>
                <div className="pricing-item">
                  <span className="pricing-label">{t('prints.electricityPrice')}</span>
                  <span className="pricing-value">{pricingSettings.electricityPricePerKwh.toFixed(2)} {currency}</span>
                </div>
                
                <div className="pricing-item">
                  <span className="pricing-label">{t('prints.packagingCost')}</span>
                  <span className="pricing-value">{pricingSettings.packagingCost.toFixed(2)} {currency}</span>
                </div>
                
                <div className="pricing-item">
                  <span className="pricing-label">{t('prints.shipping.mini')}</span>
                  <span className="pricing-value">{pricingSettings.shippingPrices?.mini?.toFixed(2) || '0.00'} {currency}</span>
                </div>
                
                <div className="pricing-item">
                  <span className="pricing-label">{t('prints.shipping.small')}</span>
                  <span className="pricing-value">{pricingSettings.shippingPrices?.small?.toFixed(2) || '0.00'} {currency}</span>
                </div>
                
                <div className="pricing-item">
                  <span className="pricing-label">{t('prints.shipping.medium')}</span>
                  <span className="pricing-value">{pricingSettings.shippingPrices?.medium?.toFixed(2) || '0.00'} {currency}</span>
                </div>
                
                <div className="pricing-item">
                  <span className="pricing-label">{t('prints.shipping.big')}</span>
                  <span className="pricing-value">{pricingSettings.shippingPrices?.big?.toFixed(2) || '0.00'} {currency}</span>
                </div>
              </>
            )}
          </div>
        </div>
        </div>
        <div className="prints-content">
            <div className="prints-stats">
            <p>{t('prints.found')}: {filteredModels.length} {t('prints.models')}</p>
            <p>{t('prints.of')}: {models.length} {t('prints.models')}</p>
            
            {isFiltered && (
              <div className="inventory-block">
                <h4>{t('prints.inventory.filtered')}</h4>
                <p><strong>{t('prints.inventory.items')}</strong> {totalItemsValueFiltered.toFixed(2)} {currency}</p>
                <p><strong>{t('prints.inventory.shippack')}</strong> {totalShippingPackagingFiltered.toFixed(2)} {currency}</p>
                <p className="inventory-total"><strong>{t('prints.inventory.total')}</strong> {totalInventoryFiltered.toFixed(2)} {currency}</p>
              </div>
            )}

            <div className="inventory-block inventory-block--all">
              <h4>{t('prints.inventory.all')}</h4>
              <p><strong>{t('prints.inventory.items')}</strong> {totalItemsValueAll.toFixed(2)} {currency}</p>
              <p><strong>{t('prints.inventory.shippack')}</strong> {totalShippingPackagingAll.toFixed(2)} {currency}</p>
              <p className="inventory-total"><strong>{t('prints.inventory.total')}</strong> {totalInventoryAll.toFixed(2)} {currency}</p>
            </div>
          </div>

          {loading ? (
            <div className="loading">{t('prints.loading')}</div>
          ) : (
            <div className="prints-grid">
              {filteredModels.map(model => (
                <PrintCard
                  key={model._id}
                  model={model}
                  filaments={filaments}
                  onUpdate={handleUpdateModel}
                  onDelete={handleDeleteModel}
                  onQuantityChange={handleQuantityChange}
                  filterOptions={filterOptions}
                  electricityPrice={Number(electricityPrice) || 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddPrintModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddModel}
          filterOptions={filterOptions}
          filaments={filaments}
        />
      )}

      {showPricingModal && (
        <PricingSettingsModal
          onClose={() => setShowPricingModal(false)}
          onSettingsUpdate={handlePricingSettingsUpdate}
        />
      )}
    </div>
  );
};

export default PrintsList;
