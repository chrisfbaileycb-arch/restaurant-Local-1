
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initOfflineSyncService } from './lib/offlineQueue'

// Initialize Service Worker & Background Sync Engine
initOfflineSyncService();

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(<App />);
