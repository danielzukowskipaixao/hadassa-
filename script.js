// Configurações fáceis de editar
const SITE_CONFIG = {
  coupleName: 'Daniel & Hadassa',
  tagline: 'Nossa história eterna',
  startDate: '2025-10-24', // AAAA-MM-DD (data de início para calcular as semanas)
  fixedMessages: [
    { title: 'Promessa', text: 'Sempre estarei ao seu lado, celebrando cada sorriso e segurando sua mão em cada desafio.' },
    { title: 'Gratidão', text: 'Cada dia ao seu lado é um presente que cuido com carinho.' },
    { title: 'Sonhos', text: 'Vamos construir memórias que aquecem o coração e atravessam o tempo.' }
  ],
  weeklyMessages: [
    'Semana 1: Que este seja o começo de muitas semanas especiais. Você é o meu lugar de paz.',
    'Semana 2: Seu sorriso ilumina meus dias de um jeito único.',
    'Semana 3: Nosso amor cresce em silêncio, profundo e verdadeiro.',
    'Semana 4: Obrigado por existir — você é a minha flor favorita.',
    'Semana 5: Cada detalhe seu me encanta; cada momento, uma lembrança linda.',
    'Semana 6: Você é a poesia mais bonita que meu coração já leu.'
  ],
  // Fotos iniciais (opcional). Sem URLs externas; mantemos placeholders visuais
  initialPhotos: []
};

// Utilidade de datas: calcula número da semana desde a data inicial
function getWeekNumberSince(startDateStr) {
  const start = new Date(startDateStr + 'T00:00:00');
  const now = new Date();
  const diff = now - start;
  if (diff < 0) return 0; // antes do início
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / weekMs) + 1; // Semana 1 é a primeira semana
}

// IndexedDB simples para fotos
const DB_NAME = 'hadassa_album_db';
const DB_VERSION = 1;
const STORE = 'photos';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('IndexedDB não suportado'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addPhoto(blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE);
    store.add({ blob, createdAt: Date.now() });
  });
}

async function getAllPhotos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.index('createdAt').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Renderização
const els = {
  coupleName: document.getElementById('couple-name'),
  tagline: document.getElementById('tagline'),
  year: document.getElementById('year'),
  fixed: document.getElementById('fixed-messages'),
  slides: document.getElementById('slides'),
  thumbs: document.getElementById('thumbs'),
  prev: document.getElementById('prev-slide'),
  next: document.getElementById('next-slide'),
  input: document.getElementById('photo-input'),
  modal: document.getElementById('weekly-modal'),
  modalTitle: document.getElementById('weekly-title'),
  modalMsg: document.getElementById('weekly-message'),
  modalClose: document.getElementById('close-weekly'),
  backdrop: document.getElementById('weekly-backdrop')
};

function setHeader() {
  els.coupleName.textContent = SITE_CONFIG.coupleName;
  els.tagline.textContent = SITE_CONFIG.tagline;
  els.year.textContent = new Date().getFullYear();
}

function renderFixedMessages() {
  els.fixed.innerHTML = '';
  SITE_CONFIG.fixedMessages.forEach(msg => {
    const card = document.createElement('article');
    card.className = 'message-card glass';
    const h3 = document.createElement('h3');
    h3.textContent = msg.title;
    const p = document.createElement('p');
    p.textContent = msg.text;
    card.append(h3, p);
    els.fixed.append(card);
  });
}

// Carrossel simples
let currentIndex = 0;
let currentPhotos = []; // {url, isObjectURL}

