import { useCallback, useEffect, useState, type FormEvent } from 'react'
import './App.css'
import ConsultaClinica from './ConsultaClinica'

type Usuario = { id: string | null; nombreUsuario: string | null; roles: string[] }
type Rol = 'Administrador' | 'Medico' | 'Recepcionista'
type Hospital = { id: number; nombre: string; ciudad: string }
type Especialidad = { id: number; nombre: string; activa: boolean }
type Medico = { id: number; nombre: string; apellido: string; fotoUrl: string | null; numeroExequatur: string | null; hospitalIds: number[]; especialidadIds: number[] }
type Paciente = { id: string; nombre: string; apellido: string; correo: string | null; telefono: string | null }
type Cita = { id: number; fecha: string; hora: string; estado: string; paciente: string; medico?: string; hospital: string; especialidad: string; medicoId?: number; hospitalId?: number; telefono?: string | null }
type Resumen = { medicos: number; pacientes: number; citas: number; programadas: number; vinculacionPendiente: boolean }
type Horario = { hospitalId: number; diaSemana: number; horaInicio: string; horaFin: string; intervaloMinutos: number }
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const fechaHoy = () => {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const campo = (tipo: string) => partes.find(p => p.type === tipo)?.value || ''
  return `${campo('year')}-${campo('month')}-${campo('day')}`
}
const tituloRol: Record<Rol, string> = { Administrador: 'Administración', Medico: 'Médico', Recepcionista: 'Recepción' }
const opciones: Record<Rol, { id: string; titulo: string; simbolo: string }[]> = {
  Administrador: [
    { id: 'resumen', titulo: 'Vista general', simbolo: '▣' },
    { id: 'medicos', titulo: 'Médicos', simbolo: '✚' },
    { id: 'horarios', titulo: 'Horarios', simbolo: '◷' },
    { id: 'personal', titulo: 'Personal', simbolo: '♙' },
    { id: 'agenda', titulo: 'Agenda', simbolo: '▦' },
  ],
  Medico: [{ id: 'agenda-medico', titulo: 'Mi agenda', simbolo: '▦' }],
  Recepcionista: [
    { id: 'agenda', titulo: 'Agenda', simbolo: '▦' },
    { id: 'nueva-cita', titulo: 'Reservar cita', simbolo: '＋' },
    { id: 'pacientes', titulo: 'Pacientes', simbolo: '♙' },
  ],
}

