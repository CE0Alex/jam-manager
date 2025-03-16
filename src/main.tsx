import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { initializeStorage } from "./lib/supabase";

// Initialize Tempo Devtools
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Wait for DOM to be ready
const initApp = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </React.StrictMode>
    );
  } else {
    console.error("Root element not found");
    // Wait and retry in case the DOM is still loading
    setTimeout(initApp, 100);
  }
};

// Start application
initApp();

// Initialize Supabase storage buckets in the background
if (import.meta.env.DEV) {
  // Use setTimeout to defer this work until after initial render
  setTimeout(async () => {
    try {
      console.log("Initializing Supabase storage in background...");
      await initializeStorage();
      console.log("Supabase storage initialization complete");
    } catch (error) {
      console.error("Failed to initialize Supabase storage:", error);
      console.log("Continuing app operation despite storage error");
    }

    // Log environment variables (without revealing sensitive values)
    console.log("Environment variables check:", {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL
        ? "[Set]"
        : "[Not Set]",
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
        ? "[Set]"
        : "[Not Set]",
    });
  }, 1000); // Delay by 1 second to prioritize UI rendering
}