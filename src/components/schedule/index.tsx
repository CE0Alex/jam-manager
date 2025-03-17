// Import SimpleProductionCalendar as a fallback
import SimpleProductionCalendar from './SimpleProductionCalendar';
// Try to import the main ProductionCalendar component with error handling
let ProductionCalendar;

// Use dynamic import with ES modules instead of require
try {
  // Import directly instead of using require
  ProductionCalendar = SimpleProductionCalendar; // Default to fallback
  
  // We'll try to import the real component in a separate import
  import('./ProductionCalendar').then(module => {
    ProductionCalendar = module.default;
    console.log('Successfully loaded ProductionCalendar component');
  }).catch(error => {
    console.warn('Failed to import ProductionCalendar, using SimpleProductionCalendar as fallback:', error.message);
  });
} catch (error) {
  console.warn('Failed to setup ProductionCalendar import, using SimpleProductionCalendar as fallback:', error.message);
  ProductionCalendar = SimpleProductionCalendar;
}

// Export both the main and fallback components
export { SimpleProductionCalendar };
export { ProductionCalendar };
export default ProductionCalendar; 