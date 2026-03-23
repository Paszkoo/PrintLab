const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.DEV;

let mainWindow;

function createWindow() {
  // Stwórz okno przeglądarki
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false
    },
    show: false, // Nie pokazuj okna od razu
    titleBarStyle: 'default'
  });

  // Ustaw URL aplikacji
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  
  // Załaduj aplikację
  mainWindow.loadURL(startUrl);

  // Pokaż okno gdy będzie gotowe
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Otwórz DevTools w trybie dev
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Obsługa zamknięcia okna
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Obsługa błędów ładowania
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
    
    // Spróbuj ponownie po 2 sekundach
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    }, 2000);
  });
}

// Ta metoda zostanie wywołana gdy Electron zakończy inicjalizację
// i będzie gotowy do tworzenia okien przeglądarki
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Na macOS zazwyczaj ponownie tworzymy okno gdy
    // ikona dock jest kliknięta i nie ma innych otwartych okien
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Zakończ gdy wszystkie okna są zamknięte
app.on('window-all-closed', () => {
  // Na macOS aplikacje pozostają aktywne dopóki użytkownik nie zakończy ich
  // jawnie za pomocą Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Obsługa bezpieczeństwa - zapobiegaj otwieraniu zewnętrznych linków
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    console.log('Blocked new window to:', navigationUrl);
  });
});

// Dodatkowe logowanie dla debugowania
console.log('Electron main process started');
console.log('isDev:', isDev);
console.log('Node version:', process.version);
console.log('Electron version:', process.versions.electron);