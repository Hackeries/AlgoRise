self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  self.clients.claim()
})

// Pass-through fetch handler (no caching). Customize later if needed.
self.addEventListener("fetch", () => {})
