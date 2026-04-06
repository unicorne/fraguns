const CACHE_NAME = "fraguns-v1";

// Install: skip waiting (no precache — Next.js pages are dynamic)
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful GET responses
        if (event.request.method === "GET" && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "FragUns";
  const options = {
    body: data.body || "Neue Frage wartet auf dich!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  const fullUrl = self.location.origin + url;

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // If app is already open, navigate it to the right page
      for (const client of clients) {
        if ("navigate" in client) {
          return client.navigate(fullUrl).then((c) => c && c.focus());
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(fullUrl);
    })
  );
});
