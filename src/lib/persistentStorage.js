/**
 * Utility functions for managing persistent storage in the application
 */

// Check if localStorage is available
export const isLocalStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
};

// Save data to localStorage with error handling
export const saveToStorage = (key, data) => {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    // Try to save in smaller chunks if the data is too large
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, attempting to save critical data only');
      try {
        // Try to save at least the essential data
        const essentialData = extractEssentialData(data);
        localStorage.setItem(`${key}_essential`, JSON.stringify(essentialData));
        return true;
      } catch (e) {
        console.error('Failed to save even essential data:', e);
        return false;
      }
    }
    return false;
  }
};

// Load data from localStorage with error handling
export const loadFromStorage = (key, defaultValue) => {
  if (!isLocalStorageAvailable()) return defaultValue;
  
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      // Try to load from the essential backup
      const essentialData = localStorage.getItem(`${key}_essential`);
      if (essentialData !== null) {
        console.warn(`Regular ${key} data not found, loading from essential backup`);
        return JSON.parse(essentialData);
      }
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Extract only the essential data to save when storage quota is exceeded
const extractEssentialData = (data) => {
  // This is application specific and should be customized
  if (Array.isArray(data)) {
    // If it's an array, keep only the most important properties of each item
    return data.map(item => {
      const essentialItem = {};
      // Add the essential properties based on what type of data it is
      if (item.id) essentialItem.id = item.id;
      if (item.name) essentialItem.name = item.name;
      if (item.startTime) essentialItem.startTime = item.startTime;
      if (item.endTime) essentialItem.endTime = item.endTime;
      if (item.jobId) essentialItem.jobId = item.jobId;
      if (item.staffId) essentialItem.staffId = item.staffId;
      if (item.status) essentialItem.status = item.status;
      return essentialItem;
    });
  }
  // For objects, keep only the essential properties
  if (typeof data === 'object' && data !== null) {
    const essentialObject = {};
    Object.keys(data).forEach(key => {
      if (['id', 'name', 'status', 'date', 'deadline'].includes(key)) {
        essentialObject[key] = data[key];
      }
    });
    return essentialObject;
  }
  return data;
};

// A function to backup all critical data periodically
export const backupAppData = (appData) => {
  try {
    if (!isLocalStorageAvailable()) return false;
    
    // Timestamp the backup
    const timestamp = new Date().toISOString();
    const backupData = {
      timestamp,
      data: {
        jobs: appData.jobs || [],
        staff: appData.staff || [],
        schedule: appData.schedule || [],
        // Include other critical data as needed
      }
    };
    
    localStorage.setItem('appDataBackup', JSON.stringify(backupData));
    console.log(`Data backup completed at ${timestamp}`);
    return true;
  } catch (error) {
    console.error('Failed to backup app data:', error);
    return false;
  }
};

// Restore from backup if primary data is corrupted or missing
export const restoreFromBackup = () => {
  try {
    if (!isLocalStorageAvailable()) return null;
    
    const backupData = localStorage.getItem('appDataBackup');
    if (!backupData) {
      console.warn('No backup data found');
      return null;
    }
    
    const { timestamp, data } = JSON.parse(backupData);
    console.log(`Restoring data from backup created at ${timestamp}`);
    
    // Restore each data type to its primary storage key
    if (data.jobs) localStorage.setItem('jobs', JSON.stringify(data.jobs));
    if (data.staff) localStorage.setItem('staff', JSON.stringify(data.staff));
    if (data.schedule) localStorage.setItem('schedule', JSON.stringify(data.schedule));
    // Restore other data as needed
    
    return data;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return null;
  }
};

// Set up periodic data backups
export const initializeAutomaticBackups = (appDataGetter, intervalMinutes = 5) => {
  if (!isLocalStorageAvailable()) return null;
  
  console.log(`Setting up automatic data backups every ${intervalMinutes} minutes`);
  
  // Backup immediately on initialization
  const appData = appDataGetter();
  backupAppData(appData);
  
  // Set up interval for recurring backups
  const intervalId = setInterval(() => {
    const currentData = appDataGetter();
    backupAppData(currentData);
  }, intervalMinutes * 60 * 1000);
  
  // Return the interval ID so it can be cleared if needed
  return intervalId;
}; 