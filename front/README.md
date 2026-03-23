# 🖨️ PrintLabApp - 3D Printer Management System

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.1.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)

**Modern 3D Printer FDM management system with advanced cost calculator and print inventory**

[🚀 Demo](#-demo) • [📋 Features](#-features) • [🏗️ Installation](#️-installation) • [📁 Structure](#-project-structure) • [⚙️ Configuration](#️-configuration)

</div>

---

## 🎯 About the Application

**PrintLabApp** is an advanced desktop application for managing 3D FDM printers that enables:

- 📊 **Print inventory management** - tracking quantities, costs and print parameters
- 💰 **Automatic cost calculator** - considering material, electricity, packaging and shipping
- 🎨 **Filament management** - cataloging types, manufacturers and colors
- 📈 **Profitability analysis** - calculating margins and profits from each print
- 🔍 **Advanced filters** - searching by various criteria

### 🎨 Screenshots

```
🏠 Home Page          📋 Prints List          🎨 Filaments List
┌─────────────────┐   ┌─────────────────┐    ┌─────────────────┐
│ 3D Printer Manager│   │  Prints List    │    │ Filaments List  │
│ FDM Management   │   │ [Filters] [Add] │    │ [Filters] [Add] │
│ System           │   │ ┌─────────────┐ │    │ ┌─────────────┐ │
│                  │   │ │ Model Card  │ │    │ │ Filament    │ │
│ [📋 Prints List] │   │ │ Price: $45  │ │    │ │ PLA BambuLab│ │
│ [🎨 Filaments]   │   │ │ Quantity: 5 │ │    │ │ $109/kg     │ │
│ [❌ Exit]        │   │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘   └─────────────────┘    └─────────────────┘
```

---

## ✨ Features

### 🖨️ **Print Management**
- ➕ Adding new 3D models with print parameters
- ✏️ Editing existing prints
- 🗑️ Deleting models with confirmation
- 📊 Real-time inventory tracking
- 🏷️ Categorization by types and sizes

### 💰 **Cost Calculator**
- 🧮 **Automatic calculation** of material, electricity and packaging costs
- ⚡ **Energy costs** - considers print time and printer power consumption
- 📦 **Shipping costs** - different rates for different package sizes
- 📈 **Margin** - individual for each model
- 🎯 **Target calculator** - testing different prices and margins

### 🎨 **Filament Management**
- 📝 Cataloging filament types (PLA, ASA, PETG, etc.)
- 🏭 Tracking manufacturers and prices per kilogram
- 🌈 Managing colors and their availability
- 🔍 Filtering and sorting by various criteria

### 🔍 **Advanced Filters**
- 🎯 **Print filters**: vase mode, fuzzy skin, category, filament type
- 🎨 **Filament filters**: type, manufacturer, color, price range
- 📊 **Sorting**: by name, price, quantity, print time
- 🔄 **Filter reset** - quick clearing of all filters

---

## 🏗️ Installation

### System Requirements
- **Node.js** 18+ 
- **npm** 9+
- **Windows** 10/11, **macOS** 10.15+, **Linux** (Ubuntu 18.04+)

### Step by Step

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/printlabapp.git
   cd printlabapp
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd front
   npm install
   
   # Backend
   cd ../server
   npm install
   ```

3. **Run the application**
   ```bash
   # Development mode (React + Electron)
   cd front
   npm run dev
   
   # Or frontend only
   npm run client
   ```

4. **Run backend** (in separate terminal)
   ```bash
   cd server
   npm start
   ```

### 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Runs the application in development mode |
| `npm run client` | Frontend only (React + Vite) |
| `npm run electron` | Electron only |
| `npm run build` | Builds the application for production |
| `npm run dist` | Creates application installer |

---

## 📁 Project Structure

```
PrintLabApp/
├── 🖥️ front/                    # Frontend (React + Electron)
│   ├── 📁 src/
│   │   ├── 🧩 components/        # React Components
│   │   │   ├── 🃏 cards/         # Card Components
│   │   │   │   ├── FilamentCard/
│   │   │   │   └── PrintCard/
│   │   │   ├── 📝 forms/         # Form Components
│   │   │   │   ├── FilterPanel/
│   │   │   │   └── FilamentFilterPanel/
│   │   │   ├── 🪟 modals/        # Modal Components
│   │   │   │   ├── AddFilamentModal/
│   │   │   │   ├── EditFilamentModal/
│   │   │   │   ├── AddPrintModal/
│   │   │   │   ├── EditPrintModal/
│   │   │   │   └── PricingSettingsModal/
│   │   │   └── 🔧 common/        # Reusable Components
│   │   ├── 📄 pages/             # Application Pages
│   │   │   ├── HomePage/
│   │   │   ├── FilamentsList/
│   │   │   └── PrintsList/
│   │   ├── 🎨 styles/            # Centralized Styles
│   │   │   ├── components/       # Component Styles
│   │   │   └── pages/           # Page Styles
│   │   ├── 🪝 hooks/            # Custom React Hooks
│   │   ├── 🌐 services/         # API Calls and Services
│   │   ├── 🛠️ utils/           # Helper Functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── 📁 public/
│   │   └── electron.js          # Electron Configuration
│   ├── package.json
│   └── vite.config.js
├── 🖥️ server/                   # Backend (Node.js + Express)
│   ├── 📁 models/               # Data Models
│   │   ├── Filament.js
│   │   ├── model3d.js
│   │   └── PricingSettings.js
│   ├── 📁 routes/               # API Endpoints
│   │   ├── filamentRoutes.js
│   │   ├── model3dRoutes.js
│   │   └── pricingRoutes.js
│   ├── server.js
│   └── package.json
├── 💾 DB/                       # Database (JSON)
│   ├── PrintLabApp.Filaments.json
│   ├── PrintLabApp.models.json
│   └── PrintLabApp.pricing_settings.json
└── 📄 README.md
```

### 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   🖥️ Electron   │    │   ⚛️ React      │    │   🖥️ Node.js    │
│   (Desktop UI)  │◄──►│   (Frontend)    │◄──►│   (Backend API) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   🎨 Vite       │    │   💾 JSON DB    │
                       │   (Dev Server)  │    │   (Data Store)  │
                       └─────────────────┘    └─────────────────┘
```

---

## ⚙️ Configuration

### 🔧 Pricing Settings

The application allows configuration of:
- 💡 **Electricity price** per 1 kWh
- 📦 **Packaging cost** per item
- 🚚 **Shipping costs** for different package sizes
- 📈 **Default margin** percentage

### 🎨 Customization

- 🌈 **Colors** - easy theme color changes
- 📱 **Responsiveness** - adaptation to different resolutions
- 🔤 **Fonts** - ability to change fonts
- 🎯 **Language** - currently English, easy to add other languages

---

## 🚀 Demo

### 🎬 Quick Start

1. **Add filament**
   ```
   Filaments → + Add Filament → PLA, BambuLab, $109/kg
   ```

2. **Add model**
   ```
   Prints → + Add Model → Xbox Controller Stand
   ```

3. **Calculate costs**
   ```
   Model → 🧮 Calculator → View cost breakdown
   ```

### 📊 Example Calculations

```
📦 Xbox Controller Stand
├── 🧱 Material (45g PLA): $4.91
├── ⚡ Electricity (0.7h): $0.09  
├── 📦 Packaging: $5.00
├── 🚚 Shipping (medium): $15.00
├── 📈 Margin (20%): $2.00
└── 💰 FINAL PRICE: $27.00
```

---

## 🤝 Contributing

### 🐛 Bug Reports
- Use [Issues](https://github.com/your-username/printlabapp/issues)
- Describe step-by-step how to reproduce the bug
- Include screenshots if possible

### 💡 Feature Requests
- [Feature Requests](https://github.com/your-username/printlabapp/discussions)
- Describe how the feature should work
- Explain the benefits for users

### 🔧 Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jakub** - *PrintLabApp Developer*

- 🌐 GitHub: [@your-username](https://github.com/your-username)
- 📧 Email: your.email@example.com
- 💼 LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)

---

<div align="center">

**⭐ If you like this project, give it a star! ⭐**

Made with ❤️ for the 3D printing community

</div>