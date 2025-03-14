import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { initializeStorage } from "./lib/supabase";

// Initialize Tempo Devtools
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Initialize Supabase storage buckets
const initApp = async () => {
  // Only initialize storage if we're not in production build
  if (import.meta.env.DEV) {
    try {
      console.log("Initializing Supabase storage...");
      await initializeStorage();
      console.log("Supabase storage initialization complete");
    } catch (error) {
      console.error("Failed to initialize Supabase storage:", error);
      console.log("Continuing app initialization despite storage error");
    }
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
};

// Initialize storage and then render the app
initApp().finally(() => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </React.StrictMode>,
    );
  } else {
    console.error("Root element not found");
  }
});
