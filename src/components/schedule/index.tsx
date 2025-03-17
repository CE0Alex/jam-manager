// Import both calendar components to ensure they're available
import SimpleProductionCalendar from './SimpleProductionCalendar';
import ProductionCalendarFixed from './ProductionCalendar.fixed';

// Define a variable for the main component
let ProductionCalendar = ProductionCalendarFixed;

// Use dynamic import with ES modules to try loading the full component
try {
  // Set up an async function to load the component
  const loadFullCalendar = async () => {
    try {
      // Try to import the full component
      const module = await import('./ProductionCalendar');
      if (module && module.default) {
        // Make sure we have a valid component before reassigning
        if (typeof module.default === 'function') {
          ProductionCalendar = module.default;
          console.log('Successfully loaded full ProductionCalendar component');
        }
      }
    } catch (error) {
      console.warn('Error loading ProductionCalendar, using fixed fallback:', error.message);
    }
  };
  
  // Start the loading process
  loadFullCalendar();
} catch (error) {
  console.warn('Error setting up ProductionCalendar import, using fixed fallback:', error.message);
}

// Export all available calendar components for flexibility
export { SimpleProductionCalendar };
export { ProductionCalendarFixed };
export { ProductionCalendar };

// Default export is the best available calendar
export default ProductionCalendar; 