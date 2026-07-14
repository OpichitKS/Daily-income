const $=s=>document.querySelector(s);
const fmt=n=>'฿'+Number(n||0).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
const dateInput=$('#date'), income=$('#income'), distance=$('#distance');
const fuel=$('#fuel'), dep=$('#depreciation'), profit=$('#profit');
const STORAGE='daily-income-records-v1';
let records=JSON.parse(localStorage.getItem(STORAGE)||'{}');
let selectedWeekStart=weekStart(new Date());

function localISO(d=new Date()){ const x=new Date(d.getTime()-d.getTimezoneOffset()*60000); return x.toISOString().slice(0,10); }
function parseISO(s){ const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); }
function weekStart(d){ const x=new Date(d); const day=(x.getDay()+6)%7; x.setHours(0,0,0,0); x.setDate(x.getDate()-day); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function calc(){
  const inc=+income.value||0, km=+distance.value||0, f=km*1.5, de=km, p=inc-f-de;
  fuel.textContent=fmt(f); dep.textContent=fmt(de); profit.textContent=fmt(p);
  return {income:inc,distance:km,fuel:f,depreciation:de,profit:p};
}
function thaiDate(d){return d.toLocaleDateString('th-TH',{day:'numeric',month:'short'});}
function render(){
  const start=new Date(selectedWeekStart), end=addDays(start,6);
  const currentStart=weekStart(new Date());
  const isCurrent=localISO(start)===localISO(currentStart);
  const title=document.querySelector('#weekSummaryTitle');
  if(title) title.textContent=isCurrent?'สรุปสัปดาห์ปัจจุบัน':'สรุปสัปดาห์ย้อนหลัง';
  $('#weekRange').textContent=`${thaiDate(start)} – ${thaiDate(end)}`;
  const names=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];
  let totals={income:0,distance:0,fuel:0,depreciation:0,profit:0};
  $('#weekBody').innerHTML=names.map((name,i)=>{
    const d=addDays(start,i), key=localISO(d), r=records[key];
    if(r) Object.keys(totals).forEach(k=>totals[k]+=Number(r[k]||0));
    return `<tr data-date="${key}" class="${r?'has-data':''}">
      <td><strong>${name}</strong><br><small>${thaiDate(d)}</small></td>
      <td>${r?fmt(r.income):'—'}</td><td>${r?Number(r.distance).toLocaleString('th-TH')+' กม.':'—'}</td>
      <td>${r?fmt(r.fuel):'—'}</td><td>${r?fmt(r.depreciation):'—'}</td><td>${r?fmt(r.profit):'—'}</td>
    </tr>`;
  }).join('');
  $('#weekFoot').innerHTML=`<tr><td>รวมสัปดาห์</td><td>${fmt(totals.income)}</td><td>${totals.distance.toLocaleString('th-TH')} กม.</td><td>${fmt(totals.fuel)}</td><td>${fmt(totals.depreciation)}</td><td>${fmt(totals.profit)}</td></tr>`;
  document.querySelectorAll('tr.has-data').forEach(tr=>tr.onclick=()=>loadRecord(tr.dataset.date));
}
function loadRecord(key){
  const r=records[key]; if(!r)return;
  dateInput.value=key; income.value=r.income; distance.value=r.distance; calc();
  window.scrollTo({top:0,behavior:'smooth'}); $('#status').textContent='กำลังแก้ไขข้อมูลวันที่เลือก';
}
function save(){
  if(!dateInput.value){$('#status').textContent='กรุณาเลือกวันที่';return}
  const r=calc();
  if(!income.value && !distance.value){$('#status').textContent='กรุณากรอกรายได้หรือระยะทาง';return}
  records[dateInput.value]={...r,updatedAt:new Date().toISOString()};
  localStorage.setItem(STORAGE,JSON.stringify(records)); render();
  $('#status').textContent='บันทึกข้อมูลเรียบร้อยแล้ว';
}
[income,distance].forEach(el=>el.addEventListener('input',calc));
$('#saveBtn').onclick=save;
$('#clearWeek').onclick=()=>{
  if(!confirm('ต้องการล้างข้อมูลทั้งหมดของสัปดาห์ที่กำลังแสดงใช่ไหม?')) return;
  const start=new Date(selectedWeekStart);
  for(let i=0;i<7;i++) delete records[localISO(addDays(start,i))];
  localStorage.setItem(STORAGE,JSON.stringify(records)); render(); $('#status').textContent='ล้างข้อมูลสัปดาห์ที่เลือกแล้ว';
};
document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.tab,.page').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); $('#'+btn.dataset.page).classList.add('active');
});

document.querySelector('#prevWeek').onclick=()=>{
  selectedWeekStart=addDays(selectedWeekStart,-7);
  render();
};
document.querySelector('#nextWeek').onclick=()=>{
  selectedWeekStart=addDays(selectedWeekStart,7);
  render();
};
document.querySelector('#weekRange').onclick=()=>{
  selectedWeekStart=weekStart(new Date());
  render();
};

dateInput.value=localISO(); calc(); render();


const THEME_KEY='daily-income-theme-v1';
function applyTheme(theme){
  document.documentElement.dataset.theme=theme;
  localStorage.setItem(THEME_KEY,theme);
  const dark=theme==='dark';
  const icon=document.querySelector('#themeIcon');
  const label=document.querySelector('#themeLabel');
  if(icon) icon.textContent=dark?'☀️':'🌙';
  if(label) label.textContent=dark?'Light Mode':'Dark Mode';
}
const savedTheme=localStorage.getItem(THEME_KEY);
const preferredDark=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (preferredDark?'dark':'light'));
document.querySelector('#themeToggle').onclick=()=>{
  applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
};
