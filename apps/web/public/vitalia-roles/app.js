/* VITALIA · Portales de demostración · SIN autenticación ni datos clínicos reales.
   Datos compartidos entre roles únicamente en este origen/navegador (localStorage). */
'use strict';

const STORE = 'vitalia_staff_web_demo_v1';
const SESSION = 'vitalia_staff_active_role';
const ROOT = document.getElementById('app');
const roles = {admin:'Administración', recepcion:'Recepción', medico:'Médico'};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr = esc;
const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = () => iso(new Date());
const plus = days => {const d=new Date();d.setDate(d.getDate()+days);return iso(d);};
const stamp = () => new Date().toISOString();
const dt = s => s ? new Date(s).toLocaleString('es-DO',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
const dateLabel = s => { if(!s) return '—';const d=new Date(s+'T12:00:00');return isNaN(d)?s:d.toLocaleDateString('es-DO',{day:'2-digit',month:'short',year:'numeric'});};
const id = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2,5).toUpperCase()}`;
const seed = () => ({version:2,
  specialties:[
    {id:'SP01',name:'Medicina interna',description:'Atención integral del adulto.',active:true},
    {id:'SP02',name:'Cardiología',description:'Prevención, diagnóstico y seguimiento cardiovascular.',active:true},
    {id:'SP03',name:'Pediatría',description:'Atención médica de niños y adolescentes.',active:true},
    {id:'SP04',name:'Dermatología',description:'Evaluación y tratamiento de afecciones de la piel.',active:true}
  ],
  hospitals:[
    {id:'H01',name:'Hospital Vitalia Santo Domingo',city:'Santo Domingo',phone:'809-000-1001',active:true},
    {id:'H02',name:'Hospital Vitalia Santiago',city:'Santiago',phone:'809-000-1002',active:true},
    {id:'H03',name:'Hospital Vitalia Bávaro',city:'Bávaro',phone:'809-000-1003',active:true}],
  doctors:[
    {id:'D01',name:'Dra. Ana Torres',specialtyId:'SP01',hospitalId:'H01',license:'DEMO-4721',email:'ana.torres@vitalia.demo',phone:'809-000-4721',consultationRoom:'Consultorio 01',availability:defaultAvailability(),active:true},
    {id:'D02',name:'Dr. Rafael Núñez',specialtyId:'SP02',hospitalId:'H01',license:'DEMO-4722',email:'rafael.nunez@vitalia.demo',phone:'809-000-4722',consultationRoom:'Consultorio 02',availability:defaultAvailability(),active:true},
    {id:'D03',name:'Dra. Carolina Peña',specialtyId:'SP03',hospitalId:'H02',license:'DEMO-4723',email:'carolina.pena@vitalia.demo',phone:'809-000-4723',consultationRoom:'Consultorio 01',availability:defaultAvailability(),active:true},
    {id:'D04',name:'Dr. Daniel Guzmán',specialtyId:'SP04',hospitalId:'H03',license:'DEMO-4724',email:'daniel.guzman@vitalia.demo',phone:'809-000-4724',consultationRoom:'Consultorio 01',availability:defaultAvailability(),active:true}],
  staff:[
    {id:'U01',name:'Administradora VITALIA',role:'Administrador',hospitalId:'H01',active:true},
    {id:'U02',name:'Recepcionista VITALIA',role:'Recepcionista',hospitalId:'H01',active:true},
    {id:'U03',name:'Recepcionista Santiago',role:'Recepcionista',hospitalId:'H02',active:true}],
  patients:[
    {id:'P01',name:'Elena Rivera',document:'DEMO-001',phone:'809-000-0101',ars:'ARS DEMO UNO'},
    {id:'P02',name:'Laura Méndez',document:'DEMO-002',phone:'809-000-0102',ars:'Sin seguro'},
    {id:'P03',name:'Carlos Rodríguez',document:'DEMO-003',phone:'809-000-0103',ars:'ARS DEMO DOS'},
    {id:'P04',name:'María López',document:'DEMO-004',phone:'809-000-0104',ars:'ARS DEMO UNO'}],
  insurers:[{id:'A01',name:'ARS DEMO UNO',status:'Vigente',coverage:80},{id:'A02',name:'ARS DEMO DOS',status:'Vigente',coverage:70}],
  appointments:[
    {id:'APT-1001',patientId:'P01',hospitalId:'H01',doctorId:'D01',specialtyId:'SP01',specialty:'Medicina interna',date:today(),time:'09:00',status:'Llegó',payment:'Pagado',amount:1500,source:'Recepción',paymentRef:'REC-DEMO-01',notes:''},
    {id:'APT-1002',patientId:'P02',hospitalId:'H01',doctorId:'D01',specialtyId:'SP01',specialty:'Medicina interna',date:today(),time:'10:30',status:'Confirmada',payment:'Pendiente',amount:1500,source:'Paciente (simulación)',paymentRef:'',notes:''},
    {id:'APT-1003',patientId:'P03',hospitalId:'H01',doctorId:'D02',specialtyId:'SP02',specialty:'Cardiología',date:today(),time:'11:00',status:'Confirmada',payment:'Pendiente',amount:2200,source:'Recepción',paymentRef:'',notes:''},
    {id:'APT-1004',patientId:'P04',hospitalId:'H02',doctorId:'D03',specialtyId:'SP03',specialty:'Pediatría',date:plus(1),time:'08:30',status:'Solicitada',payment:'Pendiente',amount:1300,source:'Paciente (simulación)',paymentRef:'',notes:''}],
  audit:[{id:'EV-001',at:stamp(),by:'Sistema de demostración',event:'Sistema inicializado',detail:'Datos enteramente ficticios'}],
  settings:{reminders:true,checkInRequired:true}
});
const WEEK_DAYS=[['0','Domingo'],['1','Lunes'],['2','Martes'],['3','Miércoles'],['4','Jueves'],['5','Viernes'],['6','Sábado']];
function defaultAvailability(){return {consultationMinutes:30,bufferMinutes:0,weekly:{
  '0':[],
  '1':[{start:'08:00',end:'12:00'},{start:'13:00',end:'17:00'}],
  '2':[{start:'08:00',end:'12:00'},{start:'13:00',end:'17:00'}],
  '3':[{start:'08:00',end:'12:00'},{start:'13:00',end:'17:00'}],
  '4':[{start:'08:00',end:'12:00'},{start:'13:00',end:'17:00'}],
  '5':[{start:'08:00',end:'12:00'},{start:'13:00',end:'17:00'}],
  '6':[{start:'08:00',end:'12:00'}]
},exceptions:[]};}
function normalizeDatabase(data){
 const base=seed();
 data.specialties=Array.isArray(data.specialties)?data.specialties:base.specialties;
 if(!Array.isArray(data.doctors))data.doctors=base.doctors;
 for(const doctor of data.doctors){
  const legacyName=String(doctor.specialty||'').trim();
  let specialty=data.specialties.find(x=>x.id===doctor.specialtyId);
  if(!specialty&&legacyName){
   specialty=data.specialties.find(x=>x.name.toLocaleLowerCase('es')===legacyName.toLocaleLowerCase('es'));
   if(!specialty){specialty={id:id('SP'),name:legacyName,description:'Especialidad migrada desde el directorio anterior.',active:true};data.specialties.push(specialty);}
   doctor.specialtyId=specialty.id;
  }
  if(!doctor.specialtyId&&data.specialties[0])doctor.specialtyId=data.specialties[0].id;
  doctor.email=doctor.email||'';doctor.phone=doctor.phone||'';doctor.consultationRoom=doctor.consultationRoom||'';
  doctor.availability=doctor.availability||defaultAvailability();
  doctor.availability.weekly=doctor.availability.weekly||defaultAvailability().weekly;
  doctor.availability.exceptions=Array.isArray(doctor.availability.exceptions)?doctor.availability.exceptions:[];
  doctor.availability.consultationMinutes=Number(doctor.availability.consultationMinutes)||30;
  doctor.availability.bufferMinutes=Number(doctor.availability.bufferMinutes)||0;
 }
 for(const appointment of (data.appointments||[])){
  const doctor=data.doctors.find(x=>x.id===appointment.doctorId);
  if(!appointment.specialtyId&&doctor)appointment.specialtyId=doctor.specialtyId;
  if(!appointment.specialty&&doctor)appointment.specialty=data.specialties.find(x=>x.id===doctor.specialtyId)?.name||'Especialidad no disponible';
 }
 data.version=2;
 return data;
}
function load(){try{const x=JSON.parse(localStorage.getItem(STORE));if([1,2].includes(x?.version)&&Array.isArray(x.appointments)){const normalized=normalizeDatabase(x);localStorage.setItem(STORE,JSON.stringify(normalized));return normalized;}}catch{}return seed();}
let db=load();
let role=sessionStorage.getItem(SESSION)||'';
if(!roles[role]) role='';
let page='dashboard', query='', hospitalFilter='', modal=null, toasts=[], activeDoctor='D01';
const nav = {
 admin:[['dashboard','Panel general','▦'],['hospitals','Hospitales','▤'],['doctors','Profesionales','✚'],['specialties','Especialidades','✚'],['team','Personal y accesos','♙'],['patients','Pacientes','♧'],['appointments','Agenda general','▦'],['insurers','Aseguradoras','◇'],['finance','Facturación','＄'],['reports','Informes','▥'],['audit','Auditoría','◷'],['security','Seguridad','⚙']],
 recepcion:[['dashboard','Mi jornada','▦'],['appointments','Citas y reservas','▦'],['checkin','Llegadas y turnos','✓'],['patients','Pacientes','♧'],['coverage','Cobertura','◇'],['cash','Cobros y caja','＄'],['followup','Seguimiento','↗'],['notifications','Notificaciones','◉']],
 medico:[['dashboard','Mi jornada médica','▦'],['appointments','Mi agenda','▦'],['availability','Mi disponibilidad','◷'],['patients','Mis pacientes','♧'],['notifications','Notificaciones','◉'],['consultation','Consultorio clínico v8','✚'],['profile','Mi perfil','♙']]
};
const hospitalName = id => db.hospitals.find(x=>x.id===id)?.name || 'Hospital no disponible';
const doctorName = id => db.doctors.find(x=>x.id===id)?.name || 'Profesional no disponible';
const specialtyName = (specialtyId,list=db.specialties) => list.find(x=>x.id===specialtyId)?.name || 'Especialidad no disponible';
const doctorSpecialty = doctor => specialtyName(doctor?.specialtyId);
const appointmentSpecialty = appointment => appointment?.specialtyId ? specialtyName(appointment.specialtyId) : (appointment?.specialty||'—');
const currentDoctor = () => db.doctors.find(x=>x.id===activeDoctor&&x.active) || db.doctors.find(x=>x.active) || null;
const patientName = id => db.patients.find(x=>x.id===id)?.name || 'Paciente no disponible';
const found = id => db.appointments.find(x=>x.id===id);
const money = n => new Intl.NumberFormat('es-DO',{style:'currency',currency:'DOP',maximumFractionDigits:0}).format(Number(n)||0);
const count = status => db.appointments.filter(a=>a.status===status).length;
const statusClass = v => /cancel|ausen|bloquea/i.test(v)?'danger':/pend|solicit|validaci/i.test(v)?'warn':/consulta|incomplet/i.test(v)?'info':'';
const badge = text => `<span class="pill ${statusClass(String(text))}">${esc(text)}</span>`;
const button = (label,act,id='',cls='secondary',extra='') => `<button class="button ${cls} tiny" data-action="${attr(act)}" data-id="${attr(id)}" ${extra}>${esc(label)}</button>`;
function change(mutator,event,detail){
  mutator(db);
  db.audit.unshift({id:id('EV'),at:stamp(),by:roles[role]||'Demo',event,detail});
  db.audit=db.audit.slice(0,160);
  try{localStorage.setItem(STORE,JSON.stringify(db));}catch(e){toast('Sin espacio para guardar los datos locales',true);}
  render();
}
function toast(text,error=false){let el=document.querySelector('.toast');el?.remove();el=document.createElement('div');el.className='toast'+(error?' error':'');el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),3700);}
function chooseRole(r){if(!roles[r])return;role=r;if(r==='medico'&&!db.doctors.some(d=>d.id===activeDoctor&&d.active))activeDoctor=db.doctors.find(d=>d.active)?.id||'';sessionStorage.setItem(SESSION,r);page='dashboard';query='';hospitalFilter='';modal=null;render();}
function setPage(p){page=p;query='';hospitalFilter='';modal=null;render();window.scrollTo({top:0,behavior:'instant'});}
function roleItems(){return nav[role]||[];}
const table = (cols,rows,empty='Sin registros que mostrar') => `<div class="tableWrap"><table class="table"><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):`<tr><td colspan="${cols.length}" class="empty"><strong>Sin resultados</strong>${esc(empty)}</td></tr>`}</tbody></table></div>`;
const panel = (title,description,content,action='')=>`<section class="panel"><div class="panelHead"><div><h3>${title}</h3>${description?`<p>${description}</p>`:''}</div>${action}</div>${content}</section>`;
const section = (title,description='',action='')=>`<div class="sectionLine"><div><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div>${action}</div>`;
const stat=(label,value,hint,mark)=>`<article class="stat"><span class="mark">${mark}</span><div class="label">${label}</div><div class="num">${value}</div><div class="hint">${hint}</div></article>`;
const navTo=(p,text,cls='secondary')=>button(text,'page',p,cls);
const welcome=(title,desc,ctatext='',cta='')=>`<section class="welcome"><div><div class="overline">VITALIA · RED DE SALUD</div><h2>${esc(title)}</h2><p>${esc(desc)}</p></div>${ctatext?`<div>${button(ctatext,cta==='new-appt'?'new-appt':'page',cta,'gold')}</div>`:''}</section>`;
function scopedAppointments(){if(role==='medico')return db.appointments.filter(a=>a.doctorId===(currentDoctor()?.id||''));return db.appointments;}
function matching(arr,fn){const q=query.trim().toLocaleLowerCase('es');return arr.filter(x=>(!q||fn(x).toLocaleLowerCase('es').includes(q))&&(!hospitalFilter||x.hospitalId===hospitalFilter));}
const searchBar=(placeholder,filterHospital=false)=>`<div class="filters"><input class="input search" id="query" placeholder="${attr(placeholder)}" value="${attr(query)}" aria-label="Buscar"/>${filterHospital?`<select class="select" id="hospital-filter" aria-label="Filtrar centro"><option value="">Todos los centros</option>${db.hospitals.map(h=>`<option value="${attr(h.id)}" ${hospitalFilter===h.id?'selected':''}>${esc(h.city)}</option>`).join('')}</select>`:''}<button class="button secondary" data-action="filter">Filtrar</button>${query||hospitalFilter?button('Limpiar','reset-filter'):''}</div>`;
function appointmentRows(list,view='standard'){
 return list.map(a=>`<tr><td><span class="tdMain">${esc(a.id)}</span><span class="tdSub">${dateLabel(a.date)} · ${esc(a.time)}</span></td><td><span class="tdMain">${esc(patientName(a.patientId))}</span><span class="tdSub">${esc(db.patients.find(p=>p.id===a.patientId)?.document)}</span></td><td>${esc(doctorName(a.doctorId))}<span class="tdSub">${esc(appointmentSpecialty(a))}</span></td><td>${esc(hospitalName(a.hospitalId))}</td><td>${badge(a.status)}</td><td>${badge(a.payment)}</td><td><div class="actions">${button('Detalle','appt-detail',a.id)}${(role==='recepcion'||role==='admin')&&['Solicitada','Confirmada'].includes(a.status)?button('Llegada','checkin',a.id,'gold'):''}${role==='medico'&&a.status==='Llegó'?button('Iniciar','consult-start',a.id,'gold'):''}</div></td></tr>`);
}
function appointmentsTable(list){return table(['Referencia / horario','Paciente','Especialista','Centro','Estado','Pago','Acciones'],appointmentRows(list),'Cambia los filtros o crea una cita de demostración.');}
function snapshot(){const own=scopedAppointments();const todayApps=own.filter(a=>a.date===today());const active=own.filter(a=>!['Cancelada','Atendida','Ausente'].includes(a.status));const cash=own.filter(a=>a.payment==='Pagado').reduce((s,a)=>s+Number(a.amount),0);return {own,todayApps,active,cash};}
function dashboard(){const {own,todayApps,active,cash}=snapshot();const isDoc=role==='medico';const isRec=role==='recepcion';const intro=isDoc?'Seguimiento de tu jornada, llegadas verificadas y pacientes asignados.':isRec?'Coordina la llegada de pacientes, las citas y los cobros de caja.':'Supervisa centros, profesionales, reservas y eventos operativos.';
 const headline=isDoc?`Buen día, ${currentDoctor()?.name||'profesional médico'}.`:isRec?'Bienvenida a recepción.':'Una operación hospitalaria conectada.';
 const cards = `<div class="grid4">${stat('Citas de hoy',todayApps.length,'Según fecha local','▦')}${stat('Reservas activas',active.length,'Pendientes o en atención','◎')}${stat('Llegadas verificadas',own.filter(a=>a.status==='Llegó').length,'Pacientes en sala','✓')}${stat(isDoc?'Atenciones finalizadas':'Pagos registrados',isDoc?own.filter(a=>a.status==='Atendida').length:money(cash),isDoc?'Cierre de atención simulado':'Sin procesar dinero real',isDoc?'✚':'＄')}</div>`;
 const rows=own.slice().sort((a,b)=>(a.date+' '+a.time).localeCompare(b.date+' '+b.time)).slice(0,6);
 const daily=panel('Próximas citas','Actividad ficticia que cambia al operar desde cada rol.',appointmentsTable(rows),navTo('appointments','Ver agenda →'));
 const quick=panel('Acciones rápidas','Accesos a los procesos principales.',`<div class="pad"><div class="quick">${(isDoc?[
 ['▦','Abrir mi agenda','appointments'],['◷','Configurar disponibilidad','availability'],['✚','Consultorio v8','consultation'],['♧','Mis pacientes','patients']]:isRec?[
 ['＋','Crear cita','new-appt'],['✓','Registrar llegada','checkin'],['＄','Cobrar consulta','cash']]:[
 ['▤','Administrar centros','hospitals'],['♙','Gestionar personal','team'],['▥','Revisar informes','reports']]).map(x=>`<button data-action="${x[2]==='new-appt'?'new-appt':'page'}" data-id="${x[2]}"><b>${x[0]}</b>${x[1]}</button>`).join('')}</div></div>`);
 const events=panel('Eventos recientes','Trazabilidad local entre roles.',`<div class="list">${db.audit.slice(0,5).map(e=>`<div class="listRow"><div class="split"><div class="circle">◷</div><div><strong>${esc(e.event)}</strong><div class="desc">${esc(e.detail)}</div></div></div><span class="tdSub noWrap">${dt(e.at)}</span></div>`).join('')}</div>`);
 return welcome(headline,intro,isRec?'Buscar pacientes':'Abrir agenda','appointments')+cards+section('Centro de trabajo')+`<div class="twoCol">${daily}<div style="display:grid;gap:16px">${quick}${events}</div></div>`;
}
function appointmentPage(){const list=matching(scopedAppointments(),a=>[a.id,patientName(a.patientId),doctorName(a.doctorId),appointmentSpecialty(a),a.date,a.status].join(' ')).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 return welcome(role==='medico'?'Agenda del profesional':'Gestión de citas y reservas','Confirma llegadas, consulta disponibilidad y administra solicitudes ficticias.',role!=='medico'?'Nueva cita':'','new-appt')+(role==='medico'?`<div class="alert green">Tu jornada se rige por la disponibilidad que configures en <b>Mi disponibilidad</b>. Las citas nuevas solo pueden reservarse dentro de tus horarios habilitados.</div>`:'')+section('Agenda de citas',`${list.length} registro(s) disponible(s)`,role!=='medico'?button('＋ Nueva cita','new-appt','','gold'):'')+searchBar('Buscar por código, paciente, médico o estado',role!=='medico')+panel('Agenda y estados','Las citas compartidas actualizan indicadores de los demás portales.',appointmentsTable(list));
}
function checkinPage(){const list=matching(db.appointments.filter(a=>!['Cancelada','Atendida'].includes(a.status)),a=>[a.id,patientName(a.patientId),db.patients.find(p=>p.id===a.patientId)?.document,a.date].join(' '));return welcome('Recepción y control de llegadas','Busca por código de cita o documento ficticio. El estado de llegada estará disponible para Médico.')+section('Llegadas pendientes',`${list.length} registro(s)`)+searchBar('Ej. APT-1002 o DEMO-002',true)+panel('Verificación de identidad','Comprueba verbalmente los datos ficticios antes de marcar llegada.',table(['Código','Paciente','Documento','Hora','Estado','Acción'],list.map(a=>`<tr><td class="tdMain">${esc(a.id)}</td><td>${esc(patientName(a.patientId))}</td><td>${esc(db.patients.find(p=>p.id===a.patientId)?.document)}</td><td>${dateLabel(a.date)} · ${esc(a.time)}</td><td>${badge(a.status)}</td><td>${a.status==='Llegó'?button('Ver detalle','appt-detail',a.id):button('Confirmar llegada','checkin',a.id,'gold')}</td></tr>`)));
}
function hospitalsPage(){const list=matching(db.hospitals,h=>h.name+' '+h.city);return welcome('Centros médicos','Crea y actualiza sedes; la agenda se relaciona por identificador de hospital.')+section('Hospitales registrados',`${list.length} sede(s)`,button('＋ Nuevo hospital','new-hospital','','gold'))+searchBar('Buscar centro o ciudad')+panel('Red de hospitales','Los cambios se guardan en el entorno de demostración.',table(['Centro','Ciudad','Teléfono','Servicios','Estado','Acciones'],list.map(h=>`<tr><td class="tdMain">${esc(h.name)}</td><td>${esc(h.city)}</td><td>${esc(h.phone)}</td><td>${db.doctors.filter(d=>d.hospitalId===h.id).length} profesionales</td><td>${badge(h.active?'Activo':'Inactivo')}</td><td>${button('Editar','edit-hospital',h.id)} ${button(h.active?'Desactivar':'Activar','toggle-hospital',h.id)}</td></tr>`)));
}
function doctorsPage(){const list=matching(db.doctors,d=>[d.name,doctorSpecialty(d),d.license].join(' '));return welcome('Directorio de profesionales','Registra médicos, vincula una especialidad del catálogo y asigna su centro de atención.')+section('Profesionales',`${list.length} registrado(s)`,button('＋ Añadir profesional','new-doctor','','gold'))+searchBar('Buscar nombre, especialidad o licencia',true)+panel('Equipo médico','La especialidad se selecciona desde un catálogo administrado por separado.',table(['Profesional','Especialidad','Hospital','Identificador demo','Estado','Acciones'],list.map(d=>`<tr><td class="tdMain">${esc(d.name)}</td><td>${esc(doctorSpecialty(d))}</td><td>${esc(hospitalName(d.hospitalId))}</td><td>${esc(d.license)}</td><td>${badge(d.active?'Activo':'Inactivo')}</td><td>${button('Editar','edit-doctor',d.id)} ${button(d.active?'Desactivar':'Activar','toggle-doctor',d.id)}</td></tr>`)));
}
function specialtiesPage(){const list=matching(db.specialties,x=>[x.name,x.description].join(' '));return welcome('Catálogo de especialidades médicas','Administra las especialidades disponibles para asignarlas a los profesionales.')+section('Especialidades',`${list.length} registrada(s)`,button('＋ Nueva especialidad','new-specialty','','gold'))+searchBar('Buscar especialidad')+panel('Catálogo institucional','No se permite desactivar una especialidad que todavía esté asignada a médicos.',table(['Especialidad','Descripción','Profesionales asignados','Estado','Acciones'],list.map(x=>{const linked=db.doctors.filter(d=>d.specialtyId===x.id).length;return `<tr><td class="tdMain">${esc(x.name)}</td><td>${esc(x.description||'—')}</td><td>${linked}</td><td>${badge(x.active?'Activa':'Inactiva')}</td><td>${button('Editar','edit-specialty',x.id)} ${button(x.active?'Desactivar':'Activar','toggle-specialty',x.id,x.active?'danger':'secondary')}</td></tr>`;})));
}
function teamPage(){const list=matching(db.staff,s=>s.name+' '+s.role);return welcome('Personal y accesos','Gestiona perfiles institucionales de demostración. Los cambios no crean credenciales reales.')+section('Usuarios institucionales','Permisos ilustrativos por rol',button('＋ Nuevo personal','new-staff','','gold'))+searchBar('Buscar personal o perfil',true)+panel('Directorio', 'Las autorizaciones definitivas se implementarán en la API, no en el navegador.',table(['Nombre','Rol','Centro','Estado','Acciones'],list.map(s=>`<tr><td class="tdMain">${esc(s.name)}</td><td>${esc(s.role)}</td><td>${esc(hospitalName(s.hospitalId))}</td><td>${badge(s.active?'Activo':'Inactivo')}</td><td>${button('Editar','edit-staff',s.id)} ${button(s.active?'Desactivar':'Activar','toggle-staff',s.id)}</td></tr>`)));
}
function availabilityPage(){
 if(role!=='medico')return welcome('Disponibilidad médica','Esta sección es exclusiva del profesional que administra su propia jornada.');
 const doctor=currentDoctor();if(!doctor)return welcome('Disponibilidad médica','No hay un perfil médico activo.');
 const av=doctor.availability||defaultAvailability();
 const dayRows=WEEK_DAYS.map(([day,label])=>{const ranges=av.weekly?.[day]||[];const first=ranges[0]||{},second=ranges[1]||{};return `<div class="availabilityDay"><label class="availabilityDayName"><input type="checkbox" name="day_${day}_active" value="1" ${ranges.length?'checked':''}/> <span>${label}</span></label><div class="availabilityRange"><label>Primer turno</label><div class="timePair"><input class="input" type="time" name="day_${day}_start_1" value="${attr(first.start||'')}" aria-label="${label}, primer turno, desde"/><span>a</span><input class="input" type="time" name="day_${day}_end_1" value="${attr(first.end||'')}" aria-label="${label}, primer turno, hasta"/></div></div><div class="availabilityRange"><label>Segundo turno (opcional)</label><div class="timePair"><input class="input" type="time" name="day_${day}_start_2" value="${attr(second.start||'')}" aria-label="${label}, segundo turno, desde"/><span>a</span><input class="input" type="time" name="day_${day}_end_2" value="${attr(second.end||'')}" aria-label="${label}, segundo turno, hasta"/></div></div></div>`;}).join('');
 const exceptions=(av.exceptions||[]).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const summary=WEEK_DAYS.map(([day,label])=>{const ranges=av.weekly?.[day]||[];return `<div class="scheduleSummaryRow"><b>${label}</b><span>${ranges.length?ranges.map(x=>`${x.start}–${x.end}`).join(' · '):'No disponible'}</span></div>`;}).join('');
 return welcome('Mi disponibilidad','Define los días y turnos en los que puedes recibir pacientes. Esta configuración se utiliza para validar las nuevas reservas.')+
 `<div class="alert green"><b>Perfil activo: ${esc(doctor.name)}</b> · ${esc(doctorSpecialty(doctor))} · ${esc(hospitalName(doctor.hospitalId))}. Solo tú puedes modificar este horario desde el perfil Médico.</div>`+
 `<form id="availability-form" class="panel availabilityForm"><div class="panelHead"><div><h3>Jornada semanal</h3><p>Activa cada día y define uno o dos turnos. Deja el día desmarcado para indicar que no atiendes.</p></div></div><div class="pad"><div class="availabilityDays">${dayRows}</div><div class="formGrid availabilitySettings">${select('consultationMinutes','Duración de cada consulta',[['15','15 minutos'],['20','20 minutos'],['30','30 minutos'],['45','45 minutos'],['60','60 minutos']],String(av.consultationMinutes||30))}${select('bufferMinutes','Tiempo entre consultas',[['0','Sin intervalo'],['5','5 minutos'],['10','10 minutos'],['15','15 minutos'],['20','20 minutos']],String(av.bufferMinutes||0))}</div><div class="formActions"><button type="submit" class="button gold">Guardar disponibilidad</button></div></div></form>`+
 `<div class="twoCol" style="margin-top:17px"><div>${panel('Excepciones y ausencias','Bloquea vacaciones, permisos o períodos en los que no recibirás pacientes.',`<div class="pad">${exceptions.length?table(['Fecha','Período','Motivo','Acción'],exceptions.map(x=>`<tr><td>${dateLabel(x.date)}</td><td>${x.scope==='day'?'Día completo':`${esc(x.start)}–${esc(x.end)}`}</td><td>${esc(x.reason||'No especificado')}</td><td>${button('Quitar','remove-exception',x.id,'danger')}</td></tr>`)):'<div class="empty">No hay excepciones registradas.</div>'}</div>`,button('＋ Añadir bloqueo','new-exception','','gold'))}</div><div>${panel('Vista semanal','Resumen de la jornada actualmente guardada.',`<div class="pad scheduleSummary">${summary}<hr style="border:0;border-top:1px solid var(--line);margin:13px 0"><div class="scheduleSummaryRow"><b>Duración</b><span>${av.consultationMinutes||30} min</span></div><div class="scheduleSummaryRow"><b>Intervalo</b><span>${av.bufferMinutes||0} min</span></div></div>`)}${panel('Reglas de agenda','La aplicación comprueba la jornada, los bloqueos y las citas existentes antes de guardar una reserva.',`<div class="pad note">Los cambios no cancelan ni reprograman automáticamente citas confirmadas. Primero debes mantenerlas dentro de tu horario.</div>`)}</div></div>`;
}
function patientsPage(){const patientIds=role==='medico'?new Set(scopedAppointments().map(a=>a.patientId)):null;const list=db.patients.filter(p=>(!patientIds||patientIds.has(p.id))&&(!query||[p.name,p.document,p.phone,p.ars].join(' ').toLowerCase().includes(query.toLowerCase())));return welcome(role==='medico'?'Pacientes asignados':'Registro administrativo de pacientes',role==='medico'?'Solo se muestran pacientes con citas asignadas a tu perfil médico. Datos completamente ficticios.':'Datos completamente ficticios. Recepción solo administra identificación, contacto y cobertura, nunca notas clínicas.')+section('Directorio de pacientes',`${list.length} expediente(s) administrativo(s)`,role==='medico'?'':button('＋ Registrar paciente','new-patient','','gold'))+searchBar('Buscar por nombre, documento o seguro')+panel('Identificación y cobertura','La historia clínica detallada se conserva exclusivamente en el consultorio v8.',table(['Paciente','Identificador','Teléfono','ARS','Citas','Acción'],list.map(p=>`<tr><td class="tdMain">${esc(p.name)}</td><td>${esc(p.document)}</td><td>${esc(p.phone)}</td><td>${esc(p.ars)}</td><td>${db.appointments.filter(a=>a.patientId===p.id).length}</td><td>${role==='medico'?button('Ver citas','patient-appts',p.id):button('Editar contacto','edit-patient',p.id)}</td></tr>`)));
}
function insurersPage(){return welcome('Convenios y aseguradoras','Catálogo de aseguradoras ficticias, porcentajes simulados y estados de convenio.')+section('Directorio de convenios',`${db.insurers.length} aseguradora(s)`,button('＋ Nueva aseguradora','new-insurer','','gold'))+panel('Cobertura de demostración','Estos porcentajes no equivalen a cobertura o autorización real.',table(['Aseguradora','Estado','Cobertura simulada','Acciones'],db.insurers.map(a=>`<tr><td class="tdMain">${esc(a.name)}</td><td>${badge(a.status)}</td><td>${esc(a.coverage)}%</td><td>${button('Editar','edit-insurer',a.id)}</td></tr>`)));
}
function coveragePage(){const list=db.patients.filter(p=>!query||p.name.toLowerCase().includes(query.toLowerCase()));return welcome('Validación administrativa de cobertura','Una simulación para verificar aseguradora o registrar pacientes sin seguro. No se realiza ninguna consulta a ARS real.')+section('Pacientes y afiliaciones')+searchBar('Buscar paciente')+panel('Estado de cobertura','Para procesar prestaciones reales faltará un servicio de consulta autorizado.',table(['Paciente','Aseguradora declarada','Estado demo','Acción'],list.map(p=>`<tr><td class="tdMain">${esc(p.name)}</td><td>${esc(p.ars)}</td><td>${badge(p.ars==='Sin seguro'?'No asegurado':'Pendiente de validación')}</td><td>${button('Actualizar','edit-patient',p.id)}</td></tr>`)));
}
function financePage(){const paid=db.appointments.filter(a=>a.payment==='Pagado');const total=paid.reduce((a,b)=>a+Number(b.amount),0);return welcome(role==='recepcion'?'Caja de recepción':'Facturación y supervisión financiera','Los cobros son simulados: no se capturan tarjetas ni se procesan fondos.')+`<div class="grid4">${stat('Cobros registrados',paid.length,'En esta demostración','✓')}${stat('Monto simulado',money(total),'Pesos dominicanos','＄')}${stat('Por cobrar',db.appointments.filter(a=>a.payment==='Pendiente'&&a.status!=='Cancelada').length,'Citas activas','◷')}${stat('Reversiones',db.audit.filter(e=>e.event==='Reversión de pago').length,'Registradas en bitácora','↶')}</div>`+section('Movimientos de caja', 'Solo recibos de demostración')+panel('Cobros de consultas','El recibo es ficticio y no tiene valor fiscal.',table(['Código','Paciente','Monto','Estado','Referencia','Acciones'],db.appointments.filter(a=>a.status!=='Cancelada').map(a=>`<tr><td class="tdMain">${esc(a.id)}</td><td>${esc(patientName(a.patientId))}</td><td class="amount">${money(a.amount)}</td><td>${badge(a.payment)}</td><td>${esc(a.paymentRef||'—')}</td><td><div class="actions">${a.payment==='Pendiente'?button('Registrar cobro','charge',a.id,'gold'):button('Comprobante','receipt',a.id)}${role==='admin'&&a.payment==='Pagado'?button('Revertir','reverse-pay',a.id,'danger'):''}</div></td></tr>`)));
}
function followupPage(){return welcome('Seguimiento operativo','Administra controles y salidas sin editar ni visualizar notas médicas privadas.')+section('Atenciones en curso')+panel('Seguimiento de pacientes','Solo estados administrativos disponibles.',table(['Cita','Paciente','Estado','Acciones'],db.appointments.filter(a=>['Llegó','En consulta','Atendida'].includes(a.status)).map(a=>`<tr><td class="tdMain">${esc(a.id)}</td><td>${esc(patientName(a.patientId))}</td><td>${badge(a.status)}</td><td>${button('Ver detalle','appt-detail',a.id)} ${a.status==='Atendida'?button('Salida registrada','discharge',a.id):''}</td></tr>`)));
}
function notificationsPage(){return welcome('Notificaciones internas','Eventos operativos ilustrativos; no se envían SMS, correos ni notificaciones push.')+section('Centro de avisos', '',role==='recepcion'?button('Crear recordatorio demo','reminder','','gold'):'')+panel('Bitácora de eventos','Acciones simuladas entre roles.',`<div class="list">${db.audit.slice(0,25).map(e=>`<div class="listRow"><div class="split"><div class="circle">◉</div><div><strong>${esc(e.event)}</strong><div class="desc">${esc(e.detail)} · ${esc(e.by)}</div></div></div><span class="tdSub noWrap">${dt(e.at)}</span></div>`).join('')}</div>`);
}
function reportsPage(){const counts=['Solicitada','Confirmada','Llegó','En consulta','Atendida','Cancelada','Ausente'].map(s=>({s,n:count(s)}));const max=Math.max(1,...counts.map(x=>x.n));const chart=`<div class="chartBars">${counts.map(x=>`<div class="barItem"><div class="bar" title="${esc(x.s)}: ${x.n}" style="height:${Math.round(120*x.n/max)+5}px"></div><div class="barLabel">${esc(x.s)}</div></div>`).join('')}</div>`;return welcome('Informes institucionales','Productividad, ausencias, estados de citas y exportación operativa.')+section('Resumen del sistema','Se actualiza con cada operación')+`<div class="grid4">${stat('Sedes',db.hospitals.length,'Registradas','▤')}${stat('Profesionales',db.doctors.length,'Directorio','✚')}${stat('Citas',db.appointments.length,'Histórico demo','▦')}${stat('Atenciones cerradas',count('Atendida'),'Estado administrativo','✓')}</div>`+panel('Distribución de estados','Representación de los datos actuales.',chart,button('Descargar CSV','export-csv','','gold'))+`<div style="margin-top:16px">${panel('Indicadores de centros','Agregados por sede.',table(['Centro','Reservas','Llegadas','Atendidas','Pagos simulados'],db.hospitals.map(h=>{const a=db.appointments.filter(x=>x.hospitalId===h.id);return `<tr><td class="tdMain">${esc(h.name)}</td><td>${a.length}</td><td>${a.filter(x=>x.status==='Llegó').length}</td><td>${a.filter(x=>x.status==='Atendida').length}</td><td>${money(a.filter(x=>x.payment==='Pagado').reduce((n,x)=>n+Number(x.amount),0))}</td></tr>`;})))}</div>`;
}
function auditPage(){return welcome('Auditoría y trazabilidad','Quién hizo qué y cuándo, dentro de este navegador de demostración.')+section('Bitácora institucional',`${db.audit.length} evento(s)`,button('Exportar CSV','export-audit','','gold'))+panel('Registro de actividad','El servidor definitivo gestionará una auditoría protegida e inalterable.',table(['Hora','Actor','Evento','Detalle'],db.audit.slice(0,100).map(e=>`<tr><td class="noWrap">${dt(e.at)}</td><td>${esc(e.by)}</td><td class="tdMain">${esc(e.event)}</td><td>${esc(e.detail)}</td></tr>`)));
}
function securityPage(){return welcome('Gobierno y seguridad','Modelo propuesto: MFA, permisos por rol y sede, auditoría y acceso clínico restringido.')+`<div class="alert red">IMPORTANTE: el selector de roles de esta demostración NO autentica. Nunca introduzcas credenciales, documentación ni información clínica real.</div>`+section('Matriz inicial de permisos')+panel('Responsabilidades del sistema',table(['Módulo','Administración','Recepción','Médico'],[
 ['Sedes y personal','Gestionar','Consultar propias sedes','Consultar asignación'],['Agenda','Supervisar y reasignar','Crear, confirmar llegada y cancelar','Consultar propias citas'],['Cobros','Supervisar y autorizar reversión','Registrar cobro ficticio','Solo estado'],['Expediente clínico','No editar','Sin acceso','Consulta autorizada'],['Auditoría','Consultar','Sin acceso global','Acceso propio']
 ].map(x=>`<tr>${x.map(y=>`<td>${esc(y)}</td>`).join('')}</tr>`)))+`<div style="margin-top:15px">${panel('Operaciones de prueba','Usa estos controles solo con datos ficticios.',`<div class="pad"><p class="note">Reiniciar restaura todos los datos de ejemplo del portal institucional en este navegador. No afecta la aplicación Android ni el consultorio v8.</p><div class="actions">${button('Restablecer datos demo','reset','','danger')} ${button('Descargar copia JSON','export-json','','secondary')}</div></div>`)}</div>`;
}
function consultationPage(){return welcome('Consultorio médico aprobado v8','El prototipo interactivo original conserva sus formularios clínicos, historial, notas SOAP, diagnósticos, órdenes, recetas y controles de firma, sin cambios en los archivos fuente.')+`<div class="alert">La agenda operativa de este portal y el consultorio v8 son dos simulaciones locales separadas. Los datos clínicos del prototipo no se sincronizan todavía con la nueva agenda.</div>`+`<section class="panel"><div class="pad"><h2 style="margin-top:0">Abrir consultorio médico interactivo</h2><p class="note">Se abrirá el diseño v8 aprobado en otra pestaña, tal como fue entregado. No usa datos médicos reales.</p><a class="button gold" href="../medico-v8/medico.html" target="_blank" rel="noopener noreferrer">Abrir consultorio v8 ↗</a></div></section>`;
}
function profilePage(){const d=currentDoctor();if(!d)return welcome('Perfil del profesional','No hay un médico activo.');return welcome('Perfil del profesional','Consulta tu identificación, especialidad y centro de atención.')+panel('Mi información','Datos institucionales registrados por Administración.',`<div class="pad"><div class="grid2">${[['Profesional',d.name],['Especialidad',doctorSpecialty(d)],['Hospital',hospitalName(d.hospitalId)],['Registro / exequátur',d.license],['Correo institucional',d.email||'No registrado'],['Teléfono',d.phone||'No registrado'],['Consultorio',d.consultationRoom||'No asignado']].map(x=>`<div><div class="mini">${esc(x[0])}</div><div style="margin-top:7px;font-weight:700">${esc(x[1])}</div></div>`).join('')}</div><div class="actions" style="margin-top:22px">${button('Configurar disponibilidad','page','availability','gold')}${button('Ir al consultorio','page','consultation','secondary')}</div></div>`);
}
function renderPage(){if(page==='specialties'&&role!=='admin')page='dashboard';if(page==='availability'&&role!=='medico')page='dashboard';switch(page){case'dashboard':return dashboard();case'hospitals':return hospitalsPage();case'doctors':return doctorsPage();case'specialties':return specialtiesPage();case'team':return teamPage();case'patients':return patientsPage();case'appointments':return appointmentPage();case'availability':return availabilityPage();case'checkin':return checkinPage();case'insurers':return insurersPage();case'coverage':return coveragePage();case'cash':case'finance':return financePage();case'followup':return followupPage();case'notifications':return notificationsPage();case'reports':return reportsPage();case'audit':return auditPage();case'security':return securityPage();case'consultation':return consultationPage();case'profile':return profilePage();default:return dashboard();}}
function access(){return `<main class="access"><div class="accessInner"><div class="accessLogo"><span>✚</span> VITALIA</div><div class="accessSub">PORTALES INSTITUCIONALES · DEMOSTRACIÓN ACADÉMICA</div><h1 class="accessTitle">Una sola plataforma.<br/>Una atención que conecta a todos.</h1><p class="accessDesc">Selecciona un perfil de demostración para explorar sus procesos. Los cambios entre Administración, Recepción y Médico se compartirán en este mismo navegador.</p><div class="roleCards">${[
 ['admin','▦','Administración','Hospitales, profesionales, operación, facturación y auditoría.'],
 ['recepcion','♙','Recepcionista','Citas, llegadas, cobertura, pagos y seguimiento.'],
 ['medico','✚','Médico','Agenda, pacientes autorizados y consultorio clínico v8 original.']
 ].map(r=>`<button class="roleCard" data-action="choose" data-id="${r[0]}"><span>${r[1]}</span><strong>${r[2]}</strong><small>${r[3]}</small></button>`).join('')}</div><div class="accessFoot">Solo datos ficticios · Acceso visual sin credenciales · No usar en entornos hospitalarios reales</div></div></main>`;}
function shell(){const item=roleItems().find(x=>x[0]===page);return `<div class="shell"><aside class="sidebar"><div><div class="logo"><span class="logoMark">✚</span> VITALIA</div><div class="brandCaption">SISTEMA DE GESTIÓN MÉDICA</div></div><div class="sideRole"><span class="mini">PERFIL ACTIVO · DEMO</span><strong>${esc(roles[role])}</strong></div><div><div class="navTitle">MENÚ PRINCIPAL</div><nav class="nav" aria-label="Secciones">${roleItems().map(x=>`<button class="navBtn ${page===x[0]?'active':''}" data-action="page" data-id="${x[0]}"><span class="navSymbol">${x[2]}</span>${x[1]}</button>`).join('')}</nav></div><div class="sideBottom"><div class="sideSmall">VITALIA v0.3 · Gestión de disponibilidad y especialidades<br/>Datos de demostración local</div><button class="sideLink" data-action="leave">⇄ Cambiar perfil</button></div></aside><main class="main"><header class="topbar"><div><div class="overline">OPERACIÓN HOSPITALARIA · ${esc(roles[role])}</div><h1>${esc(item?.[1]||'VITALIA')}</h1></div><div class="topRight"><span class="pill warn">● DEMOSTRACIÓN</span>${role==='medico'?`<select class="roleSelect" id="doctor-select" aria-label="Médico de demostración activo">${db.doctors.filter(d=>d.active||d.id===activeDoctor).map(d=>`<option value="${attr(d.id)}" ${d.id===activeDoctor?'selected':''}>${esc(d.name)}</option>`).join('')}</select>`:''}<select class="roleSelect" id="role-select" aria-label="Cambiar perfil">${Object.entries(roles).map(([id,name])=>`<option value="${id}" ${role===id?'selected':''}>${esc(name)}</option>`).join('')}</select></div></header><div class="content"><div class="demoStrip"><span>✓ Los datos institucionales se comparten entre roles en este navegador.</span><span>Sin autenticación real ni sincronización con Android</span></div>${renderPage()}</div></main></div>${modal?renderModal():''}`;}
function render(){ROOT.innerHTML=role?shell():access();}

function input(name,label,value='',type='text',required=true,extra=''){
 return `<div class="field"><label for="f_${attr(name)}">${esc(label)}</label><input class="input" id="f_${attr(name)}" name="${attr(name)}" type="${attr(type)}" value="${attr(value)}" ${required?'required':''} ${extra}/></div>`;
}
function select(name,label,options,value='',required=true){return `<div class="field"><label for="f_${attr(name)}">${esc(label)}</label><select class="select" name="${attr(name)}" id="f_${attr(name)}" ${required?'required':''}>${!required?'<option value="">Sin seleccionar</option>':''}${options.map(o=>{const [val,text]=Array.isArray(o)?o:[o,o];return `<option value="${attr(val)}" ${String(value)===String(val)?'selected':''}>${esc(text)}</option>`;}).join('')}</select></div>`;}
function textarea(name,label,value='',required=true){return `<div class="field span2"><label for="f_${attr(name)}">${esc(label)}</label><textarea name="${attr(name)}" id="f_${attr(name)}" class="textarea" rows="3" ${required?'required':''}>${esc(value)}</textarea></div>`;}
const hospitalOpts=()=>db.hospitals.filter(x=>x.active).map(x=>[x.id,x.name]);
const specialtyOpts=(current='')=>db.specialties.filter(x=>x.active||x.id===current).map(x=>[x.id,x.name+(x.active?'':' · Inactiva')]);
const doctorOpts=()=>db.doctors.filter(x=>x.active).map(x=>[x.id,`${x.name} · ${doctorSpecialty(x)} · ${hospitalName(x.hospitalId)}`]);
const patientOpts=()=>db.patients.map(x=>[x.id,`${x.name} · ${x.document}`]);
const insurerOpts=()=>[['Sin seguro','Sin seguro'],...db.insurers.map(x=>[x.name,x.name])];
function modalContent(){
 const t=modal.type, rec=modal.ref;
 if(t==='new-hospital'||t==='edit-hospital'){
  const h=db.hospitals.find(x=>x.id===rec)||{};
  return {title:t==='new-hospital'?'Registrar hospital':'Editar hospital',button:'Guardar hospital',body:input('name','Nombre del centro',h.name)+input('city','Ciudad o provincia',h.city)+input('phone','Teléfono institucional ficticio',h.phone,'tel')};
 }
 if(t==='new-doctor'||t==='edit-doctor'){
  const d=db.doctors.find(x=>x.id===rec)||{};
  return {title:t==='new-doctor'?'Registrar profesional':'Editar profesional',button:'Guardar profesional',body:input('name','Nombre del profesional',d.name)+select('specialtyId','Especialidad médica',specialtyOpts(d.specialtyId),d.specialtyId)+input('license','Número de exequátur / registro profesional',d.license)+select('hospitalId','Centro asignado',hospitalOpts(),d.hospitalId)+input('email','Correo institucional',d.email||'','email',false)+input('phone','Teléfono de contacto',d.phone||'','tel',false)+input('consultationRoom','Consultorio / ubicación',d.consultationRoom||'', 'text',false)};
 }
 if(t==='new-specialty'||t==='edit-specialty'){
  const item=db.specialties.find(x=>x.id===rec)||{};
  return {title:t==='new-specialty'?'Registrar especialidad':'Editar especialidad',button:'Guardar especialidad',body:input('name','Nombre de la especialidad',item.name)+textarea('description','Descripción / alcance',item.description||'',false)};
 }
 if(t==='new-staff'||t==='edit-staff'){
  const s=db.staff.find(x=>x.id===rec)||{};
  return {title:t==='new-staff'?'Registrar personal':'Editar personal',button:'Guardar personal',body:input('name','Nombre de demostración',s.name)+select('role','Perfil institucional',[['Recepcionista','Recepcionista'],['Administrador','Administrador']],s.role)+select('hospitalId','Centro asignado',hospitalOpts(),s.hospitalId)};
 }
 if(t==='new-patient'||t==='edit-patient'){
  const p=db.patients.find(x=>x.id===rec)||{};
  return {title:t==='new-patient'?'Registrar paciente':'Actualizar información administrativa',button:'Guardar información',body:input('name','Nombre ficticio',p.name)+input('document','Identificador demo (NO cédula real)',p.document)+input('phone','Teléfono ficticio',p.phone,'tel')+select('ars','Aseguradora declarada',insurerOpts(),p.ars)};
 }
 if(t==='new-insurer'||t==='edit-insurer'){
  const ins=db.insurers.find(x=>x.id===rec)||{};
  return {title:t==='new-insurer'?'Nueva aseguradora ficticia':'Editar convenio ficticio',button:'Guardar convenio',body:input('name','Nombre de aseguradora ficticia',ins.name)+input('coverage','Porcentaje de cobertura simulado',ins.coverage??80,'number',true,'min="0" max="100"')+select('status','Estado',[['Vigente','Vigente'],['Vencido','Vencido'],['Suspendido','Suspendido']],ins.status)};
 }
 if(t==='new-appt'){
  return {title:'Crear cita de demostración',button:'Registrar cita',body:select('patientId','Paciente',patientOpts())+select('doctorId','Profesional y centro',doctorOpts())+input('date','Fecha',today(),'date',true,`min="${today()}"`)+input('time','Hora','09:00','time')+input('amount','Monto autorizado ficticio (RD$)','1500','number',true,'min="0" max="100000" step="1"')+`<div class="alert span2" style="grid-column:1/-1">La reserva debe coincidir con la jornada semanal del médico, no estar bloqueada y no generar un conflicto con otra cita.</div>`};
 }
 if(t==='reschedule'){
  const a=found(rec)||{};
  return {title:`Reprogramar ${esc(a.id)}`,button:'Guardar nuevo horario',body:input('date','Nueva fecha',a.date,'date',true,`min="${today()}"`)+input('time','Nueva hora',a.time,'time')+textarea('reason','Motivo del cambio (demo)','')};
 }
 if(t==='cancel-appt'){
  return {title:`Cancelar cita ${esc(rec)}`,button:'Confirmar cancelación',body:textarea('reason','Motivo de cancelación','')};
 }
 if(t==='charge'){
  const a=found(rec)||{};
  return {title:`Registrar cobro · ${esc(rec)}`,button:'Registrar pago ficticio',body:`<div class="alert">No introducir datos de tarjetas, cuentas bancarias ni comprobantes reales.</div>`+input('amount','Importe (RD$)',a.amount,'number',true,'min="0" step="1"')+select('method','Método registrado',[['Efectivo ficticio','Efectivo ficticio'],['Tarjeta externa simulada','Tarjeta externa simulada']])+input('reference','Referencia de caja ficticia',id('REC'))};
 }
 if(t==='reverse-pay'){
  return {title:`Autorizar reversión · ${esc(rec)}`,button:'Revertir pago demo',body:textarea('reason','Motivo de reversión','')};
 }
 if(t==='reassign'){
  return {title:`Reasignar cita · ${esc(rec)}`,button:'Actualizar profesional',body:select('doctorId','Nuevo profesional',doctorOpts(),found(rec)?.doctorId)+textarea('reason','Motivo administrativo','')};
 }
 if(t==='reminder'){
  return {title:'Recordatorio de demostración',button:'Registrar aviso interno',body:select('appointmentId','Cita',db.appointments.filter(a=>!['Cancelada','Atendida'].includes(a.status)).map(a=>[a.id,`${a.id} · ${patientName(a.patientId)}`]))+textarea('message','Mensaje ficticio','Recordatorio de su próxima consulta en VITALIA (simulación).')};
 }
 if(t==='new-exception'){
  return {title:'Registrar ausencia o bloqueo',button:'Guardar bloqueo',body:input('date','Fecha a bloquear',today(),'date',true,`min="${today()}"`)+select('scope','Tipo de bloqueo',[['day','Día completo'],['range','Rango de horas']],'day')+input('start','Desde','08:00','time',false)+input('end','Hasta','17:00','time',false)+textarea('reason','Motivo del bloqueo','')+`<div class="alert span2" style="grid-column:1/-1">No se permitirá guardar un bloqueo que coincida con citas ya reservadas.</div>`};
 }
 if(t==='appt-detail'){
  const a=found(rec);
  if(!a)return {title:'Cita no encontrada',button:'',body:'<p>Esta cita ya no está disponible.</p>'};
  const canEdit=role!=='medico'&&!['Cancelada','Atendida'].includes(a.status);
  const clinical=role==='medico';
  let actions=`<div class="actions" style="margin-top:20px">`;
  if(canEdit)actions+=button('Reprogramar','reschedule',a.id)+button('Cancelar','cancel-appt',a.id,'danger');
  if(canEdit&&role==='admin')actions+=button('Reasignar médico','reassign',a.id);
  if(role==='recepcion'&&['Solicitada','Confirmada'].includes(a.status))actions+=button('Confirmar llegada','checkin',a.id,'gold');
  if(clinical&&a.status==='Llegó')actions+=button('Iniciar atención demo','consult-start',a.id,'gold');
  if(clinical&&a.status==='En consulta')actions+=button('Finalizar atención demo','consult-complete',a.id,'gold');
  if(a.payment==='Pendiente'&&role!=='medico'&&a.status!=='Cancelada')actions+=button('Registrar cobro','charge',a.id,'gold');
  if(a.payment==='Pagado')actions+=button('Comprobante','receipt',a.id);
  actions+='</div>';
  return {title:`Detalle de cita · ${esc(a.id)}`,button:'',body:`<div class="grid2">${[
    ['Paciente',patientName(a.patientId)],['Especialidad',appointmentSpecialty(a)],['Profesional',doctorName(a.doctorId)],['Centro',hospitalName(a.hospitalId)],['Fecha',dateLabel(a.date)],['Hora',a.time],['Estado',a.status],['Cobro',a.payment]
   ].map(([lab,val])=>`<div><div class="mini">${esc(lab)}</div><div style="font-weight:700;margin-top:7px">${esc(val)}</div></div>`).join('')}</div>${actions}${clinical?'<p class="note">Las acciones sobre estado no representan una historia clínica firmada. El consultorio v8 conserva su proceso clínico independiente.</p>':''}`};
 }
 if(t==='receipt'){
  const a=found(rec);
  if(!a)return {title:'Comprobante',button:'',body:'Registro no encontrado'};
  return {title:'Comprobante de demostración',button:'',body:`<div class="alert">SIN VALIDEZ FISCAL · NO ES FACTURA NI COMPROBANTE LEGAL</div><div class="grid2">${[
   ['Referencia',a.paymentRef],['Cita',a.id],['Paciente',patientName(a.patientId)],['Centro',hospitalName(a.hospitalId)],['Total simulado',money(a.amount)],['Medio','Registro de caja demo']
  ].map(([l,v])=>`<div><div class="mini">${esc(l)}</div><div style="margin-top:7px;font-weight:700">${esc(v)}</div></div>`).join('')}</div><div style="margin-top:22px"><button class="button secondary" data-action="print">Imprimir / Guardar PDF</button></div>`};
 }
 return {title:'Acción de demostración',button:'',body:'<p>Esta acción no está disponible.</p>'};
}
function renderModal(){const m=modalContent();return `<div class="modalOverlay" data-action="close-outside"><div class="modal" role="dialog" aria-modal="true" aria-label="${attr(m.title)}"><div class="modalTitle"><h3>${m.title}</h3><button type="button" class="modalClose" data-action="close-modal" aria-label="Cerrar">×</button></div><div class="modalBody">${m.button?`<form id="demo-form"><div class="formGrid">${m.body}</div><div class="formActions"><button type="button" class="button secondary" data-action="close-modal">Volver</button><button type="submit" class="button gold">${esc(m.button)}</button></div></form>`:m.body}</div></div></div>`;}
function showModal(type,ref=''){modal={type,ref};render();}
function hasCollision(doctorId,date,time,exclude=''){const doctor=db.doctors.find(d=>d.id===doctorId);const start=toMinutes(time);const duration=Number(doctor?.availability?.consultationMinutes)||30;const buffer=Number(doctor?.availability?.bufferMinutes)||0;const end=start+duration+buffer;return db.appointments.some(a=>{if(a.id===exclude||a.doctorId!==doctorId||a.date!==date||['Cancelada','Ausente','Atendida'].includes(a.status))return false;const otherStart=toMinutes(a.time);const otherEnd=otherStart+duration+buffer;return start<otherEnd&&otherStart<end;});}
const toMinutes=value=>{const match=String(value||'').match(/^(\d{2}):(\d{2})$/);if(!match)return NaN;const hours=Number(match[1]),minutes=Number(match[2]);return hours<=23&&minutes<=59?hours*60+minutes:NaN;};
function slotWithinAvailability(doctor,date,time,availability=doctor?.availability){
 if(!doctor||!date||!time||!availability)return false;
 const day=String(new Date(`${date}T12:00:00`).getDay());const ranges=availability.weekly?.[day]||[];
 const start=toMinutes(time),duration=Number(availability.consultationMinutes)||30,buffer=Number(availability.bufferMinutes)||0,end=start+duration+buffer;
 if(!Number.isFinite(start)||!ranges.some(r=>start>=toMinutes(r.start)&&end<=toMinutes(r.end)))return false;
 return true;
}
function blockedByException(doctor,date,time,availability=doctor?.availability){
 const start=toMinutes(time),end=start+(Number(availability?.consultationMinutes)||30)+(Number(availability?.bufferMinutes)||0);
 return (availability?.exceptions||[]).some(x=>x.date===date&&(x.scope==='day'||(start<toMinutes(x.end)&&end>toMinutes(x.start))));
}
function availabilityError(doctorId,date,time,exclude=''){
 const doctor=db.doctors.find(d=>d.id===doctorId);if(!doctor||!doctor.active)return 'El médico seleccionado no está disponible.';
 if(!slotWithinAvailability(doctor,date,time))return 'El horario seleccionado está fuera de la jornada o no permite completar la duración de la consulta.';
 if(blockedByException(doctor,date,time))return 'El horario seleccionado coincide con una ausencia o bloqueo del médico.';
 if(hasCollision(doctorId,date,time,exclude))return 'El médico ya tiene otra cita reservada a esa hora.';
 return '';
}
function availabilityConflicts(doctorId,availability){
 const doctor=db.doctors.find(d=>d.id===doctorId);if(!doctor)return [];
 return db.appointments.filter(a=>a.doctorId===doctorId&&a.date>=today()&&!['Cancelada','Ausente','Atendida'].includes(a.status)&&(!slotWithinAvailability(doctor,a.date,a.time,availability)||blockedByException(doctor,a.date,a.time,availability)));
}

function forbidden(msg){toast(msg||'No permitido para este perfil de demostración.',true);}
function validateDuplicate(arr,property,value,exceptId=''){return arr.some(x=>x.id!==exceptId&&String(x[property]).toLowerCase()===String(value).toLowerCase());}
function handleSubmit(event){
 event.preventDefault();const t=modal?.type,ref=modal?.ref;
 const obj=Object.fromEntries(new FormData(event.target).entries());
 const val=name=>String(obj[name]??'').trim();
 const required=(...keys)=>keys.every(k=>val(k).length>0);
 if(!t)return;
 if(['new-hospital','edit-hospital','new-doctor','edit-doctor','new-specialty','edit-specialty','new-staff','edit-staff','new-patient','edit-patient','new-insurer','edit-insurer'].includes(t)&&role!=='admin'&&!['new-patient','edit-patient'].includes(t))return forbidden();
 if(['new-patient','edit-patient'].includes(t)&&role==='medico')return forbidden();
 if(t==='new-hospital'||t==='edit-hospital'){
  if(!required('name','city','phone'))return forbidden('Completa todos los campos.');
  if(validateDuplicate(db.hospitals,'name',val('name'),ref))return forbidden('Ya existe un hospital con ese nombre.');
  change(s=>{const h=s.hospitals.find(x=>x.id===ref);if(h)Object.assign(h,{name:val('name'),city:val('city'),phone:val('phone')});else s.hospitals.push({id:id('H'),name:val('name'),city:val('city'),phone:val('phone'),active:true});},'Hospital guardado',val('name'));
 }else if(t==='new-doctor'||t==='edit-doctor'){
  if(!required('name','license','specialtyId','hospitalId'))return forbidden('Información incompleta.');
  const selectedSpecialty=db.specialties.find(x=>x.id===val('specialtyId'));
  if(!selectedSpecialty||(!selectedSpecialty.active&&db.doctors.find(x=>x.id===ref)?.specialtyId!==selectedSpecialty.id))return forbidden('Selecciona una especialidad activa del catálogo.');
  if(validateDuplicate(db.doctors,'license',val('license'),ref))return forbidden('Este identificador profesional ya está registrado.');
  const profile={name:val('name'),specialtyId:selectedSpecialty.id,license:val('license'),hospitalId:val('hospitalId'),email:val('email'),phone:val('phone'),consultationRoom:val('consultationRoom')};
  change(s=>{const d=s.doctors.find(x=>x.id===ref);if(d)Object.assign(d,profile);else s.doctors.push({id:id('D'),...profile,availability:defaultAvailability(),active:true});},'Profesional actualizado',`${val('name')} · ${selectedSpecialty.name}`);
 }else if(t==='new-specialty'||t==='edit-specialty'){
  if(role!=='admin')return forbidden();if(!required('name'))return forbidden('Escribe el nombre de la especialidad.');
  if(validateDuplicate(db.specialties,'name',val('name'),ref))return forbidden('Ya existe una especialidad con ese nombre.');
  change(s=>{const item=s.specialties.find(x=>x.id===ref);if(item)Object.assign(item,{name:val('name'),description:val('description')});else s.specialties.push({id:id('SP'),name:val('name'),description:val('description'),active:true});},'Especialidad guardada',val('name'));
 }else if(t==='new-staff'||t==='edit-staff'){
  if(!required('name','role','hospitalId'))return forbidden('Información incompleta.');
  change(s=>{const r=s.staff.find(x=>x.id===ref);if(r)Object.assign(r,{name:val('name'),role:val('role'),hospitalId:val('hospitalId')});else s.staff.push({id:id('U'),name:val('name'),role:val('role'),hospitalId:val('hospitalId'),active:true});},'Personal actualizado',val('name'));
 }else if(t==='new-patient'||t==='edit-patient'){
  if(!required('name','document','phone'))return forbidden('Información incompleta.');
  if(validateDuplicate(db.patients,'document',val('document'),ref))return forbidden('El identificador de demostración está duplicado.');
  change(s=>{const p=s.patients.find(x=>x.id===ref);if(p)Object.assign(p,{name:val('name'),document:val('document'),phone:val('phone'),ars:val('ars')});else s.patients.push({id:id('P'),name:val('name'),document:val('document'),phone:val('phone'),ars:val('ars')});},'Registro de paciente actualizado',val('name'));
 }else if(t==='new-insurer'||t==='edit-insurer'){
  if(!required('name','coverage','status'))return forbidden('Información incompleta.');
  if(Number(val('coverage'))<0||Number(val('coverage'))>100)return forbidden('El porcentaje debe estar entre 0 y 100.');
  if(validateDuplicate(db.insurers,'name',val('name'),ref))return forbidden('Ya existe una aseguradora con ese nombre.');
  change(s=>{const a=s.insurers.find(x=>x.id===ref);if(a)Object.assign(a,{name:val('name'),status:val('status'),coverage:Number(val('coverage'))});else s.insurers.push({id:id('A'),name:val('name'),status:val('status'),coverage:Number(val('coverage'))});},'Convenio actualizado',val('name'));
 }else if(t==='new-appt'){
  if(role==='medico')return forbidden();
  if(!required('patientId','doctorId','date','time','amount'))return forbidden('Completa la cita.');
  const doc=db.doctors.find(d=>d.id===val('doctorId')&&d.active),patient=db.patients.find(p=>p.id===val('patientId'));
  if(!doc||!patient)return forbidden('Paciente o profesional no disponible.');
  if(val('date')<today())return forbidden('Selecciona una fecha actual o futura.');
  const slotError=availabilityError(doc.id,val('date'),val('time'));if(slotError)return forbidden(slotError);
  const amount=Number(val('amount'));if(!Number.isFinite(amount)||amount<0||amount>100000)return forbidden('Monto no válido.');
  change(s=>{const newId=id('APT');s.appointments.unshift({id:newId,patientId:patient.id,hospitalId:doc.hospitalId,doctorId:doc.id,specialtyId:doc.specialtyId,specialty:doctorSpecialty(doc),date:val('date'),time:val('time'),status:'Solicitada',payment:'Pendiente',amount,source:'Recepción',paymentRef:'',notes:''});},'Cita creada',`${patient.name} · ${val('date')} ${val('time')}`);
 }else if(t==='reschedule'){
  if(role==='medico')return forbidden();const a=found(ref);
  if(!a||['Cancelada','Atendida'].includes(a.status))return forbidden('Esta cita no admite cambios.');
  if(!required('date','time','reason'))return forbidden('Fecha, hora y motivo son obligatorios.');
  if(val('date')<today())return forbidden('No se puede reservar una fecha pasada.');
  const slotError=availabilityError(a.doctorId,val('date'),val('time'),ref);if(slotError)return forbidden(slotError);
  change(s=>{const x=s.appointments.find(y=>y.id===ref);x.date=val('date');x.time=val('time');x.status='Confirmada';},'Cita reprogramada',`${ref} · ${val('reason')}`);
 }else if(t==='cancel-appt'){
  if(role==='medico')return forbidden();if(!required('reason'))return forbidden('Indica un motivo.');
  const a=found(ref);if(!a||['Atendida','Cancelada'].includes(a.status))return forbidden('No se puede cancelar.');
  change(s=>{s.appointments.find(y=>y.id===ref).status='Cancelada';},'Cita cancelada',`${ref} · ${val('reason')}`);
 }else if(t==='charge'){
  if(role==='medico')return forbidden();const a=found(ref);if(!a||a.payment==='Pagado'||a.status==='Cancelada')return forbidden('El pago ya existe o la cita no está activa.');
  if(!required('amount','method','reference'))return forbidden('Todos los datos de caja son necesarios.');
  const n=Number(val('amount'));if(!Number.isFinite(n)||n!==Number(a.amount))return forbidden('El importe no coincide con el monto autorizado.');
  if(db.appointments.some(x=>x.paymentRef===val('reference')))return forbidden('Referencia duplicada.');
  change(s=>{const x=s.appointments.find(y=>y.id===ref);x.payment='Pagado';x.paymentRef=val('reference');},'Cobro de demostración',`${ref} · ${money(n)} · ${val('method')}`);
 }else if(t==='reverse-pay'){
  if(role!=='admin')return forbidden();if(!required('reason'))return forbidden('La justificación es obligatoria.');
  const a=found(ref);if(!a||a.payment!=='Pagado')return forbidden('El cobro ya está pendiente.');
  change(s=>{const x=s.appointments.find(y=>y.id===ref);x.payment='Pendiente';x.paymentRef='';},'Reversión de pago',`${ref} · ${val('reason')}`);
 }else if(t==='reassign'){
  if(role!=='admin')return forbidden();if(!required('doctorId','reason'))return forbidden('Información incompleta.');
  const a=found(ref),d=db.doctors.find(x=>x.id===val('doctorId')&&x.active);if(!a||!d)return forbidden('Profesional no disponible.');
  const slotError=availabilityError(d.id,a.date,a.time,ref);if(slotError)return forbidden(slotError);
  change(s=>{const x=s.appointments.find(y=>y.id===ref);x.doctorId=d.id;x.specialtyId=d.specialtyId;x.specialty=doctorSpecialty(d);x.hospitalId=d.hospitalId;},'Profesional reasignado',`${ref} · ${d.name} · ${val('reason')}`);
 }else if(t==='reminder'){
  if(role!=='recepcion')return forbidden();if(!required('appointmentId','message'))return forbidden('Mensaje incompleto.');
  change(()=>{},'Recordatorio interno simulado',`${val('appointmentId')} · ${val('message')}`);
 }else if(t==='new-exception'){
  if(role!=='medico')return forbidden();const doctor=currentDoctor();if(!doctor)return forbidden('No hay un perfil médico activo.');
  if(!required('date','scope','reason'))return forbidden('Completa fecha y motivo.');if(val('date')<today())return forbidden('No se puede bloquear una fecha pasada.');
  const scope=val('scope'),start=scope==='day'?'00:00':val('start'),end=scope==='day'?'23:59':val('end');
  if(!['day','range'].includes(scope))return forbidden('Selecciona un tipo de bloqueo válido.');
  if(scope==='range'){const startMinutes=toMinutes(start),endMinutes=toMinutes(end);if(!required('start','end')||!Number.isFinite(startMinutes)||!Number.isFinite(endMinutes)||startMinutes>=endMinutes)return forbidden('El rango horario no es válido.');}
  const proposed={id:id('BLQ'),date:val('date'),scope,start,end,reason:val('reason')};
  const conflicts=db.appointments.filter(a=>a.doctorId===doctor.id&&a.date>=today()&&!['Cancelada','Ausente','Atendida'].includes(a.status)&&a.date===proposed.date&&(scope==='day'||(toMinutes(a.time)<toMinutes(end)&&toMinutes(a.time)+(doctor.availability.consultationMinutes||30)+(doctor.availability.bufferMinutes||0)>toMinutes(start))));
  if(conflicts.length)return forbidden(`No se puede bloquear: ${conflicts.length} cita(s) ya están reservadas en ese período.`);
  change(s=>{s.doctors.find(x=>x.id===doctor.id).availability.exceptions.push(proposed);},'Bloqueo de disponibilidad registrado',`${dateLabel(proposed.date)} · ${doctor.name}`);
 } 
 modal=null;render();toast('Operación guardada en demostración');
}
function saveAvailability(event){
 event.preventDefault();if(role!=='medico')return forbidden();const doctor=currentDoctor();if(!doctor)return forbidden('No hay un perfil médico activo.');
 const form=event.target;const values=Object.fromEntries(new FormData(form).entries());const next={weekly:{},consultationMinutes:Number(values.consultationMinutes),bufferMinutes:Number(values.bufferMinutes),exceptions:doctor.availability.exceptions||[]};
 if(![15,20,30,45,60].includes(next.consultationMinutes)||![0,5,10,15,20].includes(next.bufferMinutes))return forbidden('La duración o el intervalo seleccionado no son válidos.');
 for(const [day,label] of WEEK_DAYS){
  const enabled=values[`day_${day}_active`]==='1';const intervals=[];
  if(enabled){for(const number of [1,2]){const start=String(values[`day_${day}_start_${number}`]||''),end=String(values[`day_${day}_end_${number}`]||'');if(!start&&!end)continue;const startMinutes=toMinutes(start),endMinutes=toMinutes(end);if(!start||!end||!Number.isFinite(startMinutes)||!Number.isFinite(endMinutes)||startMinutes>=endMinutes)return forbidden(`Revisa el horario de ${label}: cada turno debe tener inicio y fin válidos.`);intervals.push({start,end});}
   if(!intervals.length)return forbidden(`Has activado ${label}, pero no has indicado ningún turno.`);
   intervals.sort((a,b)=>toMinutes(a.start)-toMinutes(b.start));for(let i=1;i<intervals.length;i++)if(toMinutes(intervals[i].start)<toMinutes(intervals[i-1].end))return forbidden(`Los turnos de ${label} se superponen.`);
  }
  next.weekly[day]=intervals;
 }
 const conflicts=availabilityConflicts(doctor.id,next);
 if(conflicts.length)return forbidden(`No se puede guardar: ${conflicts.length} cita(s) existentes quedarían fuera del nuevo horario. Reprograma esas citas antes de reducir la jornada.`);
 change(s=>{s.doctors.find(x=>x.id===doctor.id).availability=next;},'Disponibilidad médica actualizada',`${doctor.name} · ${next.consultationMinutes} min por consulta`);
 toast('Tu disponibilidad fue guardada correctamente.');
}
function saveFile(name,content,mime){const b=new Blob([content],{type:mime});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),700);}
function csvCell(value){let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
function csv(rows){return '\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');}
function action(name,ref){
 if(name==='choose')return chooseRole(ref);
 if(name==='leave'){role='';sessionStorage.removeItem(SESSION);return render();}
 if(name==='page')return setPage(ref);
 if(name==='close-modal'){modal=null;return render();}
 if(name==='new-appt')return role==='medico'?forbidden():showModal('new-appt');
 if(name==='new-exception'&&role!=='medico')return forbidden();
 if(name==='filter'){query=document.getElementById('query')?.value?.trim()||'';hospitalFilter=document.getElementById('hospital-filter')?.value||'';return render();}
 if(name==='reset-filter'){query='';hospitalFilter='';return render();}
 if(name==='print')return window.print();
 if(name==='export-csv'){
  const rows=[['Cita','Paciente ficticio','Hospital','Especialista','Fecha','Hora','Estado','Pago','Monto DOP'],...db.appointments.map(a=>[a.id,patientName(a.patientId),hospitalName(a.hospitalId),doctorName(a.doctorId),a.date,a.time,a.status,a.payment,a.amount])];
  saveFile('VITALIA_citas_demo.csv',csv(rows),'text/csv;charset=utf-8');return toast('CSV exportado');
 }
 if(name==='export-audit'){
  saveFile('VITALIA_auditoria_demo.csv',csv([['Fecha ISO','Actor demo','Evento','Detalle'],...db.audit.map(e=>[e.at,e.by,e.event,e.detail])]),'text/csv;charset=utf-8');return toast('Auditoría exportada');
 }
 if(name==='export-json'){saveFile('VITALIA_staff_demo_backup.json',JSON.stringify(db,null,2),'application/json');return toast('Respaldo exportado');}
 if(name==='reset'){
  if(role!=='admin')return forbidden();if(!confirm('¿Restablecer todos los datos ficticios de los portales institucionales?'))return;
  db=seed();localStorage.setItem(STORE,JSON.stringify(db));render();return toast('Datos de demostración restablecidos');
 }
 if(['new-hospital','edit-hospital','new-doctor','edit-doctor','new-specialty','edit-specialty','new-staff','edit-staff','new-insurer','edit-insurer'].includes(name)&&role!=='admin')return forbidden();
 if(['new-patient','edit-patient'].includes(name)&&role==='medico')return forbidden();
 if(['new-hospital','edit-hospital','new-doctor','edit-doctor','new-specialty','edit-specialty','new-staff','edit-staff','new-patient','edit-patient','new-insurer','edit-insurer','new-exception','reschedule','cancel-appt','charge','receipt','reverse-pay','reassign','appt-detail','reminder'].includes(name))return showModal(name,ref);
 if(name==='checkin'){
  if(role!=='recepcion'&&role!=='admin')return forbidden();const a=found(ref);
  if(!a||!['Solicitada','Confirmada'].includes(a.status))return forbidden('Esta cita no permite registrar llegada.');
  if(a.date>today())return forbidden('La llegada solo puede registrarse el día programado o después.');
  if(!confirm(`¿Se verificó la identidad ficticia de ${patientName(a.patientId)} y llegó a recepción?`))return;
  change(s=>{s.appointments.find(x=>x.id===ref).status='Llegó';},'Llegada verificada',`${ref} · ${patientName(a.patientId)}`);return toast('La llegada aparece ahora en la agenda del médico');
 }
 if(name==='consult-start'){
  if(role!=='medico')return forbidden();const a=found(ref);
  if(!a||a.doctorId!==(currentDoctor()?.id||'')||a.status!=='Llegó')return forbidden('Recepción debe verificar la llegada antes de iniciar.');
  change(s=>{s.appointments.find(x=>x.id===ref).status='En consulta';},'Atención iniciada (demo)',`${ref} · ${patientName(a.patientId)}`);return toast('Estado administrativo: En consulta');
 }
 if(name==='consult-complete'){
  if(role!=='medico')return forbidden();const a=found(ref);
  if(!a||a.doctorId!==(currentDoctor()?.id||'')||a.status!=='En consulta')return forbidden('Primero inicia la atención.');
  if(!confirm('¿Marcar esta atención administrativa como finalizada? Esto NO firma una nota clínica.'))return;
  change(s=>{s.appointments.find(x=>x.id===ref).status='Atendida';},'Atención finalizada (demo)',ref);return toast('Atención administrativa finalizada');
 }
 if(name==='toggle-specialty'){
  if(role!=='admin')return forbidden();const item=db.specialties.find(x=>x.id===ref);if(!item)return;
  if(item.active&&db.doctors.some(d=>d.specialtyId===ref))return forbidden('No puedes desactivar esta especialidad mientras esté asignada a uno o más médicos.');
  change(s=>{const x=s.specialties.find(y=>y.id===ref);x.active=!x.active;},'Estado de especialidad actualizado',item.name);return toast('Estado de especialidad actualizado');
 }
 if(name==='remove-exception'){
  if(role!=='medico')return forbidden();const doctor=currentDoctor();if(!doctor)return forbidden('No hay un perfil médico activo.');
  const item=doctor.availability.exceptions.find(x=>x.id===ref);if(!item)return;
  change(s=>{const d=s.doctors.find(x=>x.id===doctor.id);d.availability.exceptions=d.availability.exceptions.filter(x=>x.id!==ref);},'Bloqueo de disponibilidad eliminado',`${dateLabel(item.date)} · ${doctor.name}`);return toast('Bloqueo eliminado');
 }
 if(name==='toggle-hospital'||name==='toggle-doctor'||name==='toggle-staff'){
  if(role!=='admin')return forbidden();const k=name==='toggle-hospital'?'hospitals':name==='toggle-doctor'?'doctors':'staff';const obj=db[k].find(x=>x.id===ref);if(!obj)return;
  change(s=>{const x=s[k].find(y=>y.id===ref);x.active=!x.active;},'Estado institucional actualizado',`${k} · ${obj.name}`);return toast('Estado actualizado');
 }
 if(name==='patient-appts'){
  setPage('appointments');query=patientName(ref);return render();
 }
 if(name==='discharge'){change(()=>{},'Salida administrativa registrada',ref);return toast('Salida administrativa registrada');}
}
ROOT.addEventListener('click',event=>{
  const btn=event.target.closest('[data-action]');if(!btn)return;
  const name=btn.dataset.action;
  if(name==='close-outside'&&event.target===btn){modal=null;render();return;}
  if(name==='close-outside')return;
  event.preventDefault();action(name,btn.dataset.id||'');
});
ROOT.addEventListener('submit',event=>{if(event.target.id==='demo-form')handleSubmit(event);if(event.target.id==='availability-form')saveAvailability(event);});
ROOT.addEventListener('change',event=>{if(event.target.id==='role-select')chooseRole(event.target.value);if(event.target.id==='doctor-select'){if(role!=='medico')return forbidden();if(db.doctors.some(d=>d.id===event.target.value&&d.active)){activeDoctor=event.target.value;page='dashboard';query='';render();}}});
ROOT.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='query'){event.preventDefault();action('filter');}});
window.addEventListener('storage',e=>{if(e.key===STORE){db=load();if(role==='medico'&&!db.doctors.some(d=>d.id===activeDoctor&&d.active))activeDoctor=db.doctors.find(d=>d.active)?.id||'';render();toast('Datos actualizados desde otra pestaña');}});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal){modal=null;render();}});
render();
