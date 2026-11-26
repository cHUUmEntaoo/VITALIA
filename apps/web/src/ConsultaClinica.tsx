import { useEffect, useState, type FormEvent } from 'react'

type DatosNota = {
  motivoConsulta: string
  antecedentes: string
  hallazgos: string
  diagnostico: string
  plan: string
  indicaciones: string
  firmadaUtc: string | null
}
type CitaClinica = {
  id: number
  pacienteId: string
  paciente: string
  fecha: string
  hora: string
  estado: string
  hospital: string
  especialidad: string
}
type DetalleClinico = { cita: CitaClinica; nota: DatosNota }
type Historial = { citaId: number; fecha: string; diagnostico: string; plan: string; motivoConsulta: string; firmadaUtc: string }[]
const vacio: DatosNota = {
  motivoConsulta: '', antecedentes: '', hallazgos: '', diagnostico: '', plan: '', indicaciones: '', firmadaUtc: null,
}

async function api<T>(ruta: string, token: string, metodo = 'GET', cuerpo?: unknown): Promise<T> {
  const respuesta = await fetch(`/api/clinica/${ruta}`, {
    method: metodo,
    headers: {
      Accept: 'application/json', Authorization: `Bearer ${token}`,
      ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(cuerpo === undefined ? {} : { body: JSON.stringify(cuerpo) }),
  })
  if (!respuesta.ok) {
    let mensaje = `HTTP ${respuesta.status}`
    try { const datos = await respuesta.json() as { mensaje?: string; title?: string }; mensaje = datos.mensaje || datos.title || mensaje }
    catch { /* Respuesta no JSON */ }
    throw new Error(mensaje)
  }
  return respuesta.json() as Promise<T>
}

export default function ConsultaClinica({ citaId, token, regresar, actualizada }: {
  citaId: number
  token: string
  regresar: () => void
  actualizada: () => void
}) {
  const [detalle, setDetalle] = useState<DetalleClinico | null>(null)
  const [nota, setNota] = useState<DatosNota>(vacio)
  const [historial, setHistorial] = useState<Historial>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let activo = true
    setCargando(true); setError(''); setAviso(''); setDetalle(null); setNota(vacio); setHistorial([])
    api<DetalleClinico>(`citas/${citaId}/nota`, token)
      .then(async d => {
        if (!activo) return
        setDetalle(d); setNota(d.nota)
        // Puede no existir historial si el medico aun no ha atendido al paciente.
        try {
          const registros = await api<Historial>(`pacientes/${encodeURIComponent(d.cita.pacienteId)}/historial`, token)
          if (activo) setHistorial(registros)
        } catch { if (activo) setHistorial([]) }
      })
      .catch(e => { if (activo) setError(e instanceof Error ? e.message : 'No se pudo abrir la consulta.') })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [citaId, token])

  const bloqueada = detalle?.cita.estado !== 'Programada' || Boolean(nota.firmadaUtc)
  const cambiar = (campo: keyof Omit<DatosNota, 'firmadaUtc'>, valor: string) => setNota(n => ({ ...n, [campo]: valor }))

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setError(''); setAviso(''); setGuardando(true)
    try {
      const respuesta = await api<{ nota: DatosNota }>(`citas/${citaId}/nota`, token, 'PUT', nota)
      setNota(respuesta.nota); setAviso('Borrador clínico guardado en el servidor.')
    } catch (e) { setError(e instanceof Error ? e.message : 'Error al guardar la nota.') }
    finally { setGuardando(false) }
  }

  async function finalizar() {
    if (!window.confirm('¿Finalizar y firmar esta consulta? La nota quedará bloqueada para edición.')) return
    setError(''); setAviso(''); setGuardando(true)
    try {
      // Guardar la version actualmente visible antes de firmar.
      await api(`citas/${citaId}/nota`, token, 'PUT', nota)
      await api(`citas/${citaId}/finalizar`, token, 'POST')
      setNota(n => ({ ...n, firmadaUtc: new Date().toISOString() }))
      setDetalle(d => d ? { ...d, cita: { ...d.cita, estado: 'Atendida' } } : d)
      setAviso('Consulta finalizada y cita marcada como atendida.')
      actualizada()
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo finalizar la consulta.') }
    finally { setGuardando(false) }
  }

  return <section className="panel">
    <div className="panel-title"><div><h3>Consulta médica #{citaId}</h3><p className="muted">Uso académico · Solo datos ficticios · Acceso médico auditado</p></div><button className="outline-button" onClick={regresar}>← Volver a mi agenda</button></div>
    {cargando && <p className="muted">Cargando información clínica…</p>}
    {error && <p className="form-message error" role="alert">{error}</p>}
    {aviso && <p className="form-message" role="status">{aviso}</p>}
    {detalle && <>
      <div className="info-line"><div className="mini-icon">✚</div><div><strong>{detalle.cita.paciente}</strong><small>{detalle.cita.hospital} · {detalle.cita.especialidad} · {detalle.cita.fecha} {detalle.cita.hora.slice(0,5)}</small></div><span className="pill">{detalle.cita.estado}</span></div>
      <form className="form-grid" onSubmit={guardar}>
        {([
          ['motivoConsulta', 'Motivo de consulta', 2000],
          ['antecedentes', 'Antecedentes relevantes', 4000],
          ['hallazgos', 'Exploración y hallazgos', 4000],
          ['diagnostico', 'Diagnóstico / impresión clínica', 2000],
          ['plan', 'Plan de tratamiento / seguimiento', 4000],
          ['indicaciones', 'Indicaciones adicionales', 4000],
        ] as const).map(([campo, titulo, maximo]) =>
          <label key={campo}>{titulo}
            <textarea rows={campo === 'motivoConsulta' ? 2 : 4} maxLength={maximo} disabled={bloqueada || guardando}
              value={nota[campo]} onChange={e => cambiar(campo, e.target.value)}
              placeholder={`Escribir ${titulo.toLowerCase()} (datos ficticios)`}
              required={campo === 'motivoConsulta'} />
          </label>)}
        <div className="actions"><button type="submit" className="primary-button" disabled={bloqueada || guardando}>Guardar borrador</button>
        <button type="button" className="outline-button" disabled={bloqueada || guardando || !nota.motivoConsulta.trim() || !nota.diagnostico.trim() || !nota.plan.trim()}
          onClick={() => void finalizar()}>Guardar y firmar consulta</button></div>
      </form>
      <div className="panel-title" style={{ marginTop: 30 }}><h3>Historial atendido por este médico</h3><small>Últimos 8 años · Notas firmadas</small></div>
      {historial.length === 0 ? <p className="empty">Sin notas clínicas firmadas por este médico en el periodo permitido.</p> :
        <div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Motivo</th><th>Diagnóstico</th><th>Plan</th></tr></thead>
          <tbody>{historial.map(h => <tr key={h.citaId}><td>{h.fecha}</td><td>{h.motivoConsulta}</td><td>{h.diagnostico}</td><td>{h.plan}</td></tr>)}</tbody></table></div>}
    </>}
  </section>
}
