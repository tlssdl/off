// 앱 화면을 기기에 저장해서 와이파이/데이터 없이도 열리게 해 주는 파일
// 앱을 고칠 때마다 아래 버전 숫자를 올리면, 폰이 인터넷에 연결됐을 때 새 버전으로 바뀌어요
const CACHE = 'offmusic-v3';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
