const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PricingSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
  packagingCost: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 5 
  },
  // Ceny wysyłki według rozmiaru paczki w PLN
  shippingPrices: {
    mini: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 8 
    },
    small: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 12 
    },
    medium: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 15 
    },
    big: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 25 
    }
  },
  // Cena 1 kWh prądu w PLN
  electricityPricePerKwh: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 1.10 
  },
  // Marża w procentach
  marginPercent: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 20 
  },
  // Symbol waluty
  currency: {
    type: String,
    default: 'zł'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'pricing_settings',
  versionKey: false,
  _id: true
});

const PricingSettings = mongoose.model('PricingSettings', PricingSettingsSchema, 'pricing_settings');

module.exports = PricingSettings;
