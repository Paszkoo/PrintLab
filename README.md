# PrintLabApp - 3D Printer Management System

<div align="center">

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)

**Modern 3D Printer FDM management system with advanced cost calculator**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Structure](#project-structure)

</div>

---

## About the Project

**PrintLabApp** is a comprehensive desktop application for managing 3D FDM printers, combining:

- **Frontend** - Modern user interface in React + Electron
- **Backend** - REST API in Node.js + Express
- **Database** - JSON-based storage for rapid prototyping
- **Cost Calculator** - Automatic margin and profit calculations

### Screenshots

```
 Home Page                      Prints List
┌─────────────────────────────┐    ┌─────────────────────────────┐
│     3D Printer Manager      │    │       Prints List           │
│   FDM Print Management      │    │  ┌─────────────────────────┐ │
│   System                    │    │  │ Filters    [+ Add]     │ │
│                             │    │  └─────────────────────────┘ │
│  [Prints List]              │    │  ┌─────────────────────────┐ │
│  [Filaments List]           │    │  │ Xbox Controller Stand  │ │
│  [Exit]                     │    │  │ Price: 27.00$ | Qty:5  │ │
│                             │    │  │ [Edit] [Delete] [Calc]  │ │
└─────────────────────────────┘    │  └─────────────────────────┘ │
                                   └─────────────────────────────┘
```

---

## Key Features

### Print Management
- Adding new 3D models with print parameters
- Editing existing prints
- Deleting models with confirmation
- Real-time inventory tracking

### Advanced Cost Calculator
- **Automatic calculation** of material, electricity, and packaging costs
- **Energy costs** - considers print time and printer power consumption
- **Shipping costs** - different rates for different package sizes
- **Margin** - individual for each model
- **Target calculator** - testing different prices and margins

### Filament Management
- Cataloging filament types (PLA, ASA, PETG, etc.)
- Tracking manufacturers and prices per kilogram
- Managing colors and their availability

---

## Project Structure

```
PrintLabApp/
├── front/                    # Frontend (React + Electron)
│   ├── src/
│   │   ├── components/        # React Components
│   │   │   ├── cards/         # Card Components
│   │   │   ├── forms/         # Form Components
│   │   │   ├── modals/        # Modal Components
│   │   │   └── common/        # Reusable Components
│   │   ├── pages/             # Application Pages
│   │   ├── styles/            # Centralized Styles
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── services/          # API Calls and Services
│   │   └── utils/             # Helper Functions
│   ├── public/
│   │   └── electron.js        # Electron Configuration
│   └── package.json
├── server/                    # Backend (Node.js + Express)
│   ├── models/                # Data Models
│   ├── routes/                # API Endpoints
│   ├── server.js
│   └── package.json
├── DB/                        # Database (JSON)
│   ├── PrintLabApp.Filaments.json
│   ├── PrintLabApp.models.json
│   └── PrintLabApp.pricing_settings.json
└── README.md
```

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Electron      │    │   React         │    │   Node.js       │
│   (Desktop UI)  │◄──►│   (Frontend)    │◄──►│   (Backend API) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Vite          │    │   JSON DB       │
                       │   (Dev Server)  │    │   (Data Store)  │
                       └─────────────────┘    └─────────────────┘
```

---

## Quick Start

### System Requirements
- **Node.js** 18+
- **npm** 9+
- **Windows** 10/11, **macOS** 10.15+, **Linux** (Ubuntu 18.04+)

### Installation

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
   
   # Backend (in separate terminal)
   cd server
   npm start
   ```

### Available Scripts

| Script | Location | Description |
|--------|----------|-------------|
| `npm run dev` | front/ | Runs the application in development mode |
| `npm run client` | front/ | Frontend only (React + Vite) |
| `npm run electron` | front/ | Electron only |
| `npm run build` | front/ | Builds the application for production |
| `npm start` | server/ | Runs the backend API |

---

## Example Calculations

```
Xbox Controller Stand
├── Material (45g PLA): $4.91
├── Electricity (0.7h): $0.09
├── Packaging: $5.00
├── Shipping (medium): $15.00
├── Margin (20%): $2.00
└── FINAL PRICE: $27.00
```

---

## Technologies

### Frontend
- **React 18.2.0** - UI Library
- **Vite 4.1.4** - Build tool and dev server
- **Electron 28.0.0** - Desktop wrapper
- **React Router DOM** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - Runtime
- **Express 4.18.2** - Web framework
- **CORS** - Cross-origin resource sharing
- **Mongoose** - ODM (prepared for MongoDB)

### Development Tools
- **ESLint** - Linting
- **Concurrently** - Running multiple processes
- **Cross-env** - Environment variables
- **Electron Builder** - Creating installers

---

## Contributing

### Bug Reports
- Use [Issues](https://github.com/your-username/printlab/issues)
- Describe step-by-step how to reproduce the bug
- Include screenshots if possible

### Feature Requests
- [Feature Requests](https://github.com/your-username/printlab/discussions)
- Describe how the feature should work
- Explain the benefits for users

### Development
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Jakub** - *PrintLabApp Developer*

- GitHub: [@Paszkoo](https://github.com/Paszkoo)
- Email: japaszkopl@gmail.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/jakub-paszk)

---

<div align="center">

**If you like this project, give it a star!**

Made with love for the 3D printing community

</div>