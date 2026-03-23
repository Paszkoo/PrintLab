import React, { useState, useEffect } from 'react';
import EditPrintModal from '../../modals/EditPrintModal/EditPrintModal';
import api from '../../../api';
import '../../../styles/components/PrintCard.css';
import { useLanguage } from '../../../LanguageContext';

const PrintCard = ({ model, filaments = [], onUpdate, onDelete, onQuantityChange, filterOptions, electricityPrice }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVariantColor, setEditingVariantColor] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(0);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState(0);
  const [pricingSettings, setPricingSettings] = useState(null);
  const { t } = useLanguage();


  useEffect(() => {
    fetchPricingSettings();
  }, []);

  useEffect(() => {
    if (pricingSettings) {
      const baseCost = (computePricePln() || 0) + computeEnergyCost() + pricingSettings.packagingCost;
      const marginAmount = baseCost * ((model.margin || 0) / 100);
      setTargetPrice((baseCost + marginAmount).toFixed(2));
    }
  }, [pricingSettings]);

  const fetchPricingSettings = async () => {
    try {
      const response = await api.get('/pricing-settings');
      setPricingSettings(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania ustawień cenowych:', error);
      setPricingSettings({
        packagingCost: 5,
        shippingPrices: { mini: 8, small: 12, medium: 15, big: 25 },
        electricityPricePerKwh: 1.10,
      });
    }
  };

  const getFilamentObj = (fv) => fv.filament || {};

  const sumQuantity = () => Array.isArray(model.filamentVariants)
    ? model.filamentVariants.reduce((sumF, fv) => sumF + (
        Array.isArray(fv.colorVariants) ? fv.colorVariants.reduce((s, cv) => s + (Number(cv.quantity) || 0), 0) : 0
      ), 0)
    : 0;

  const formatPrintTime = (hours, minutes) => {
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  const resolveModelWeightGrams = () => {
    if (typeof model.weightGrams === 'number' && !Number.isNaN(model.weightGrams)) {
      return model.weightGrams;
    }
    return 0;
  };

  const computePricePln = () => {
    if (!Array.isArray(model.filamentVariants) || model.filamentVariants.length === 0) return null;
    const fil = getFilamentObj(model.filamentVariants[0]);
    const grams = resolveModelWeightGrams();
    if (!fil.priceForKg || grams <= 0) return null;
    return (grams / 1000) * Number(fil.priceForKg);
  };

  const pricePln = computePricePln();

  const computeEnergyCost = () => {
    const hours = Number(model.printTimeHours) || 0;
    const minutes = Number(model.printTimeMinutes) || 0;
    const totalHours = hours + minutes / 60;
    const assumedPowerKw = 0.12;
    const energyKwh = totalHours * assumedPowerKw;
    const electricityPriceToUse = pricingSettings ? pricingSettings.electricityPricePerKwh : (Number(electricityPrice) || 0);
    return energyKwh * electricityPriceToUse;
  };

  const energyCost = computeEnergyCost();
  const packaging = pricingSettings ? pricingSettings.packagingCost : 5;
  const shipping = pricingSettings ? (pricingSettings.shippingPrices?.[model.packageSize] || pricingSettings.shippingPrices?.medium || 15) : 15;
  const materialCost = pricePln ?? 0;
  const baseCost = materialCost + energyCost + packaging;
  const marginPct = Number(model.margin) || 0;
  const suggestedPrice = baseCost * (1 + marginPct / 100);
  const target = Number(targetPrice);
  const achievedMargin = target && baseCost > 0 ? ((target / baseCost) - 1) * 100 : null;
  const currency = pricingSettings?.currency || 'zł';

  const getVaseModeText = (model) => {
    if (model.printMode.vaseMode) {
      return `${t('printcard.vaseLabel')} (${model.infill.vaseWallsCount} ${t('printcard.vaseWalls')}, ${model.infill.vaseBaseLayersCount} ${t('printcard.vaseBaseLayers')})`;
    }
    return `${model.infill.infillType}, (${t('printcard.infillLabel')} ${model.infill.infillRate}%)`;
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSubmit = (updatedData) => {
    onUpdate(model._id, updatedData);
    setShowEditModal(false);
  };

  const getFilamentId = (fv) => {
    if (!fv.filament) return null;
    return typeof fv.filament === 'object' ? fv.filament._id : fv.filament;
  };

  const startEditVariant = (color, currentQty, filamentId) => {
    setEditingVariantColor({ color, filamentId });
    setTempQuantity(Number(currentQty) || 0);
  };

  const submitVariantQuantity = () => {
    if (!editingVariantColor) return;
    onQuantityChange(
      model._id,
      editingVariantColor.color,
      Number(tempQuantity) || 0,
      editingVariantColor.filamentId
    );
    setEditingVariantColor(null);
  };

  const handleDelete = () => {
    onDelete(model._id);
  };

  return (
    <div className="print-card">
      <div className="print-card-header">
        <h3>{model.name}</h3>
        <div className="print-card-actions">
          <div className='quantity-btn'>{sumQuantity()}</div>
          <button className="edit-btn" onClick={handleEdit} title={t('printcard.actions.edit')}>
          ✎
          </button>
          
          <button className="delete-btn" onClick={handleDelete} title={t('printcard.actions.delete')}>
            🗑
          </button>
          <button className="calc-btn" onClick={() => setShowCalcModal(true)} title={t('printcard.actions.calc')}>
            ⌨
          </button>
          
        </div>
      </div>

      <div className="print-card-content">
        {Array.isArray(model.filamentVariants) && model.filamentVariants.length > 0 && (
          <div className="print-info-row-filament-variants">
            <span className="label">{t('printcard.variants')}</span>
            <div className="value">
              <div className="filament-variants">
                {model.filamentVariants.map((fv, fidx) => {
                  const fil = getFilamentObj(fv);
                  const fId = getFilamentId(fv);
                  return (
                    <div key={fidx} className="filament-variant">
                      <div className="filament-header">
                        <span className="filament-type">{fil.type}</span>
                        <span className="filament-prod">— {fil.prod}</span>
                      </div>
                      <div className="color-variants">
                        {Array.isArray(fv.colorVariants) && fv.colorVariants.map((cv, idx) => (
                          <div key={idx} className="color-variant">
                            <span className="color-name">{cv.color}</span>
                            <span className="color-quantity">: {cv.quantity}</span>
                            {editingVariantColor && editingVariantColor.color === cv.color && editingVariantColor.filamentId === fId ? (
                              <div className="edit-controls">
                                <input type='number' min='0' value={tempQuantity} onChange={(e) => setTempQuantity(e.target.value)} className="quantity-input" />
                                <button onClick={submitVariantQuantity} className="edit-btn-small">✔</button>
                                <button onClick={() => setEditingVariantColor(null)} className="edit-btn-small">×</button>
                              </div>
                            ) : (
                              <button onClick={() => startEditVariant(cv.color, cv.quantity, fId)} className="edit-btn-small">✎</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="print-info-row">
          <span className="label">{t('printcard.printTime')}</span>
          <span className="value">
            {formatPrintTime(model.printTimeHours, model.printTimeMinutes)}
          </span>
        </div>

        {pricePln !== null && (
          <div className="print-info-row">
            <span className="label">{t('printcard.pricePerUnit')}</span>
            <span className="value">{pricePln.toFixed(2)} {currency}</span>
          </div>
        )}

        <div className="print-info-row">
          <span className="label">{t('printcard.printMode')}</span>
          <span className="value">{getVaseModeText(model)}</span>
        </div>

        {model.size.sizeCorrectionCentimeters !== 0 && (
          <div className="print-info-row">
            <span className="label">{t('printcard.size')}</span>
            <span className="value">
              {model.size.sizeCorrectionCentimeters > 0 ? '+' : ''}{model.size.sizeCorrectionCentimeters}cm
            </span>
          </div>
        )}

        <div className="print-tags">
          <span className="tag category-tag">{model.category}</span>
          {model.supports?.enable ? (
            <span className="tag supports-tag">{t('printcard.supports.on')}</span>
          ) : (
            <span className="tag supports-tag">{t('printcard.supports.off')}</span>
          )}
          {model.printMode.vaseMode && <span className="tag vase-tag">{t('printcard.vaseTag')}</span>}
          {model.printMode.fuzzyMode && <span className="tag fuzzy-tag">{t('printcard.fuzzyTag')}</span>}
          {Array.isArray(model.filamentVariants) && model.filamentVariants.some(fv => getFilamentObj(fv).type === "PLA basic") && <span className="tag fuzzy-tag">PLA</span>}
        </div>
      </div>

      {showEditModal && (
        <EditPrintModal
          model={model}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          filterOptions={filterOptions}
          filaments={filaments}
        />
      )}

      {showCalcModal && (
        <div className="calc-modal-backdrop" onClick={() => setShowCalcModal(false)}>
          <div className="calc-modal" onClick={(e) => e.stopPropagation()}>
              <div className="calc-modal-header">
              <h4>{t('printcard.calc.title')}</h4>
              <button className="calc-close" onClick={() => setShowCalcModal(false)}>×</button>
            </div>
              <div className="calc-body">
              <div className="calc-header">
                <h5>{t('printcard.calc.receipt')}</h5>
                <div className="calc-model-info">
                  <span>{model.name} </span>
                  <span>
                    {t('printcard.calc.packageSize')}{' '}
                    {model.packageSize === 'mini'
                      ? t('addprint.packageSize.mini')
                      : model.packageSize === 'small'
                      ? t('addprint.packageSize.small')
                      : model.packageSize === 'big'
                      ? t('addprint.packageSize.big')
                      : t('addprint.packageSize.medium')}
                  </span>
                </div>
              </div>

              <div className="calc-sep" />

              <div className="calc-section">
                <h6>{t('printcard.calc.baseCosts')}</h6>
                <div className="calc-row">
                  <span className="label">{`${t('printcard.calc.material')} (${model.weightGrams}g):`}</span>
                  <span className="value">{materialCost.toFixed(2)} {currency}</span>
                </div>
                <div className="calc-row">
                  <span className="label">
                    {`${t('printcard.calc.energy')} (${((model.printTimeHours || 0) + ((model.printTimeMinutes || 0) / 60)).toFixed(1)}h):`}
                  </span>
                  <span className="value">{energyCost.toFixed(2)} {currency}</span>
                </div>
                <div className="calc-row">
                  <span className="label">{t('printcard.calc.packaging')}</span>
                  <span className="value">{packaging.toFixed(2)} {currency}</span>
                </div>
                <div className="calc-row calc-subtotal">
                  <span className="label">{t('printcard.calc.subtotal')}</span>
                  <span className="value">{baseCost.toFixed(2)} {currency}</span>
                </div>
              </div>

              <div className="calc-sep" />

              <div className="calc-section">
                <h6>{t('printcard.calc.extraCosts')}</h6>
                <div className="calc-row">
                  <span className="label">
                    {t('printcard.calc.shipping')}{' '}
                    ({model.packageSize === 'mini'
                      ? t('addprint.packageSize.mini')
                      : model.packageSize === 'small'
                      ? t('addprint.packageSize.small')
                      : model.packageSize === 'big'
                      ? t('addprint.packageSize.big')
                      : t('addprint.packageSize.medium')})
                  </span>
                  <span className="value">{shipping.toFixed(2)} {currency}</span>
                </div>
                <div className="calc-row calc-subtotal">
                  <span className="label">{t('printcard.calc.totalCost')}</span>
                  <span className="value">{(baseCost + shipping).toFixed(2)} {currency}</span>
                </div>
              </div>

              <div className="calc-sep" />

              <div className="calc-section">
                <h6>{t('printcard.calc.marginAndFinal')}</h6>
                <div className="calc-row">
                  <span className="label">{t('printcard.calc.modelMargin')}</span>
                  <span className="value">{model.margin || 0}%</span>
                </div>
                <div className="calc-row calc-final">
                  <span className="label">{t('printcard.calc.finalPrice')}</span>
                  <span className="value">{suggestedPrice.toFixed(2)} {currency}</span>
                </div>
              </div>

              <div className="calc-sep" />

              <div className="calc-section">
                <h6>{t('printcard.calc.preview')}</h6>
                <div className="calc-row">
                  <span className="label">{t('printcard.calc.targetPrice')}</span>
                  <div className="calc-inputs">
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder={t('printcard.calc.enterPrice')}
                    />
                    <span>{currency}</span>
                  </div>
                </div>
                {targetPrice > 0 && (
                  <div className="calc-row">
                    <span className="label">{t('printcard.calc.marginAtPrice')}</span>
                    <span className="value">{achievedMargin !== null ? `${achievedMargin.toFixed(1)}%` : '0.0%'}</span>
                  </div>
                )}
              </div>

              <div className="calc-sep" />

              <div className="calc-summary">
                <div className="calc-row">
                  <span className="label">{t('printcard.calc.profitPerUnit')}</span>
                  <span className="value">{(suggestedPrice - baseCost).toFixed(2)} {currency}</span>
                </div>
                <div className="calc-row">
                  <span className="label">{t('printcard.calc.profitInventory')}</span>
                  <span className="value">{((suggestedPrice - baseCost) * sumQuantity()).toFixed(2)} {currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintCard;
