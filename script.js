// Lightbox with no-crop images + gallery
const state = { products: [], lang: 'en', category: 'All' };

function formatINR(n){ return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(n); }
function categoryList(items){ return ['All', ...new Set(items.map(p=>p.category))]; }

function renderFilters(){
  const el = document.getElementById('filters');
  el.innerHTML = '';
  categoryList(state.products).forEach(cat => {
    const b = document.createElement('button');
    b.textContent = cat;
    b.className = (cat===state.category ? 'active':''); 
    b.onclick = ()=>{ state.category = cat; renderGrid(); renderFilters(); };
    el.appendChild(b);
  });
}

const lightboxState = { images: [], index: 0 };
function openLightboxWith(imgs, startIndex = 0){
  lightboxState.images = Array.isArray(imgs) ? imgs : (imgs ? [imgs] : []);
  lightboxState.index = Math.max(0, Math.min(startIndex, lightboxState.images.length - 1));
  showLightboxImage();
  const lb = document.getElementById('lightbox');
  lb.style.display = 'flex';
  lb.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
}
function showLightboxImage(){
  const src = lightboxState.images[lightboxState.index] || '';
  document.getElementById('lightboxImg').src = src;
}
function nextImage(){
  if (!lightboxState.images.length) return;
  lightboxState.index = (lightboxState.index + 1) % lightboxState.images.length;
  showLightboxImage();
}
function prevImage(){
  if (!lightboxState.images.length) return;
  lightboxState.index = (lightboxState.index - 1 + lightboxState.images.length) % lightboxState.images.length;
  showLightboxImage();
}
function closeLightbox(){
  const lb = document.getElementById('lightbox');
  lb.style.display = 'none';
  lb.setAttribute('aria-hidden','true');
  document.body.classList.remove('no-scroll');
}
document.addEventListener('keydown', (e)=>{
  const visible = document.getElementById('lightbox').style.display === 'flex';
  if (!visible) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
});
document.getElementById('lightbox').addEventListener('click', (e)=>{
  if (e.target.id === 'lightbox') closeLightbox();
});

function renderGrid(){
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  let items = state.products;
  if(state.category!=='All'){ items = items.filter(p => p.category === state.category); }

  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';

    const imgs = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
    const main = document.createElement('img');
    main.className = 'main';
    main.src = imgs[0] || '';
    main.alt = p.name_en;
    main.dataset.currentIndex = 0;
    main.onclick = ()=> openLightboxWith(imgs, parseInt(main.dataset.currentIndex, 10) || 0);
    card.appendChild(main);

    const info = document.createElement('div');
    info.className = 'info';

    const name = document.createElement('div');
    name.textContent = (state.lang==='ta' ? p.name_ta : p.name_en);

    const cat = document.createElement('div');
    cat.innerHTML = '<span class="pill">'+p.category+'</span>';

    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = formatINR(p.price) + ' / ' + p.unit;

    if (imgs.length > 1){
      const strip = document.createElement('div');
      strip.className = 'thumbs';
      imgs.forEach((src, i)=>{
        const t = document.createElement('img');
        t.src = src;
        t.alt = (p.name_en || '') + ' ' + (i+1);
        t.onclick = () => { main.src = src; main.dataset.currentIndex = i; };
        strip.appendChild(t);
      });
      info.appendChild(strip);
    }

    const btn = document.createElement('a');
    const msg = encodeURIComponent(`Hello NSAM, I want to order: ${p.sku} – ${p.name_en} (${p.unit}). Price ${p.price}.`);
    btn.href = 'https://wa.me/919944291896?text=' + msg;
    btn.target = '_blank';
    btn.className = 'btn';
    btn.textContent = (state.lang==='ta' ? 'வாட்ஸ்அப்பில் ஆர்டர் செய்ய' : 'Order on WhatsApp');

    info.appendChild(name); info.appendChild(cat); info.appendChild(price); info.appendChild(btn);
    card.appendChild(info);
    grid.appendChild(card);
  });
}

function applyLanguage(){
  const t = document.getElementById('language').value;
  state.lang = t;
  document.getElementById('title').textContent = (t==='ta'?'ஆரோக்கிய எண்ணெய்கள் & நேர்மையான உணவுகள்':'Healthy Oils & Honest Foods');
  document.getElementById('subtitle').textContent = (t==='ta'?'கோல்ட்-பிரஸ்ட் எண்ணெய்கள், சுத்தமான மசாலா, மூலிகை பொடிகள். வாட்ஸ்அப்பில் ஆர்டர்—பெங்களூரு & தமிழ்நாடு டெலிவரி.':'Cold-pressed oils, clean masalas, and herbal powders. Order on WhatsApp—Bengaluru & Tamil Nadu delivery.');
  document.getElementById('address').innerHTML = (t==='ta'
    ? '<strong>ஸ்டோர்:</strong> எலக்ட்ரானிக் சிட்டி பாசு-1, பெங்களூரு • ஹோம் டெலிவரி உள்ளது'
    : '<strong>Store:</strong> Electronic City Phase 1, Bengaluru • Door Delivery Available');
  renderGrid();
}

async function init(){
  try{
    const res = await fetch('products.json?v=6', { cache: 'no-store' });
    if(!res.ok) throw new Error('products.json not found ('+res.status+')');
    state.products = await res.json();
    if(!Array.isArray(state.products)) throw new Error('products.json must be an array');
    renderFilters(); renderGrid();
    document.getElementById('language').addEventListener('change', applyLanguage);
  }catch(err){
    console.error(err);
    document.getElementById('productGrid').innerHTML =
      '<div style="padding:16px;background:#fff3cd;border:1px solid #ffeeba;border-radius:8px;">' +
      'Could not load products. Ensure <code>products.json</code> is at the same level as <code>index.html</code> and is valid JSON.' +
      '</div>';
  }
}
init();
