import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Register SUVIDHA Service Worker for offline caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SUVIDHA] Service Worker registered, scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[SUVIDHA] Service Worker registration failed:', error);
      });
  });
}
