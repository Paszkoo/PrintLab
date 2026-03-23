const PricingSettings = require('../models/PricingSettings');
const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/pricing-settings', async (req, res) => {
  try {
    let settings = await PricingSettings.findOne({ userId: req.userId });
    
    if (!settings) {
      settings = new PricingSettings({
        userId: req.userId,
        shippingPrices: {
          mini: 8.00,
          small: 12.00,
          medium: 15.00,
          big: 25.00
        },
        packagingCost: 5.00,
        electricityPricePerKwh: 1.10,
        marginPercent: 20
      });
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching pricing settings:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/pricing-settings', async (req, res) => {
  try {
    let settings = await PricingSettings.findOne({ userId: req.userId });
    
    if (!settings) {
      settings = new PricingSettings({ ...req.body, userId: req.userId });
    } else {
      Object.assign(settings, req.body);
      settings.updatedAt = Date.now();
    }
    
    const savedSettings = await settings.save();
    res.json(savedSettings);
  } catch (error) {
    console.error('Error updating pricing settings:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
