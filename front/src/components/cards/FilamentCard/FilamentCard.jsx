import React, { useState } from 'react';
import EditFilamentModal from '../../modals/EditFilamentModal/EditFilamentModal';
import '../../../styles/components/FilamentCard.css';
import { useLanguage } from '../../../LanguageContext';

const FilamentCard = ({ filament, onUpdate, onDelete, filterOptions }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const { t, lang } = useLanguage();

  const specRows = [
    { key: 'diameter', unit: 'mm' },
    { key: 'diameterTolerance', unit: 'mm', prefix: '±' },
    { key: 'finish' },
    { key: 'density', unit: 'g/cm³' },
    { key: 'heatResistance', unit: '°C' },
    { key: 'shoreHardness' },
    { key: 'impactStrength', unit: 'J/cm²' },
    { key: 'youngsModulus', unit: 'MPa' },
    { key: 'retraction', unit: 'mm', prefix: '±' },
    { key: 'nozzleDiameterMin', unit: 'mm', prefix: '≥' },
  ].filter(s => filament[s.key] != null && filament[s.key] !== '');

  const hasSpeedRange = filament.printSpeedMin != null || filament.printSpeedMax != null;
  const hasAnySpecs = specRows.length > 0 || hasSpeedRange;

  const handleUpdate = (updatedData) => {
    onUpdate(filament._id, updatedData);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    onDelete(filament._id);
  };

  return (
    <>
      <div className="filament-card">
        <div className="filament-card-header">
          <h3>{filament.type}</h3>
          <div className="filament-actions">
            <button 
              className="edit-btn" 
              onClick={() => setShowEditModal(true)}
              title="Edytuj"
            >
              ✏️
            </button>
            <button 
              className="delete-btn" 
              onClick={handleDelete}
              title="Usuń"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="filament-card-body">
          <div className="filament-info">
            <div className="info-row">
              <span className="label">{t('filamentcard.producer')}</span>
              <span className="value">{filament.prod}</span>
            </div>

            <div className="info-row">
              <span className="label">{t('filamentcard.pricePerKg')}</span>
              <span className="value price">{filament.priceForKg.toFixed(2)} zł</span>
            </div>

            <div className="info-row colors-row">
              <span className="label">{t('filamentcard.colors')}</span>
              <div className="colors-list">
                {filament.colors && filament.colors.length > 0 ? (
                  filament.colors.map((color, index) => (
                    <span key={index} className="color-badge">
                      {color}
                    </span>
                  ))
                ) : (
                  <span className="no-colors">{t('filamentcard.noColors')}</span>
                )}
              </div>
            </div>

            {hasAnySpecs && (
              <div className="specs-card-section">
                <button
                  type="button"
                  className="specs-card-toggle"
                  onClick={() => setShowSpecs(prev => !prev)}
                >
                  {showSpecs ? '▼' : '▶'} {t('filamentcard.specs.title')}
                </button>

                {showSpecs && (
                  <div className="specs-card-grid">
                    {specRows.map(s => (
                      <div key={s.key} className="spec-item">
                        <span className="spec-label">{t(`filamentcard.specs.${s.key}`)}</span>
                        <span className="spec-value">
                          {s.prefix || ''}{filament[s.key]}{s.unit ? ` ${s.unit}` : ''}
                        </span>
                      </div>
                    ))}
                    {hasSpeedRange && (
                      <div className="spec-item">
                        <span className="spec-label">{t('filamentcard.specs.printSpeed')}</span>
                        <span className="spec-value">
                          {filament.printSpeedMin ?? '?'} – {filament.printSpeedMax ?? '?'} mm/s
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="filament-card-footer">
          <small>
            {t('filamentcard.addedAt')} {new Date(filament.createdAt).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US')}
          </small>
          {filament.updatedAt !== filament.createdAt && (
            <small>
              {t('filamentcard.updatedAt')} {new Date(filament.updatedAt).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US')}
            </small>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditFilamentModal
          filament={filament}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
          filterOptions={filterOptions}
        />
      )}
    </>
  );
};

export default FilamentCard;