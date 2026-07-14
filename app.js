const $=s=>document.querySelector(s);
const fmt=n=>'฿'+Number(n||0).toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2});
const dateInput=$('#date'), income=$('#income'), distance=$('#distance');
const fuel=$('#fuel'), dep=$('#depreciation'), profit=$('#profit');
const STORAGE='daily-income-records-v1';
let records=JSON.parse(localStorage.getItem(STORAGE)||'{}');

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
  const start=weekStart(new Date()), end=addDays(start,6);
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
  if(!confirm('ต้องการล้างข้อมูลทั้งหมดของสัปดาห์ปัจจุบันใช่ไหม?')) return;
  const start=weekStart(new Date());
  for(let i=0;i<7;i++) delete records[localISO(addDays(start,i))];
  localStorage.setItem(STORAGE,JSON.stringify(records)); render(); $('#status').textContent='ล้างข้อมูลสัปดาห์นี้แล้ว';
};
document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.tab,.page').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); $('#'+btn.dataset.page).classList.add('active');
});
dateInput.value=localISO(); calc(); render();
