// Import SimpleProductionCalendar as a fallback
import SimpleProductionCalendar from './SimpleProductionCalendar';
// Try to import the main ProductionCalendar component with error handling
let ProductionCalendar;
try {
  ProductionCalendar = require('./ProductionCalendar').default;
} catch (error) {
  console.warn('Failed to import ProductionCalendar, using SimpleProductionCalendar as fallback:', error.message);
  ProductionCalendar = SimpleProductionCalendar;
}

// Export both the main and fallback components
export { SimpleProductionCalendar };
export { ProductionCalendar };
export default ProductionCalendar; 