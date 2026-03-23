const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FilamentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    prod: { type: String, required: true },
    colors: { type: Array, required: true },
    priceForKg: { type: Number, required: true },

    diameter: { type: Number },
    diameterTolerance: { type: Number },
    finish: { type: String },
    density: { type: Number },
    heatResistance: { type: Number },
    shoreHardness: { type: String },
    impactStrength: { type: Number },
    youngsModulus: { type: Number },
    retraction: { type: Number },
    nozzleDiameterMin: { type: Number },
    printSpeedMin: { type: Number },
    printSpeedMax: { type: Number },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
  collection: 'Filaments',
  versionKey: false,
  _id: true
});

const Filament = mongoose.model('Filament', FilamentSchema, 'Filaments');

module.exports = Filament;