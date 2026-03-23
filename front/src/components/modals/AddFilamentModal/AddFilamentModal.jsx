import React, { useState } from 'react';
import '../../../styles/components/FilamentModal.css';
import { useLanguage } from '../../../LanguageContext';

const AddFilamentModal = ({ onClose, onSubmit, filterOptions }) => {
  const [formData, setFormData] = useState({
    type: '',
    prod: '',
    colors: [],
    priceForKg: 0,
    diameter: '',
    diameterTolerance: '',
    finish: '',
    density: '',
    heatResistance: '',
    shoreHardness: '',
    impactStrength: '',
    youngsModulus: '',
    retraction: '',
    nozzleDiameterMin: '',
    printSpeedMin: '',
    printSpeedMax: '',
  });
  const [newColor, setNewColor] = useState('');
  const [showSpecs, setShowSpecs] = useState(false);
  const { t } = useLanguage();

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddColor();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.colors.length === 0) {
      alert(t('addfilament.alert.noColor'));
      return;
    }
    const payload = { ...formData };
    const specFields = [
      'diameter','diameterTolerance','finish','density','heatResistance',
      'shoreHardness','impactStrength','youngsModulus','retraction',
      'nozzleDiameterMin','printSpeedMin','printSpeedMax'
    ];
    specFields.forEach(f => {
      if (payload[f] === '' || payload[f] === null || payload[f] === undefined) {
        delete payload[f];
      }
    });
    onSubmit(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{t('addfilament.title')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t('addfilament.type')}</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                list="types"
                placeholder={t('addfilament.type.placeholder')}
                required
              />
              <datalist id="types">
                {filterOptions.types.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>{t('addfilament.producer')}</label>
              <input
                type="text"
                name="prod"
                value={formData.prod}
                onChange={handleInputChange}
                list="producers"
                placeholder={t('addfilament.producer.placeholder')}
                required
              />
              <datalist id="producers">
                {filterOptions.producers.map(prod => (
                  <option key={prod} value={prod} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-group">
            <label>{t('addfilament.pricePerKg')}</label>
            <input
              type="number"
              name="priceForKg"
              value={formData.priceForKg}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder={t('addfilament.pricePerKg.placeholder')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('addfilament.colors')}</label>
            <div className="color-input-group">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('addfilament.colors.placeholder')}
                list="colors"
              />
              <datalist id="colors">
                {filterOptions.colors.map(color => (
                  <option key={color} value={color} />
                ))}
              </datalist>
              <button 
                type="button" 
                onClick={handleAddColor}
                className="add-color-btn"
              >
                {t('addfilament.addColor')}
              </button>
            </div>

            <div className="colors-list">
              {formData.colors.map((color, index) => (
                <span key={index} className="color-badge">
                  {color}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    className="remove-color-btn"
                  >
                    ×
                  </button>
                </span>
              ))}
              {formData.colors.length === 0 && (
                <span className="no-colors">{t('addfilament.noColors')}</span>
              )}
            </div>
          </div>

          <div className="specs-section">
            <button
              type="button"
              className="specs-toggle-btn"
              onClick={() => setShowSpecs(prev => !prev)}
            >
              {showSpecs ? '▼' : '▶'} {t('addfilament.specs.title')}
            </button>

            {showSpecs && (
              <div className="specs-grid">
                <div className="form-group">
                  <label>{t('addfilament.specs.diameter')}</label>
                  <input type="number" name="diameter" value={formData.diameter} onChange={handleInputChange} min="0" step="0.01" placeholder="1.75" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.diameterTolerance')}</label>
                  <input type="number" name="diameterTolerance" value={formData.diameterTolerance} onChange={handleInputChange} min="0" step="0.001" placeholder="0.05" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.finish')}</label>
                  <input type="text" name="finish" value={formData.finish} onChange={handleInputChange} placeholder={t('addfilament.specs.finish.placeholder')} />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.density')}</label>
                  <input type="number" name="density" value={formData.density} onChange={handleInputChange} min="0" step="0.01" placeholder="1.24" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.heatResistance')}</label>
                  <input type="number" name="heatResistance" value={formData.heatResistance} onChange={handleInputChange} min="0" step="1" placeholder="80" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.shoreHardness')}</label>
                  <input type="text" name="shoreHardness" value={formData.shoreHardness} onChange={handleInputChange} placeholder="81D" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.impactStrength')}</label>
                  <input type="number" name="impactStrength" value={formData.impactStrength} onChange={handleInputChange} min="0" step="0.01" placeholder="0.29" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.youngsModulus')}</label>
                  <input type="number" name="youngsModulus" value={formData.youngsModulus} onChange={handleInputChange} min="0" step="1" placeholder="1471" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.retraction')}</label>
                  <input type="number" name="retraction" value={formData.retraction} onChange={handleInputChange} min="0" step="0.1" placeholder="5" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.nozzleDiameterMin')}</label>
                  <input type="number" name="nozzleDiameterMin" value={formData.nozzleDiameterMin} onChange={handleInputChange} min="0" step="0.1" placeholder="0.2" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.printSpeedMin')}</label>
                  <input type="number" name="printSpeedMin" value={formData.printSpeedMin} onChange={handleInputChange} min="0" step="1" placeholder="30" />
                </div>
                <div className="form-group">
                  <label>{t('addfilament.specs.printSpeedMax')}</label>
                  <input type="number" name="printSpeedMax" value={formData.printSpeedMax} onChange={handleInputChange} min="0" step="1" placeholder="60" />
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              {t('common.cancel')}
            </button>
            <button type="submit" className="submit-btn">
              {t('addfilament.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFilamentModal;