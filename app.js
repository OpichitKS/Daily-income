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
  const weekPicker=document.querySelector('#weekPicker');
  if(weekPicker) weekPicker.value=localISO(start);
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
  const titheBase=Math.max(0,totals.profit);
  const tithe=Math.ceil(titheBase*0.10);
  const titheAmount=document.querySelector('#titheAmount');
  if(titheAmount) titheAmount.textContent='฿'+tithe.toLocaleString('th-TH');

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


const prevWeekBtn=document.querySelector('#prevWeek');
const nextWeekBtn=document.querySelector('#nextWeek');
const weekPicker=document.querySelector('#weekPicker');

prevWeekBtn.addEventListener('click',()=>{
  selectedWeekStart=addDays(selectedWeekStart,-7);
  render();
});

nextWeekBtn.addEventListener('click',()=>{
  selectedWeekStart=addDays(selectedWeekStart,7);
  render();
});

weekPicker.addEventListener('change',()=>{
  if(!weekPicker.value) return;
  selectedWeekStart=weekStart(parseISO(weekPicker.value));
  render();
});

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

const exportBtn=document.querySelector('#exportData');
const importInput=document.querySelector('#importData');
const backupStatus=document.querySelector('#backupStatus');

if(exportBtn){
  exportBtn.addEventListener('click',()=>{
    const payload={app:'Daily Income',version:1,exportedAt:new Date().toISOString(),records};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`daily-income-backup-${localISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    if(backupStatus) backupStatus.textContent='Export ข้อมูลเรียบร้อยแล้ว';
  });
}

if(importInput){
  importInput.addEventListener('change',async()=>{
    const file=importInput.files && importInput.files[0];
    if(!file) return;
    try{
      const data=JSON.parse(await file.text());
      const imported=data && data.records ? data.records : data;
      if(!imported || typeof imported!=='object' || Array.isArray(imported)) throw new Error();
      const count=Object.keys(imported).length;
      if(confirm(`พบข้อมูล ${count} วัน ต้องการ Import หรือไม่? ข้อมูลวันที่ซ้ำจะใช้ข้อมูลจากไฟล์ Backup`)){
        records={...records,...imported};
        localStorage.setItem(STORAGE,JSON.stringify(records));
        render();
        if(backupStatus) backupStatus.textContent=`Import สำเร็จ ${count} วัน`;
      }
    }catch(e){
      if(backupStatus) backupStatus.textContent='Import ไม่สำเร็จ: ไฟล์ Backup ไม่ถูกต้อง';
    }finally{
      importInput.value='';
    }
  });
}

const SUPABASE_URL='https://efuryjvcyqnuqgzkajrd.supabase.co';
const SUPABASE_KEY='sb_publishable_3ZqafiZpbw95qWF2Wnc1lA_CC2Y5TjS';
const cloud=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let currentUser=null;
async function loadCloud(){
 const {data,error}=await cloud.from('daily_records').select('*').eq('user_id',currentUser.id);
 if(error){console.error(error);return} records={};
 (data||[]).forEach(r=>records[r.record_date]={income:+r.income,distance:+r.distance,fuel:+r.fuel,depreciation:+r.depreciation,profit:+r.net_income});
 render();
}
async function saveCloud(){
 if(!currentUser)return;if(!dateInput.value)return;
 const r=calc(),row={user_id:currentUser.id,record_date:dateInput.value,income:r.income,distance:r.distance,fuel:r.fuel,depreciation:r.depreciation,net_income:r.profit,updated_at:new Date().toISOString()};
 const {error}=await cloud.from('daily_records').upsert(row,{onConflict:'user_id,record_date'});
 if(error){$('#status').textContent='บันทึกไม่สำเร็จ: '+error.message;return}records[dateInput.value]=r;render();$('#status').textContent='บันทึกลง Database เรียบร้อยแล้ว';
}
async function clearCloud(){
 if(!confirm('ต้องการล้างข้อมูลทั้งหมดของสัปดาห์ที่กำลังแสดงใช่ไหม?'))return;
 const s=new Date(selectedWeekStart),e=addDays(s,6);
 const {error}=await cloud.from('daily_records').delete().eq('user_id',currentUser.id).gte('record_date',localISO(s)).lte('record_date',localISO(e));
 if(error){$('#status').textContent=error.message;return}await loadCloud();
}
async function migrateLocal(){
 const old=JSON.parse(localStorage.getItem(STORAGE)||'{}'),entries=Object.entries(old),key='cloud-migrated-'+currentUser.id;
 if(!entries.length||localStorage.getItem(key))return;
 if(!confirm(`พบข้อมูลเดิม ${entries.length} วัน ต้องการย้ายขึ้น Supabase หรือไม่?`))return;
 const rows=entries.map(([d,r])=>({user_id:currentUser.id,record_date:d,income:+(r.income||0),distance:+(r.distance||0),fuel:+(r.fuel||0),depreciation:+(r.depreciation||0),net_income:+(r.profit??r.net_income??0)}));
 const {error}=await cloud.from('daily_records').upsert(rows,{onConflict:'user_id,record_date'});if(!error){localStorage.setItem(key,'1');await loadCloud();alert('ย้ายข้อมูลสำเร็จ')}
}
async function sessionOn(session){currentUser=session?.user||null;document.querySelector('#authGate').classList.toggle('hidden',!!currentUser);if(currentUser){await loadCloud();await migrateLocal()}}
document.querySelector('#loginBtn').onclick=async()=>{const status=document.querySelector('#authStatus');const {data,error}=await cloud.auth.signInWithPassword({email:document.querySelector('#authEmail').value.trim(),password:document.querySelector('#authPassword').value});if(error){status.textContent=error.message;return}await sessionOn(data.session)};
document.querySelector('#logoutBtn').onclick=()=>cloud.auth.signOut();
cloud.auth.onAuthStateChange((_e,s)=>setTimeout(()=>sessionOn(s),0));
(async()=>{const {data:{session}}=await cloud.auth.getSession();await sessionOn(session)})();
document.querySelector('#saveBtn').onclick=saveCloud;
document.querySelector('#clearWeek').onclick=clearCloud;
