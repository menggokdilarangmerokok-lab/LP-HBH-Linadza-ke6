// ---- Inisialisasi Firebase ----
const firebaseConfig = {
  databaseURL: "https://landig-page-hbh-limadza-default-rtdb.firebaseio.com/"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const TARGET = 15000000;
const EVENT_DATE = new Date('2027-04-04T10:00:00+07:00');

function formatRupiah(n){
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

// ---- Countdown ----
function tickCountdown(){
  const cdHari = document.getElementById('cdHari');
  const cdJam = document.getElementById('cdJam');
  const cdMenit = document.getElementById('cdMenit');
  const cdDetik = document.getElementById('cdDetik');

  if(!cdHari) return;

  const now = new Date();
  const diff = EVENT_DATE - now;
  if(diff <= 0){
    cdHari.textContent = 0;
    cdJam.textContent = '00';
    cdMenit.textContent = '00';
    cdDetik.textContent = '00';
    return;
  }
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  cdHari.textContent = d;
  cdJam.textContent = String(h).padStart(2,'0');
  cdMenit.textContent = String(m).padStart(2,'0');
  cdDetik.textContent = String(s).padStart(2,'0');
}
tickCountdown();
setInterval(tickCountdown, 1000);

// ---- Visitor Count (Firebase) ----
function bumpVisitorCount(){
  const visitorRef = db.ref('visitorCount');
  visitorRef.transaction((currentValue) => {
    return (currentValue || 0) + 1;
  });
}

// ---- Render Progress Bar ----
function renderGauge(total){
  const barFill = document.getElementById('barFill');
  const gaugePercent = document.getElementById('gaugePercent');
  const donasiAmount = document.getElementById('donasiAmount');

  const pct = Math.max(0, Math.min(100, (total / TARGET) * 100));
  if(barFill) barFill.style.width = pct + '%';
  if(gaugePercent) gaugePercent.textContent = Math.round(pct) + '%';
  if(donasiAmount) donasiAmount.textContent = formatRupiah(total);
}

// ---- Listen Data Donasi Real-time dari Firebase ----
db.ref('donations').on('value', (snapshot) => {
  const data = snapshot.val();
  let total = 0;
  if (data) {
    const list = Object.values(data);
    total = list.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  }
  renderGauge(total);
});

// ---- Copy Rekening Handler ----
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-target');
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    
    const num = targetEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(num);
    } catch(e) {
      const ta = document.createElement('textarea');
      ta.value = num;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    
    const original = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = 'Tersalin!';
    setTimeout(() => { 
      btn.classList.remove('copied'); 
      btn.innerHTML = original; 
    }, 2000);
  });
});

// ---- Inisialisasi awal ----
(function init(){
  bumpVisitorCount();
})();