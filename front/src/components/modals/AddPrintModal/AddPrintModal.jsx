import React, { useState, useMemo } from 'react';
import '../../../styles/components/Modal.css';
import { useLanguage } from '../../../LanguageContext';

const TABS = ['general', 'filament', 'print', 'pricing'];

const AddPrintModal = ({ onClose, onSubmit, filterOptions, filaments = [] }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    printTimeHours: 0,
    printTimeMinutes: 0,
    weightGrams: 0,
    margin: 0,
    packageSize: 'medium',
    filamentVariants: [
      {
        filamentProd: '',
        filamentType: '',
        colorVariants: [{ color: '', quantity: 1 }]
      }
    ],
    infill: {
      infillRate: 10,
      infillType: 'siatka',
      vaseWallsCount: 1,
      vaseBaseLayersCount: 3
    },
    supports: {
      enable: false,
      angle: 30,
      type: 'normal'
    },
    printMode: {
      vaseMode: false,
      fuzzyMode: false
    },
    size: {
      sizeCorrectionCentimeters: 0
    },
  });

  const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const { t } = useLanguage();

  const producers = useMemo(() => unique(filaments.map(f => f.prod)), [filaments]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
      }));
    }
  };

  const handleColorVariantChange = (filamentIndex, colorIndex, field, value) => {
    setFormData(prev => {
      const updatedFv = [...prev.filamentVariants];
      const colors = [...updatedFv[filamentIndex].colorVariants];
      colors[colorIndex] = { ...colors[colorIndex], [field]: field === 'quantity' ? Number(value) : value };
      updatedFv[filamentIndex] = { ...updatedFv[filamentIndex], colorVariants: colors };
      return { ...prev, filamentVariants: updatedFv };
    });
  };

  const handleFilamentVariantChange = (filamentIndex, field, value) => {
    setFormData(prev => {
      const updatedFv = [...prev.filamentVariants];
      updatedFv[filamentIndex] = {
        ...updatedFv[filamentIndex],
        [field]: value,
        colorVariants: field === 'filamentType' || field === 'filamentProd'
          ? [{ color: '', quantity: 1 }]
          : updatedFv[filamentIndex].colorVariants
      };
      return { ...prev, filamentVariants: updatedFv };
    });
  };

  const addColorVariant = (filamentIndex) => {
    setFormData(prev => {
      const updatedFv = [...prev.filamentVariants];
      updatedFv[filamentIndex] = {
        ...updatedFv[filamentIndex],
        colorVariants: [...updatedFv[filamentIndex].colorVariants, { color: '', quantity: 1 }]
      };
      return { ...prev, filamentVariants: updatedFv };
    });
  };

  const addFilamentVariant = () => {
    setFormData(prev => ({
      ...prev,
      filamentVariants: [...prev.filamentVariants, { filamentProd: '', filamentType: '', colorVariants: [{ color: '', quantity: 1 }] }]
    }));
  };

  const removeColorVariant = (filamentIndex, colorIndex) => {
    setFormData(prev => {
      const updatedFv = [...prev.filamentVariants];
      updatedFv[filamentIndex] = {
        ...updatedFv[filamentIndex],
        colorVariants: updatedFv[filamentIndex].colorVariants.filter((_, i) => i !== colorIndex)
      };
      return { ...prev, filamentVariants: updatedFv };
    });
  };

  const removeFilamentVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      filamentVariants: prev.filamentVariants.filter((_, i) => i !== index)
    }));
  };

  const resolveFilamentId = (fv) => {
    const match = filaments.find(f => f.type === fv.filamentType && f.prod === fv.filamentProd);
    return match ? match._id : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      filamentVariants: formData.filamentVariants.map(fv => ({
        filament: resolveFilamentId(fv),
        colorVariants: fv.colorVariants
      }))
    };
    onSubmit(submitData);
  };

  const tabLabels = {
    general: t('addprint.tab.general'),
    filament: t('addprint.tab.filament'),
    print: t('addprint.tab.print'),
    pricing: t('addprint.tab.pricing'),
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{t('addprint.title')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              className={`modal-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">

          {/* ── TAB: Ogólne ── */}
          {activeTab === 'general' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('addprint.name')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('addprint.category')}</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    list="categories-add"
                    required
                  />
                  <datalist id="categories-add">
                    {filterOptions.categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('addprint.weight')}</label>
                  <input
                    type="number"
                    name="weightGrams"
                    value={formData.weightGrams}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('addprint.printTimeHours')}</label>
                  <input
                    type="number"
                    name="printTimeHours"
                    value={formData.printTimeHours}
                    onChange={handleInputChange}
                    min="0"
                    max="999"
                  />
                </div>
                <div className="form-group">
                  <label>{t('addprint.printTimeMinutes')}</label>
                  <input
                    type="number"
                    name="printTimeMinutes"
                    value={formData.printTimeMinutes}
                    onChange={handleInputChange}
                    min="0"
                    max="59"
                  />
                </div>
              </div>
            </>
          )}

          {/* ── TAB: Filament ── */}
          {activeTab === 'filament' && (
            <>
              {formData.filamentVariants.map((fv, fvIndex) => (
                <div key={fvIndex} className="filament-variant-card">
                  <div className="filament-variant-card-header">
                    <h4>{t('addprint.variant')} {fvIndex + 1}</h4>
                    {formData.filamentVariants.length > 1 && (
                      <button type="button" className="btn-remove-variant" onClick={() => removeFilamentVariant(fvIndex)}>
                        {t('addprint.deleteVariant')}
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('addprint.producer')}</label>
                      <select
                        value={fv.filamentProd || ''}
                        onChange={(e) => handleFilamentVariantChange(fvIndex, 'filamentProd', e.target.value)}
                        required
                      >
                        <option value="">{t('addprint.chooseProducer')}</option>
                        {producers.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('addprint.type')}</label>
                      <select
                        value={fv.filamentType || ''}
                        onChange={(e) => handleFilamentVariantChange(fvIndex, 'filamentType', e.target.value)}
                        required
                        disabled={!fv.filamentProd}
                      >
                        <option value="">{t('addprint.chooseType')}</option>
                        {fv.filamentProd && filaments
                          .filter(f => f.prod === fv.filamentProd)
                          .map(f => f.type)
                          .filter((tp, i, arr) => arr.indexOf(tp) === i)
                          .map(tp => <option key={tp} value={tp}>{tp}</option>)
                        }
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t('addprint.colorQuantityVariants')}</label>
                    {fv.colorVariants?.map((cv, cvIndex) => (
                      <div key={cvIndex} className="color-variant-row">
                        <select
                          value={cv.color}
                          onChange={(e) => handleColorVariantChange(fvIndex, cvIndex, 'color', e.target.value)}
                          required
                          disabled={!fv.filamentType}
                        >
                          <option value="">{t('addprint.chooseColor')}</option>
                          {fv.filamentType && filaments
                            .filter(f => f.type === fv.filamentType && f.prod === fv.filamentProd)
                            .flatMap(f => f.colors || [])
                            .filter((c, i, arr) => arr.indexOf(c) === i)
                            .map(c => <option key={c} value={c}>{c}</option>)
                          }
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={cv.quantity}
                          onChange={(e) => handleColorVariantChange(fvIndex, cvIndex, 'quantity', e.target.value)}
                          required
                        />
                        <button type="button" className="btn-remove-color" onClick={() => removeColorVariant(fvIndex, cvIndex)} title={t('addprint.removeColorVariant')}>×</button>
                      </div>
                    ))}
                    <button type="button" className="btn-add-color" onClick={() => addColorVariant(fvIndex)}>
                      + {t('addprint.addColor')}
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" className="btn-add-variant" onClick={addFilamentVariant}>
                + {t('addprint.addFilamentVariant')}
              </button>
            </>
          )}

          {/* ── TAB: Wydruk ── */}
          {activeTab === 'print' && (
            <>
              <div className="form-section">
                <h3>{t('addprint.infillSection')}</h3>
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="printMode.vaseMode"
                        checked={formData.printMode.vaseMode}
                        onChange={handleInputChange}
                      />
                      {t('addprint.vaseMode')}
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="printMode.fuzzyMode"
                        checked={formData.printMode.fuzzyMode}
                        onChange={handleInputChange}
                      />
                      {t('addprint.fuzzyMode')}
                    </label>
                  </div>
                </div>

                {formData.printMode.vaseMode ? (
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('addprint.vaseWalls')}</label>
                      <input type="number" name="infill.vaseWallsCount" value={formData.infill.vaseWallsCount} onChange={handleInputChange} min="1" max="10" />
                    </div>
                    <div className="form-group">
                      <label>{t('addprint.vaseBaseLayers')}</label>
                      <input type="number" name="infill.vaseBaseLayersCount" value={formData.infill.vaseBaseLayersCount} onChange={handleInputChange} min="0" max="20" />
                    </div>
                    <div className="form-group">
                      <label>{t('addprint.vaseSizeCorrection')}</label>
                      <input type="number" name="size.sizeCorrectionCentimeters" value={formData.size.sizeCorrectionCentimeters} onChange={handleInputChange} step="0.1" />
                    </div>
                  </div>
                ) : (
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t('addprint.infillRate')}</label>
                      <input type="number" name="infill.infillRate" value={formData.infill.infillRate} onChange={handleInputChange} min="0" max="100" required />
                    </div>
                    <div className="form-group">
                      <label>{t('addprint.infillType')}</label>
                      <input type="text" name="infill.infillType" value={formData.infill.infillType} onChange={handleInputChange} required />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>{t('addprint.supportsSection')}</h3>
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="supports.enable"
                        checked={formData.supports.enable}
                        onChange={handleInputChange}
                      />
                      {t('addprint.supportsEnable')}
                    </label>
                  </div>
                  {formData.supports.enable && (
                    <>
                      <div className="form-group">
                        <label>{t('addprint.supportsType')}</label>
                        <select name="supports.type" value={formData.supports.type} onChange={handleInputChange} required>
                          <option value="normal">normal</option>
                          <option value="tree">tree</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t('addprint.supportsAngle')}</label>
                        <input type="number" name="supports.angle" value={formData.supports.angle} onChange={handleInputChange} min="0" max="90" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── TAB: Wycena ── */}
          {activeTab === 'pricing' && (
            <div className="form-section">
              <h3>{t('addprint.pricingSection')}</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('addprint.margin')}</label>
                  <input
                    type="number"
                    name="margin"
                    value={formData.margin}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('addprint.packageSize')}</label>
                  <select name="packageSize" value={formData.packageSize} onChange={handleInputChange} required>
                    <option value="mini">{t('addprint.packageSize.mini')}</option>
                    <option value="small">{t('addprint.packageSize.small')}</option>
                    <option value="medium">{t('addprint.packageSize.medium')}</option>
                    <option value="big">{t('addprint.packageSize.big')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              {t('common.cancel')}
            </button>
            <button type="submit" className="submit-btn">
              {t('addprint.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPrintModal;
