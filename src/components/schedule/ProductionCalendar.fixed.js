// This is a stub component to fix build errors
import React from 'react';
import SimpleProductionCalendar from './SimpleProductionCalendar';

// Create a wrapper component that passes all props to SimpleProductionCalendar
const ProductionCalendarFixed = (props) => {
  console.log('Using ProductionCalendar.fixed stub with props:', props);
  return <SimpleProductionCalendar {...props} />;
};

// Export SimpleProductionCalendar as default
export default ProductionCalendarFixed;