function createPlaceholderSVG(text) {
  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='#a6d4ff' stop-opacity='0.35'/>
          <stop offset='100%' stop-color='#9ad6d2' stop-opacity='0.35'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='url(%23g)'/>
      <g fill='#6fb0a7' fill-opacity='0.35'>
        <circle cx='200' cy='180' r='120'/>
        <circle cx='1000' cy='220' r='140'/>
        <circle cx='620' cy='560' r='160'/>
      </g>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Segoe UI, Arial, sans-serif' font-size='40' fill='#0d3a3a'>${text}</text>
    </svg>
  `);
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

function updateCarouselPosition() {
  const w = els.slides.clientWidth; // width of container
  els.slides.style.transform = `translateX(${-currentIndex * w}px)`;
  Array.from(document.querySelectorAll('.thumb')).forEach((t, i) => {
    t.classList.toggle('active', i === currentIndex);
  });
}

function onResize() { updateCarouselPosition(); }

function renderCarousel(photos) {
  currentPhotos = photos;
  els.slides.innerHTML = '';
  els.thumbs.innerHTML = '';

  if (!photos.length) {
    const slide = document.createElement('div');
    slide.className = 'slide';
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    const img = new Image();
    img.alt = 'Foto floral abstrata';
    img.src = createPlaceholderSVG('Seu álbum aparecerá aqui ♡');
    placeholder.append(img);
    slide.append(placeholder);
    els.slides.append(slide);
    return;
  }

  photos.forEach((photo, i) => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    const img = new Image();
    img.loading = 'lazy';
    img.alt = `Foto ${i+1}`;
    img.src = photo.url;
    slide.append(img);
    els.slides.append(slide);

    const t = document.createElement('button');
    t.className = 'thumb';
    const ti = new Image();
    ti.alt = `Miniatura ${i+1}`;
    ti.src = photo.url;
    t.append(ti);
    t.addEventListener('click', () => {
      currentIndex = i; updateCarouselPosition();
    });
    els.thumbs.append(t);
  });

  currentIndex = 0; updateCarouselPosition();
}

function bindCarouselControls() {
  els.prev.addEventListener('click', () => {
    if (!currentPhotos.length) return;
    currentIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
    updateCarouselPosition();
  });
  els.next.addEventListener('click', () => {
    if (!currentPhotos.length) return;
    currentIndex = (currentIndex + 1) % currentPhotos.length;
    updateCarouselPosition();
  });
  document.getElementById('carousel').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') els.prev.click();
    if (e.key === 'ArrowRight') els.next.click();
  });
  window.addEventListener('resize', onResize);
}

// Upload de fotos -> IndexedDB
function bindUpload() {
  els.input.addEventListener('change', async (ev) => {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;

    for (const f of files) {
      // proteção simples para arquivos muito grandes (ex: > 10MB)
      if (f.size > 10 * 1024 * 1024) {
        alert(`A foto "${f.name}" é maior que 10MB. Tente uma versão menor.`);
        continue;
      }
      try {
        const blob = f.slice(0, f.size, f.type);
        await addPhoto(blob);
      } catch (err) {
        console.error('Falha ao salvar foto:', err);
        alert('Não foi possível salvar uma das fotos.');
      }
    }
    await loadAndRenderPhotos();
    els.input.value = '';
  });
}

// Carrega fotos do DB e substitui placeholders
async function loadAndRenderPhotos() {
  let items = [];
  try {
    items = await getAllPhotos();
  } catch (e) {
    console.warn('IndexedDB indisponível, usando placeholders.');
  }

  // Combine fotos iniciais (se houver) + DB
  const photos = [];
  for (const p of SITE_CONFIG.initialPhotos) {
    photos.push({ url: p, isObjectURL: false });
  }
  for (const it of items) {
    const url = URL.createObjectURL(it.blob);
    photos.push({ url, isObjectURL: true });
  }

  // Limpeza de object URLs quando recarregar
  // (neste fluxo simples, rely no garbage collector quando a página fecha)
  renderCarousel(photos);
}

// Modal semanal
const STORAGE_KEYS = { lastShownWeek: 'hadassa_last_week_shown' };

function showWeeklyModalIfNeeded() {
  const week = getWeekNumberSince(SITE_CONFIG.startDate);
  if (week <= 0) return; // ainda não começou

  const last = parseInt(localStorage.getItem(STORAGE_KEYS.lastShownWeek) || '0', 10);
  if (last === week) return; // já mostramos nesta semana

  const idx = Math.min(week - 1, SITE_CONFIG.weeklyMessages.length - 1);
  const message = SITE_CONFIG.weeklyMessages[idx] || `Semana ${week}: Com você, tudo fica mais bonito.`;

  els.modalTitle.textContent = `Semana ${week}`;
  els.modalMsg.textContent = message;
  openModal();
  localStorage.setItem(STORAGE_KEYS.lastShownWeek, String(week));
}

function openModal() {
  els.modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  els.modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

function bindModal() {
  els.modalClose.addEventListener('click', closeModal);
  els.backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modal.hasAttribute('hidden')) closeModal();
  });
}

function init() {
  setHeader();
  renderFixedMessages();
  bindCarouselControls();
  bindUpload();
  bindModal();
  loadAndRenderPhotos();
  // aguarda um pequeno atraso para a animação do modal ficar suave
  setTimeout(showWeeklyModalIfNeeded, 600);
}

document.addEventListener('DOMContentLoaded', init);
