import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { addEventListeners, createSerwist, RuntimeCache } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = createSerwist({
  precache: {
    entries: self.__SW_MANIFEST,
    concurrency: 10,
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  extensions: [
    new RuntimeCache(defaultCache, {
      warmEntries: ["/~offline"],
      fallbacks: {
        entries: [
          {
            url: "/~offline",
            matcher({ request }) {
              return request.destination === "document";
            },
          },
        ],
      },
    }),
  ],
});

addEventListeners(serwist);

self.addEventListener("push", (event) => {
  const data = event.data?.json();

  const title = data?.title || "Nova Notificação!";
  const options = {
    body: data?.message,
    icon: "/icons/icon-512x512.png",
    badge: "/icons/logo512x512.png",
    data: {
      url: data?.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const urlToOpen = notification.data?.url || "/";

  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        // Se já tiver uma aba com a URL aberta, foca nela
        const hadWindow = clientsArr.find(
          (client) => client.url === urlToOpen && "focus" in client
        );

        if (hadWindow) {
          return hadWindow.focus();
        }

        if (self.clients.openWindow) {
          // Senão, abre nova aba
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
