// Add this to your main HTML file, in a <script> tag
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/' // Root scope to match your manifest
    })
    .then(registration => {
      console.log('SW registered: ', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available; please refresh.');
            } else {
              // Content is cached for the first time
              console.log('Content is cached for offline use.');
            }
          }
        });
      });
    })
    .catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
