migrateWorkspace();
render();

if(/^https?:$/.test(location.protocol) && 'serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(error => console.warn('Offline-Cache:', error));
}
