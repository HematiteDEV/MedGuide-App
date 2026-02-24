let allMeds = [];
let currentFilter = 'all';
let currentMedToShare = null; // برای ذخیره دارویی که در حال نمایش است
let deferredPrompt; // متغیر برای ذخیره رویداد نصب

const filterKeywords = {
  'مسکن': ['مسکن', 'درد', 'التهاب', 'تب', 'آرتروز'],
  'عفونت': ['عفونت', 'آنتی‌بیوتیک', 'باکتری', 'قارچ', 'ویروس', 'چرکی'],
  'قلب': ['قلب', 'فشار', 'عروق', 'خون', 'سکته'],
  'معده': ['معده', 'گوارش', 'روده', 'اسهال', 'تهوع', 'یبوست', 'نفخ', 'اسید'],
  'حساسیت': ['حساسیت', 'آلرژی', 'خارش', 'هیستامین', 'عطسه'],
  'ویتامین': ['ویتامین', 'مکمل', 'آهن', 'کلسیم', 'زینک', 'تغذیه']
};

// نمایش دکمه نصب اگر اپلیکیشن نصب نشده باشد
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('installBtn');
  if(installBtn) installBtn.classList.remove('hidden');
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('App Installed');
      }
      deferredPrompt = null;
      document.getElementById('installBtn').classList.add('hidden');
    });
  }
}

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

function setupFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentFilter = e.currentTarget.getAttribute('data-filter');
      applySearchAndFilter();
    });
  });
}

document.getElementById('searchInput').addEventListener('input', applySearchAndFilter);

function applySearchAndFilter() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  
  const filtered = allMeds.filter(med => {
    const matchesSearch = med.en_name.toLowerCase().includes(query) ||
                          med.fa_name.toLowerCase().includes(query) ||
                          (med.fa_desc && med.fa_desc.toLowerCase().includes(query));
    
    let matchesFilter = true;
    if (currentFilter === 'favorites') {
      matchesFilter = isFavorite(med.id);
    } else if (currentFilter !== 'all') {
      const keywords = filterKeywords[currentFilter] || [currentFilter];
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

function toggleFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
  } else {
    favs.push(id);
  }
  localStorage.setItem('favorites', JSON.stringify(favs));
  applySearchAndFilter();
}

function isFavorite(id) {
  const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
  return favs.includes(id);
}

function showDetail(med) {
  currentMedToShare = med; // ذخیره اطلاعات برای اشتراک‌گذاری
  
  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('hidden');
  document.getElementById('det-en').innerText = med.en_name;
  document.getElementById('det-fa').innerText = med.fa_name;
  document.getElementById('det-desc').innerText = med.fa_desc || 'توضیحاتی ثبت نشده است.';
  
  // مخفی کردن دکمه اشتراک‌گذاری در صورتی که مرورگر (مثل مرورگرهای دسکتاپ قدیمی) از آن پشتیبانی نکند
  if (!navigator.share) {
    document.getElementById('shareBtn').style.display = 'none';
  }
  
  window.scrollTo(0, 0);
}

// تابع اشتراک‌گذاری (Share)
function shareMed() {
  if (navigator.share && currentMedToShare) {
    const shareText = `💊 نام دارو: ${currentMedToShare.en_name} (${currentMedToShare.fa_name})\n\nℹ️ توضیحات: ${currentMedToShare.fa_desc}\n\n📚 منبع: MedGuide (دانشنامه آفلاین)`;
    
    navigator.share({
      title: currentMedToShare.fa_name,
      text: shareText
    }).catch(err => console.log('اشتراک‌گذاری لغو شد', err));
  } else {
    alert("مرورگر شما از قابلیت اشتراک‌گذاری پشتیبانی نمی‌کند.");
  }
}

function goBack() {
  document.getElementById('main-view').classList.remove('hidden');
  document.getElementById('detail-view').classList.add('hidden');
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.error(err));
}
