// متغیرهای اصلی
let allMeds = [];
let currentFilter = 'all';

// یک دیکشنری هوشمند برای فیلتر کردن کلمات مشابه
const filterKeywords = {
  'مسکن': ['مسکن', 'درد', 'التهاب', 'تب', 'آرتروز'],
  'عفونت': ['عفونت', 'آنتی‌بیوتیک', 'باکتری', 'قارچ', 'ویروس', 'چرکی'],
  'قلب': ['قلب', 'فشار', 'عروق', 'خون', 'سکته'],
  'معده': ['معده', 'گوارش', 'روده', 'اسهال', 'تهوع', 'یبوست', 'نفخ', 'اسید'],
  'حساسیت': ['حساسیت', 'آلرژی', 'خارش', 'هیستامین', 'عطسه'],
  'ویتامین': ['ویتامین', 'مکمل', 'آهن', 'کلسیم', 'زینک', 'تغذیه']
};

document.addEventListener('DOMContentLoaded', () => {
  allMeds = window.medications || (typeof medications !== 'undefined' ? medications : []);
  
  if (allMeds.length === 0) {
    document.getElementById('medList').innerHTML = `<p style="text-align:center; padding:20px; color:red;">خطا در بارگذاری دیتابیس!</p>`;
  } else {
    renderList(allMeds);
  }
  
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }

  setupFilters();
});

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// دکمه‌های فیلتر سریع
function setupFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // استفاده از currentTarget تا اگر روی ایموجی هم کلیک شد کار کند
      btns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      currentFilter = e.currentTarget.getAttribute('data-filter');
      applySearchAndFilter();
    });
  });
}

// گوش دادن به تایپ در کادر جستجو
document.getElementById('searchInput').addEventListener('input', () => {
  applySearchAndFilter();
});

// تابع مرکزی که ترکیب سرچ، دکمه‌ها و علاقه‌مندی‌ها را مدیریت می‌کند
function applySearchAndFilter() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  
  const filtered = allMeds.filter(med => {
    // ۱. بررسی تطابق با متن سرچ شده
    const matchesSearch = med.en_name.toLowerCase().includes(query) || 
                          med.fa_name.toLowerCase().includes(query) || 
                          (med.fa_desc && med.fa_desc.toLowerCase().includes(query));
    
    // ۲. بررسی دکمه فیلتر انتخاب شده
    let matchesFilter = true;
    
    if (currentFilter === 'favorites') {
      matchesFilter = isFavorite(med.id);
    } 
    else if (currentFilter !== 'all') {
      const keywords = filterKeywords[currentFilter] || [currentFilter];
      // اگر حداقل یکی از کلمات کلیدی در توضیحات دارو باشد، آن را نشان بده
      matchesFilter = keywords.some(kw => med.fa_desc && med.fa_desc.includes(kw));
    }
    
    return matchesSearch && matchesFilter;
  });
  
  renderList(filtered);
}

function renderList(data) {
  const list = document.getElementById('medList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = `<p style="text-align:center; padding: 2rem; color: var(--text-mut);">دارویی پیدا نشد 😕</p>`;
    return;
  }

  data.forEach(med => {
    const card = document.createElement('div');
    card.className = 'card'; 
    card.onclick = () => showDetail(med);
    card.innerHTML = `
      <div>
        <div class="en-title">${med.en_name}</div>
        <div class="fa-title">${med.fa_name}</div>
      </div>
      <button onclick="event.stopImmediatePropagation(); toggleFavorite(${med.id});" 
              style="background:none; border:none; font-size:1.6rem; cursor:pointer;">
        ${isFavorite(med.id) ? '❤️' : '♡'}
      </button>
    `;
    list.appendChild(card);
  });
}

// سیستم علاقه‌مندی‌ها
function toggleFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
  applySearchAndFilter(); // برای آپدیت فوری صفحه
}

function isFavorite(id) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favs.includes(id);
}

function showDetail(med) {
  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('hidden');
  document.getElementById('det-en').innerText = med.en_name;
  document.getElementById('det-fa').innerText = med.fa_name;
  document.getElementById('det-desc').innerText = med.fa_desc || 'توضیحاتی ثبت نشده است.';
  window.scrollTo(0, 0);
}

function goBack() {
  document.getElementById('main-view').classList.remove('hidden');
  document.getElementById('detail-view').classList.add('hidden');
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.error(err));
}
