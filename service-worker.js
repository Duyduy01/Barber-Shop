const CACHE_NAME = "barber-shop-cache-v1";
const assetsToCache = ["/index.html", "/main.js", "/app.css"];

// Lắng nghe sự kiện 'install'
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Lắng nghe sự kiện 'activate' để xóa cache cũ
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// Lắng nghe sự kiện 'fetch' để cache động tất cả file trong thư mục assets
self.addEventListener("fetch", (event) => {
  // Chỉ cache những yêu cầu thuộc thư mục /assets/images
  if (event.request.url.includes("/assets/images")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Trả về file từ cache nếu đã có
        if (cachedResponse) {
          return cachedResponse;
        }
        // Nếu chưa có trong cache, fetch từ server và cache lại
        return fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
