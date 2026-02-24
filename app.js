// متغیر کمکی برای جلوگیری از تداخل نام
let allMeds = [];

document.addEventListener('DOMContentLoaded', () => {
  // خواندن امن داده‌ها
  allMeds = window.medications || (typeof medications !== 'undefined' ? medications : []);

  if (allMeds.length === 0) {
    console.error("⚠️ داده‌های دارو لود نشد!");
    document.getElementById('medList').innerHTML = `<p style="text-align:center; padding:20px; color:red;">خطا در بارگذاری دیتابیس!</p>`;
  } else {
    renderList(allMeds);
  }
  
  checkFirstVisit();
  
  // اعمال حالت تاریک در صورت ذخیره قبلی
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

// نمایش هشدار اول بار ورود
function checkFirstVisit() {
  if (!localStorage.getItem('disclaimerAccepted')) {
    document.getElementById('disclaimerModal').classList.remove('hidden');
  }
}

function acceptDisclaimer() {
  localStorage.setItem('disclaimerAccepted', 'true');
  document.getElementById('disclaimerModal').classList.add('hidden');
}

// تغییر تم (حالت شب و روز)
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// رندر کردن لیست داروها در صفحه اصلی
function renderList(data) {
  const list = document.getElementById('medList');
  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = `<p style="text-align:center; padding: 2rem; color: var(--text-mut);">دارویی پیدا نشد 😕</p>`;
    return;
  }

  data.forEach(med => {
    const card = document.createElement('div');
    card.className = 'card'; // کلاس تعریف شده در CSS
    card.onclick = () => showDetail(med);
    card.innerHTML = `
      <div>
        <div class="en-title">${med.en_name}</div>
        <div class="fa-title">${med.fa_name}</div>
      </div>
      <div style="font-size: 1.2rem; color: var(--primary);">←</div>
    `;
    list.appendChild(card);
  });
}

// فیلتر کردن و جستجو
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const filtered = allMeds.filter(med =>
    med.en_name.toLowerCase().includes(query) ||
    med.fa_name.toLowerCase().includes(query) ||
    (med.fa_desc && med.fa_desc.toLowerCase().includes(query))
  );
  renderList(filtered);
});

// نمایش جزئیات دارو
function showDetail(med) {
  document.getElementById('main-view').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('hidden');
  document.getElementById('det-en').innerText = med.en_name;
  document.getElementById('det-fa').innerText = med.fa_name;
  document.getElementById('det-desc').innerText = med.fa_desc || 'توضیحاتی برای این دارو ثبت نشده است.';
  window.scrollTo(0, 0);
}

// بازگشت به لیست اصلی
function goBack() {
  document.getElementById('main-view').classList.remove('hidden');
  document.getElementById('detail-view').classList.add('hidden');
}

// ثبت سرویس ورکر برای حالت آفلاین (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.error("SW Registration Failed:", err));
}


