// تغییر نام نسخه به v3 برای اعمال اجباری تغییرات ظاهری جدید
const CACHE_NAME = 'medguide-v4';

const urlsToCache = [
  './',
  'index.html',
  'app.js',
  'data.js',
  'manifest.json'
];

// مرحله نصب: ذخیره فایل‌ها در حافظه گوشی
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // فعال‌سازی فوری نسخه جدید
  );
});

// مرحله فعال‌سازی: پاک کردن نسخه‌های قدیمی (مثل v1 یا v2)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                  .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

// مرحله فراخوانی: اولویت با حافظه گوشی برای عملکرد ۱۰۰٪ آفلاین
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

