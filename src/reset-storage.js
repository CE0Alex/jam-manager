// Add resetStorage function to window for resetting application state
const resetStorage = () => {
  localStorage.clear();
  window.location.reload();
};

window.resetStorage = resetStorage;
