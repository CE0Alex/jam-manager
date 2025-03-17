import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { initializeStorage } from "./lib/supabase";
import "./reset-storage.js";

// Initialize Tempo Devtools
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Add a global error handler to catch initialization errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  const errorDisplay = document.createElement('div');
  errorDisplay.style.position = 'fixed';
  errorDisplay.style.top = '0';
  errorDisplay.style.left = '0';
  errorDisplay.style.right = '0';
  errorDisplay.style.padding = '20px';
  errorDisplay.style.backgroundColor = '#ffebee';
  errorDisplay.style.color = '#d32f2f';
  errorDisplay.style.zIndex = '9999';
  errorDisplay.style.textAlign = 'center';
  errorDisplay.innerHTML = `
    <h3>Application Error</h3>
    <p>${event.error?.message || 'Unknown error occurred'}</p>
    <p>See console for more details</p>
  `;
  document.body.appendChild(errorDisplay);
});

// Add initialization debug info
console.log('Starting application initialization');
console.log('Checking localStorage for job types...');
try {
  const jobTypes = localStorage.getItem('jobTypes');
  console.log('Job types in localStorage:', jobTypes ? JSON.parse(jobTypes) : 'Not found');
} catch (error) {
  console.error('Error checking job types in localStorage:', error);
}

// Wait for DOM to be ready
const initApp = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    console.log('Root element found, rendering React application');
    try {
      ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
          <HashRouter>
            <App />
          </HashRouter>
        </React.StrictMode>
      );
      console.log('React application rendered successfully');
    } catch (error) {
      console.error('Error rendering React application:', error);
      // Show error in the UI
      rootElement.innerHTML = `
        <div style="padding: 20px; color: #d32f2f;">
          <h2>Failed to initialize application</h2>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
          <p>Please check the console for more details or try refreshing the page.</p>
        </div>
      `;
    }
  } else {
    console.error("Root element not found");
    // Wait and retry in case the DOM is still loading
    setTimeout(initApp, 100);
  }
};

// Start application
initApp();

// Initialize Supabase storage in the background
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