async function solicitar<T>(ruta: string, token?: string, metodo = 'GET', datos?: unknown): Promise<T> {
  const respuesta = await fetch(`/api/${ruta}`, {
    method: metodo,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(datos === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(datos === undefined ? {} : { body: JSON.stringify(datos) }),
  })
  if (!respuesta.ok) {
    let mensaje = `El servidor respondió ${respuesta.status}.`
    try {
      const error = (await respuesta.json()) as { mensaje?: string; title?: string; detail?: string }
      mensaje = error.mensaje || error.detail || error.title || mensaje
    } catch { /* Sin cuerpo JSON */ }
    throw new Error(mensaje)
  }
  if (respuesta.status === 204) return undefined as T
  return respuesta.json() as Promise<T>
}

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [vista, setVista] = useState('resumen')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [iniciando, setIniciando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [hospitales, setHospitales] = useState<Hospital[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [medicos, setMedicos] = useState<Medico[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const [citaClinicaId, setCitaClinicaId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')

  // Crear médico desde la lista original, sin introducir profesionales ficticios.
  const [nombreMedico, setNombreMedico] = useState('')
  const [apellidoMedico, setApellidoMedico] = useState('')
  const [exequatur, setExequatur] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [sedesMedico, setSedesMedico] = useState<number[]>([])
  const [especialidadesMedico, setEspecialidadesMedico] = useState<number[]>([])

  // Personal institucional.
  const [nombrePersonal, setNombrePersonal] = useState('')
  const [apellidoPersonal, setApellidoPersonal] = useState('')
  const [correoPersonal, setCorreoPersonal] = useState('')
  const [clavePersonal, setClavePersonal] = useState('')
  const [rolPersonal, setRolPersonal] = useState<'Medico' | 'Recepcionista'>('Recepcionista')
  const [medicoCuenta, setMedicoCuenta] = useState('')

  // Reserva desde recepción.
  const [pacienteReserva, setPacienteReserva] = useState('')
  const [medicoReserva, setMedicoReserva] = useState('')
  const [hospitalReserva, setHospitalReserva] = useState('')
  const [especialidadReserva, setEspecialidadReserva] = useState('')
  const [fechaReserva, setFechaReserva] = useState(fechaHoy())
  const [horaReserva, setHoraReserva] = useState('')
  const [horasLibres, setHorasLibres] = useState<string[]>([])

  // Edición de horarios del profesional.
  const [medicoHorarios, setMedicoHorarios] = useState('')
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const rol: Rol | null = usuario?.roles.includes('Administrador') ? 'Administrador'
    : usuario?.roles.includes('Recepcionista') ? 'Recepcionista'
      : usuario?.roles.includes('Medico') ? 'Medico' : null

  const cargarDatos = useCallback(async () => {
    if (!token || !rol) return
    setCargando(true)
    setError('')
    try {
      const [h, e, m, r] = await Promise.all([
        solicitar<Hospital[]>('hospitales', token),
        solicitar<Especialidad[]>('especialidades', token),
        solicitar<Medico[]>('medicos', token),
        solicitar<Resumen>('institucional/resumen', token),
      ])
      setHospitales(h); setEspecialidades(e); setMedicos(m); setResumen(r)
      if (rol === 'Medico') {
        setCitas(await solicitar<Cita[]>('institucional/mi-agenda', token))
      } else {
        const [lista, personas] = await Promise.all([
          solicitar<Cita[]>('institucional/citas', token),
          solicitar<Paciente[]>('institucional/pacientes', token),
        ])
        setCitas(lista); setPacientes(personas)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos del portal.')
    } finally {
      setCargando(false)
    }
  }, [token, rol])

  useEffect(() => { void cargarDatos() }, [cargarDatos])

  useEffect(() => {
    if (!token || vista !== 'horarios' || !medicoHorarios) { setHorarios([]); return }
    let activo = true
    setCargandoHorarios(true)
    solicitar<(Horario & { id: number })[]>(`institucional/medicos/${medicoHorarios}/horarios`, token)
      .then(datos => { if (activo) setHorarios(datos.map(h => ({ ...h, horaInicio: h.horaInicio.slice(0, 5), horaFin: h.horaFin.slice(0, 5) }))) })
      .catch(e => { if (activo) setError(e instanceof Error ? e.message : 'No se pudieron consultar horarios.') })
      .finally(() => { if (activo) setCargandoHorarios(false) })
    return () => { activo = false }
  }, [token, vista, medicoHorarios])

  useEffect(() => {
    if (!token || vista !== 'nueva-cita' || !medicoReserva || !hospitalReserva || !fechaReserva) { setHorasLibres([]); return }
    let activo = true
    setHorasLibres([]); setHoraReserva('')
    solicitar<{ horas: string[] }>(`medicos/${medicoReserva}/disponibilidad?hospitalId=${hospitalReserva}&fecha=${encodeURIComponent(fechaReserva)}`, token)
      .then(datos => { if (activo) setHorasLibres(datos.horas) })
      .catch(() => { if (activo) setHorasLibres([]) })
    return () => { activo = false }
  }, [token, vista, medicoReserva, hospitalReserva, fechaReserva])

  async function login(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setIniciando(true); setError(''); setAviso('')
    try {
      const credenciales = await solicitar<{ accessToken: string }>('auth/login', undefined, 'POST', { correoElectronico: correo.trim(), contrasena: clave })
      if (!credenciales.accessToken) throw new Error('El servidor no entregó un token de acceso.')
      const actual = await solicitar<Usuario>('auth/me', credenciales.accessToken)
      const permitido = actual.roles.some(r => ['Administrador', 'Medico', 'Recepcionista'].includes(r))
      if (!permitido) throw new Error('Este portal es exclusivo para personal institucional. Los pacientes utilizan la aplicación móvil.')
      const nuevoRol = actual.roles.includes('Administrador') ? 'Administrador' : actual.roles.includes('Recepcionista') ? 'Recepcionista' : 'Medico'
      setUsuario(actual); setToken(credenciales.accessToken); setVista(opciones[nuevoRol].at(0)?.id || 'resumen'); setClave('')
    } catch (e) { setError(e instanceof Error ? e.message : 'No fue posible iniciar sesión.') }
    finally { setIniciando(false) }
  }

  async function mutacion(ruta: string, metodo: string, datos?: unknown) {
    if (!token) return
    setError(''); setAviso('')
    try {
      await solicitar(ruta, token, metodo, datos)
      setAviso('Cambios guardados correctamente.')
      await cargarDatos()
      return true
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron guardar los cambios.'); return false }
  }

  async function nuevoMedico(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!sedesMedico.length || !especialidadesMedico.length) { setError('Selecciona al menos una sede y una especialidad.'); return }
    if (await mutacion('medicos', 'POST', {
      nombre: nombreMedico, apellido: apellidoMedico,
      numeroExequatur: exequatur || null, fotoUrl: fotoUrl || null,
      hospitalIds: sedesMedico, especialidadIds: especialidadesMedico,
    })) {
      setNombreMedico(''); setApellidoMedico(''); setExequatur(''); setFotoUrl(''); setSedesMedico([]); setEspecialidadesMedico([])
    }
  }

  async function nuevoPersonal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (await mutacion('institucional/personal', 'POST', {
      nombre: nombrePersonal, apellido: apellidoPersonal, correo: correoPersonal,
      contrasena: clavePersonal, rol: rolPersonal, medicoId: rolPersonal === 'Medico' ? Number(medicoCuenta) : null,
    })) {
      setNombrePersonal(''); setApellidoPersonal(''); setCorreoPersonal(''); setClavePersonal(''); setMedicoCuenta('')
    }
  }

  async function nuevaCita(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const guardado = await mutacion('institucional/citas', 'POST', {
      pacienteId: pacienteReserva, medicoId: Number(medicoReserva),
      hospitalId: Number(hospitalReserva), especialidadId: Number(especialidadReserva),
      fecha: fechaReserva, hora: `${horaReserva.slice(0, 5)}:00`,
    })
    if (guardado) { setHoraReserva(''); setHorasLibres([]); setVista('agenda') }
  }

  async function cambiarEstado(cita: Cita, accion: 'cancelar' | 'atender') {
    if (!window.confirm(accion === 'atender' ? `¿Marcar como atendida la cita de ${cita.paciente}?` : `¿Cancelar la cita de ${cita.paciente}?`)) return
    await mutacion(accion === 'atender' ? `institucional/mi-agenda/${cita.id}/atender` : `institucional/citas/${cita.id}/cancelar`, 'PATCH')
  }

  function alternar(set: (valores: number[]) => void, valores: number[], id: number) {
    set(valores.includes(id) ? valores.filter(v => v !== id) : [...valores, id])
  }

  const medicosDisponibles = medicos.filter(m =>
    (!hospitalReserva || m.hospitalIds.includes(Number(hospitalReserva))) &&
    (!especialidadReserva || m.especialidadIds.includes(Number(especialidadReserva))))
  const busquedaNormalizada = busqueda.trim().toLocaleLowerCase()
  const citasVisibles = citas.filter(c => !busquedaNormalizada ||
    [c.paciente, c.medico, c.hospital, c.especialidad, c.fecha, c.estado]
      .some(t => (t || '').toLocaleLowerCase().includes(busquedaNormalizada)))
  const medicoHorario = medicos.find(m => String(m.id) === medicoHorarios)

  if (!usuario || !rol || !token) return (
    <main className="vitalia-layout">
      <section className="vitalia-brand">
        <div className="brand-header"><span className="brand-symbol">✚</span><span className="brand-name">VITALIA</span></div>
        <div className="brand-content"><p className="brand-subtitle">PLATAFORMA INTEGRAL DE SALUD</p><h1>Una nueva forma de <span>cuidar la salud.</span></h1><p className="brand-description">Tecnología, atención y confianza conectadas en una sola experiencia.</p></div>
        <footer className="brand-footer">VITALIA · Gestión hospitalaria</footer>
      </section>
      <section className="vitalia-access"><div className="access-card">
        <p className="access-eyebrow">PORTAL INSTITUCIONAL</p><h2>Bienvenido a VITALIA</h2>
        <p className="access-description">Ingresa con tu cuenta de Administración, Médico o Recepción.</p>
        <form className="access-form" onSubmit={login}>
          <label htmlFor="correo">Correo electrónico</label>
          <input id="correo" type="email" autoComplete="username" maxLength={256} value={correo} onChange={e => setCorreo(e.target.value)} required placeholder="correo@hospital.com" />
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" type="password" autoComplete="current-password" value={clave} onChange={e => setClave(e.target.value)} required placeholder="Contraseña" />
          <button className="access-button" disabled={iniciando}>{iniciando ? 'Comprobando credenciales…' : 'Ingresar a VITALIA'}</button>
        </form>
        {error && <p className="form-message error" role="alert">{error}</p>}
        <p className="access-note">Administración · Médicos · Recepción</p>
      </div></section>
    </main>
  )

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-brand"><span>✚</span> VITALIA<small>SISTEMA HOSPITALARIO</small></div>
        <div className="sidebar-heading">PORTAL {tituloRol[rol].toLocaleUpperCase()}</div>
        <nav aria-label="Módulos del portal">
          {opciones[rol].map(op => <button key={op.id} className={`nav-item ${vista === op.id ? 'active' : ''}`} onClick={() => { setVista(op.id); setError(''); setAviso('') }}><span>{op.simbolo}</span>{op.titulo}</button>)}
        </nav>
        <div className="sidebar-bottom"><span className="user-avatar">{(usuario.nombreUsuario || 'V').slice(0, 1).toUpperCase()}</span><div className="user-data"><strong>{usuario.nombreUsuario || 'Usuario'}</strong><small>{tituloRol[rol]}</small></div><button aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => { setToken(null); setUsuario(null); setResumen(null); setCitas([]); setError(''); setAviso('') }}>↪</button></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div><span className="eyebrow">VITALIA / {tituloRol[rol].toUpperCase()}</span><h1>{opciones[rol].find(op => op.id === vista)?.titulo || 'Panel institucional'}</h1><p>Centros VITALIA · Santo Domingo, Bávaro y Santiago</p></div><button className="outline-button" disabled={cargando} onClick={() => void cargarDatos()}>↻ Actualizar</button></header>
        {error && <div className="notice danger" role="alert">{error}<button onClick={() => setError('')}>×</button></div>}
        {aviso && <div className="notice success" role="status">{aviso}<button onClick={() => setAviso('')}>×</button></div>}
        {cargando && <p className="muted">Sincronizando datos con SQL Server…</p>}
        {vista === 'resumen' && rol === 'Administrador' && <>
          <section className="hero"><div><div className="eyebrow">OPERACIÓN HOSPITALARIA</div><h2>Gestión unificada, atención humana.</h2><p>Consulta los registros actuales; las cifras provienen de la API, sin datos ficticios.</p></div><span className="hero-mark">✚</span></section>
          <div className="stats">
            {[['Médicos activos', resumen?.medicos ?? '—', '✚'], ['Pacientes registrados', resumen?.pacientes ?? '—', '♙'], ['Citas totales', resumen?.citas ?? '—', '▦'], ['Citas programadas', resumen?.programadas ?? '—', '◷']].map(([titulo, valor, simbolo]) => <div className="stat" key={titulo}><span>{simbolo}</span><p>{titulo}</p><strong>{valor}</strong></div>)}
          </div>
          <div className="two-column"><section className="panel"><div className="panel-title"><h3>Sedes hospitalarias</h3><small>{hospitales.length} registradas</small></div>{hospitales.map(h => <div className="info-line" key={h.id}><div className="mini-icon">⌂</div><div><strong>{h.nombre}</strong><small>{h.ciudad}</small></div><span className="pill">Activa</span></div>)}</section><section className="panel"><div className="panel-title"><h3>Especialidades</h3><small>{especialidades.length} registradas</small></div>{especialidades.map(e => <div className="info-line" key={e.id}><div className="mini-icon">✚</div><div><strong>{e.nombre}</strong><small>Catálogo médico</small></div><span className="pill">{e.activa ? 'Activa' : 'Inactiva'}</span></div>)}</section></div>
        </>}
        {vista === 'medicos' && rol === 'Administrador' && <div className="two-column align-start">
          <section className="panel"><div className="panel-title"><h3>Directorio de profesionales</h3><small>{medicos.length} registrados</small></div>
            {medicos.length === 0 && <p className="empty">No hay médicos registrados. Añade únicamente los de la lista original aprobada.</p>}
            {medicos.map(m => <div className="info-line" key={m.id}><div className="mini-icon">✚</div><div><strong>Dr./Dra. {m.nombre} {m.apellido}</strong><small>{m.especialidadIds.map(id => especialidades.find(e => e.id === id)?.nombre).filter(Boolean).join(' · ') || 'Sin especialidad'} · {m.hospitalIds.length} sede(s)</small></div></div>)}
          </section>
          <section className="panel"><div className="panel-title"><h3>Registrar profesional</h3><small>Datos de tu lista original</small></div>
            <form className="form-grid" onSubmit={nuevoMedico}>
              <label>Nombre<input required minLength={2} maxLength={100} value={nombreMedico} onChange={e => setNombreMedico(e.target.value)} placeholder="Nombre original" /></label>
              <label>Apellido<input required minLength={2} maxLength={100} value={apellidoMedico} onChange={e => setApellidoMedico(e.target.value)} placeholder="Apellido original" /></label>
              <label>Exequátur (opcional)<input maxLength={50} value={exequatur} onChange={e => setExequatur(e.target.value)} /></label>
              <label>URL de fotografía original (opcional)<input type="url" maxLength={500} value={fotoUrl} onChange={e => setFotoUrl(e.target.value)} placeholder="https://…" /></label>
              <fieldset><legend>Especialidades</legend><div className="check-list">{especialidades.filter(e => e.activa).map(e => <label key={e.id}><input type="checkbox" checked={especialidadesMedico.includes(e.id)} onChange={() => alternar(setEspecialidadesMedico, especialidadesMedico, e.id)} /> {e.nombre}</label>)}</div></fieldset>
              <fieldset><legend>Sedes</legend><div className="check-list">{hospitales.map(h => <label key={h.id}><input type="checkbox" checked={sedesMedico.includes(h.id)} onChange={() => alternar(setSedesMedico, sedesMedico, h.id)} /> {h.nombre}</label>)}</div></fieldset>
              <p className="help">Al guardar se crean horarios de demostración para días laborables. Podrás modificarlos en «Horarios».</p>
              <button className="primary-button">Guardar médico</button>
            </form></section>
        </div>}
        {vista === 'horarios' && rol === 'Administrador' && <section className="panel"><div className="panel-title"><h3>Horarios de consulta</h3><small>Reemplaza los tramos del médico seleccionado</small></div>
          <label className="field-narrow">Profesional<select value={medicoHorarios} onChange={e => setMedicoHorarios(e.target.value)}><option value="">Selecciona un médico</option>{medicos.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}</select></label>
          {cargandoHorarios && <p className="muted">Consultando horarios…</p>}
          {medicoHorario && <><div className="table-wrap"><table><thead><tr><th>Día</th><th>Sede</th><th>Inicio</th><th>Fin</th><th>Intervalo</th><th></th></tr></thead><tbody>{horarios.map((h, i) => <tr key={i}>
            <td><select value={h.diaSemana} onChange={e => setHorarios(actual => actual.map((x, j) => j === i ? { ...x, diaSemana: Number(e.target.value) } : x))}>{DIAS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}</select></td>
            <td><select value={h.hospitalId} onChange={e => setHorarios(actual => actual.map((x, j) => j === i ? { ...x, hospitalId: Number(e.target.value) } : x))}>{hospitales.filter(s => medicoHorario.hospitalIds.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.ciudad}</option>)}</select></td>
            <td><input type="time" value={h.horaInicio} onChange={e => setHorarios(actual => actual.map((x, j) => j === i ? { ...x, horaInicio: e.target.value } : x))} /></td>
            <td><input type="time" value={h.horaFin} onChange={e => setHorarios(actual => actual.map((x, j) => j === i ? { ...x, horaFin: e.target.value } : x))} /></td>
            <td><select value={h.intervaloMinutos} onChange={e => setHorarios(actual => actual.map((x, j) => j === i ? { ...x, intervaloMinutos: Number(e.target.value) } : x))}>{[15,20,30,45,60].map(m => <option key={m} value={m}>{m} min</option>)}</select></td>
            <td><button className="small-button danger-text" onClick={() => setHorarios(actual => actual.filter((_, j) => j !== i))}>Quitar</button></td>
          </tr>)}</tbody></table></div>
          <div className="actions"><button className="outline-button" onClick={() => setHorarios([...horarios, { hospitalId: medicoHorario.hospitalIds[0], diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', intervaloMinutos: 30 }])}>+ Añadir tramo</button><button className="primary-button" onClick={() => void mutacion(`medicos/${medicoHorario.id}/horarios`, 'PUT', { horarios: horarios.map(h => ({ ...h, horaInicio: `${h.horaInicio}:00`, horaFin: `${h.horaFin}:00` })) })}>Guardar horarios</button></div>
          <p className="help">El backend rechazará sedes no asignadas, tramos solapados o intervalos inválidos.</p></>}
        </section>}
        {vista === 'personal' && rol === 'Administrador' && <section className="panel narrow-panel"><div className="panel-title"><h3>Crear acceso institucional</h3><small>Solo para personal autorizado</small></div>
          <form className="form-grid" onSubmit={nuevoPersonal}>
            <div className="inline-two"><label>Nombre<input required minLength={2} value={nombrePersonal} onChange={e => setNombrePersonal(e.target.value)} /></label><label>Apellido<input required minLength={2} value={apellidoPersonal} onChange={e => setApellidoPersonal(e.target.value)} /></label></div>
            <label>Correo de acceso<input type="email" required value={correoPersonal} onChange={e => setCorreoPersonal(e.target.value)} placeholder="correo@hospital.com" /></label>
            <label>Contraseña inicial<input type="password" autoComplete="new-password" minLength={12} required value={clavePersonal} onChange={e => setClavePersonal(e.target.value)} /></label>
            <label>Rol<select value={rolPersonal} onChange={e => setRolPersonal(e.target.value as 'Medico' | 'Recepcionista')}><option value="Recepcionista">Recepcionista</option><option value="Medico">Médico</option></select></label>
            {rolPersonal === 'Medico' && <label>Vincular profesional<select value={medicoCuenta} onChange={e => setMedicoCuenta(e.target.value)} required><option value="">Selecciona un médico</option>{medicos.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}</select></label>}
            <p className="help">La contraseña debe cumplir las reglas de Identity: 12+ caracteres, mayúscula, minúscula, número y símbolo. No se mostrará ni guardará en el navegador.</p>
            <button className="primary-button">Crear cuenta</button>
          </form>
        </section>}
        {(vista === 'agenda' || vista === 'agenda-medico') && <section className="panel"><div className="panel-title"><div><h3>{rol === 'Medico' ? 'Citas asignadas a mi usuario' : 'Agenda institucional'}</h3><p className="muted">{citas.length} citas en el período consultado · Datos del servidor</p></div><input className="search-field" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar paciente, fecha, sede…" aria-label="Buscar citas" /></div>
          {citasVisibles.length === 0 ? <p className="empty">No hay citas para mostrar. Puede que todavía no existan registros o que el médico no esté vinculado a esta cuenta.</p> : <div className="table-wrap"><table><thead><tr><th>Fecha y hora</th><th>Paciente</th>{rol !== 'Medico' && <th>Médico</th>}<th>Sede</th><th>Especialidad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{citasVisibles.map(c => <tr key={c.id}>
            <td><strong>{c.fecha}</strong><small>{c.hora.slice(0, 5)}</small></td><td>{c.paciente}{c.telefono && <small>{c.telefono}</small>}</td>{rol !== 'Medico' && <td>{c.medico}</td>}<td>{c.hospital}</td><td>{c.especialidad}</td><td><span className={`pill ${c.estado === 'Cancelada' ? 'cancelled' : ''}`}>{c.estado}</span></td><td>{rol === 'Medico' ? (c.estado !== 'Cancelada' ? <button className="small-button" onClick={() => { setCitaClinicaId(c.id); setVista('consulta') }}>{c.estado === 'Atendida' ? 'Ver nota' : 'Abrir consulta'}</button> : '—') : (c.estado === 'Programada' ? <button className="small-button" onClick={() => void cambiarEstado(c, 'cancelar')}>Cancelar</button> : '—')}</td>
          </tr>)}</tbody></table></div>}
        </section>}
        {vista === 'nueva-cita' && rol === 'Recepcionista' && <section className="panel narrow-panel"><div className="panel-title"><h3>Reservar cita desde recepción</h3><small>Consulta disponibilidad en tiempo real a través de la API</small></div>
          <form className="form-grid" onSubmit={nuevaCita}>
            <label>Paciente<select required value={pacienteReserva} onChange={e => setPacienteReserva(e.target.value)}><option value="">Selecciona un paciente</option>{pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido} · {p.correo}</option>)}</select></label>
            <label>Hospital<select required value={hospitalReserva} onChange={e => { setHospitalReserva(e.target.value); setMedicoReserva('') }}><option value="">Selecciona una sede</option>{hospitales.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}</select></label>
            <label>Especialidad<select required value={especialidadReserva} onChange={e => { setEspecialidadReserva(e.target.value); setMedicoReserva('') }}><option value="">Selecciona una especialidad</option>{especialidades.filter(e => e.activa).map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}</select></label>
            <label>Médico<select required value={medicoReserva} onChange={e => setMedicoReserva(e.target.value)}><option value="">Selecciona un médico</option>{medicosDisponibles.map(m => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}</select></label>
            <div className="inline-two"><label>Fecha<input type="date" min={fechaHoy()} required value={fechaReserva} onChange={e => setFechaReserva(e.target.value)} /></label><label>Hora disponible<select required value={horaReserva} onChange={e => setHoraReserva(e.target.value)}><option value="">Seleccionar</option>{horasLibres.map(h => <option key={h} value={h}>{h}</option>)}</select></label></div>
            <p className="help">Si no aparecen horas, revisa que el profesional tenga un horario asignado en esa sede.</p><button className="primary-button" disabled={!horaReserva}>Confirmar reserva</button>
          </form></section>}
        {vista === 'pacientes' && rol === 'Recepcionista' && <section className="panel"><div className="panel-title"><h3>Pacientes registrados</h3><small>{pacientes.length} registros</small></div>{pacientes.length === 0 ? <p className="empty">No hay pacientes registrados todavía.</p> : <div className="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo electrónico</th><th>Teléfono</th></tr></thead><tbody>{pacientes.map(p => <tr key={p.id}><td>{p.nombre} {p.apellido}</td><td>{p.correo || '—'}</td><td>{p.telefono || '—'}</td></tr>)}</tbody></table></div>}</section>}
        {vista === 'consulta' && rol === 'Medico' && citaClinicaId !== null &&
          <ConsultaClinica key={citaClinicaId} citaId={citaClinicaId} token={token}
            regresar={() => { setVista('agenda-medico'); setCitaClinicaId(null) }}
            actualizada={() => void cargarDatos()} />}
        <footer className="work-footer">VITALIA · Portal institucional · Desarrollo académico. No usar datos clínicos reales hasta completar auditoría, historial y controles de acceso por sede.</footer>
      </main>
    </div>
  )
}

export default App
