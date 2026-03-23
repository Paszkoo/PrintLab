import React, { useState, useEffect } from 'react';
import api from '../../../api';
import '../../../styles/components/PricingSettingsModal.css';

const PricingSettingsModal = ({ onClose, onSettingsUpdate }) => {
  const [settings, setSettings] = useState({
    packagingCost: 5.00,
    shippingPrices: {
      mini: 8.00,
      small: 12.00,
      medium: 15.00,
      big: 25.00
    },
    electricityPricePerKwh: 1.10,
    marginPercent: 20,
    currency: 'zł'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pricing-settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Błąd podczas pobierania ustawień cenowych:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('shippingPrices.')) {
      const size = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        shippingPrices: {
          ...prev.shippingPrices,
          [size]: parseFloat(value) || 0
        }
      }));
    } else if (name === 'currency') {
      setSettings(prev => ({ ...prev, currency: value }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.put('/pricing-settings', settings);
      if (onSettingsUpdate) {
        onSettingsUpdate(settings);
      }
      onClose();
    } catch (error) {
      console.error('Błąd podczas zapisywania ustawień:', error);
      alert('Błąd podczas zapisywania ustawień');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pricing-modal-backdrop">
        <div className="pricing-modal">
          <div className="loading">Ładowanie ustawień...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pricing-modal-backdrop" onClick={onClose}>
      <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pricing-modal-header">
          <h3>Ustawienia cenowe</h3>
          <button className="pricing-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="pricing-form-body">
            <div className="form-group">
              <label htmlFor="packagingCost">Koszt pakowania:</label>
              <input
                id="packagingCost"
                type="number"
                name="packagingCost"
                value={settings.packagingCost}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shippingPrices.mini">Koszt wysyłki - mini paczka:</label>
              <input
                id="shippingPrices.mini"
                type="number"
                name="shippingPrices.mini"
                value={settings.shippingPrices.mini}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shippingPrices.small">Koszt wysyłki - mała paczka:</label>
              <input
                id="shippingPrices.small"
                type="number"
                name="shippingPrices.small"
                value={settings.shippingPrices.small}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shippingPrices.medium">Koszt wysyłki - średnia paczka:</label>
              <input
                id="shippingPrices.medium"
                type="number"
                name="shippingPrices.medium"
                value={settings.shippingPrices.medium}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="shippingPrices.big">Koszt wysyłki - duża paczka:</label>
              <input
                id="shippingPrices.big"
                type="number"
                name="shippingPrices.big"
                value={settings.shippingPrices.big}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="electricityPricePerKwh">Cena prądu za 1 kWh:</label>
              <input
                id="electricityPricePerKwh"
                type="number"
                name="electricityPricePerKwh"
                value={settings.electricityPricePerKwh}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Symbol waluty:</label>
              <input
                id="currency"
                type="text"
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
                maxLength={10}
                required
              />
            </div>
            
          </div>

          <div className="pricing-modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Anuluj
            </button>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PricingSettingsModal;
