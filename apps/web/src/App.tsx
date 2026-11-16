
import { useState, type FormEvent } from 'react'
import './App.css'

type UsuarioActual = {
  id: string | null
  nombreUsuario: string | null
  roles: string[]
}

type RespuestaLogin = {
  accessToken: string
  tokenType?: string
  expiresIn?: number
  refreshToken?: string
}

function App() {
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null)
  const [, setTokenAcceso] = useState<string | null>(null)

  async function iniciarSesion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const formulario = new FormData(evento.currentTarget)

    const correoElectronico = String(
      formulario.get('correo') ?? ''
    ).trim()

    const contrasena = String(
      formulario.get('contrasena') ?? ''
    )

    setCargando(true)
    setMensaje('')
    setUsuario(null)
    setTokenAcceso(null)

    try {
      // 1. Enviar las credenciales a VITALIA API.
      const respuesta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correoElectronico,
          contrasena,
        }),
      })

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          setMensaje(
            'No fue posible iniciar sesión. Verifica tus credenciales.'
          )
        } else {
          setMensaje(
            'Ocurrió un error al iniciar sesión.'
          )
        }

        return
      }

      // 2. Recibir el token Bearer de ASP.NET Core Identity.
      const autenticacion =
        (await respuesta.json()) as RespuestaLogin

      if (!autenticacion.accessToken) {
        throw new Error('No se recibió un token de acceso.')
      }

      // 3. Verificar la identidad y los roles con la API.
      const respuestaUsuario = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${autenticacion.accessToken}`,
        },
      })

      if (!respuestaUsuario.ok) {
        throw new Error('No se pudo verificar la identidad.')
      }

      const usuarioActual =
        (await respuestaUsuario.json()) as UsuarioActual

      // 4. Registrar temporalmente la sesión en memoria.
      setTokenAcceso(autenticacion.accessToken)
      setUsuario(usuarioActual)
      setMensaje('Autenticación realizada correctamente.')

    } catch {
      setTokenAcceso(null)
      setUsuario(null)

      setMensaje(
        'No se pudo completar la autenticación. Verifica la conexión con VITALIA API.'
      )
    } finally {
      setCargando(false)
    }
  }

  function cerrarVista() {
    setTokenAcceso(null)
    setUsuario(null)
    setMensaje('')
  }

  return (
    <main className="vitalia-layout">
      <section className="vitalia-brand">
        <div className="brand-header">
          <span className="brand-symbol">✚</span>
          <span className="brand-name">VITALIA</span>
        </div>

        <div className="brand-content">
          <p className="brand-subtitle">
            PLATAFORMA INTEGRAL DE SALUD
          </p>

          <h1>
            Una nueva forma de
            <span> cuidar la salud.</span>
          </h1>

          <p className="brand-description">
            Tecnología, atención y confianza
            conectadas en una sola experiencia.
          </p>
        </div>

        <footer className="brand-footer">
          VITALIA · Sistema de Gestión Hospitalaria
        </footer>
      </section>

      <section className="vitalia-access">
        <div className="access-card">
          <p className="access-eyebrow">
            PORTAL INSTITUCIONAL
          </p>

          <h2>Bienvenido a VITALIA</h2>

          {usuario ? (
            <>
              <p className="access-description">
                Identidad verificada por VITALIA API.
              </p>

              <div className="access-placeholder">
                <p>Usuario autenticado</p>

                <strong>
                  {usuario.nombreUsuario ?? 'Usuario'}
                </strong>

                <p>
                  Roles: {usuario.roles.join(', ') || 'Sin rol'}
                </p>
              </div>

              <button
                type="button"
                className="access-button"
                style={{
                  marginTop: '24px',
                  width: '100%',
                }}
                onClick={cerrarVista}
              >
                Volver al inicio
              </button>
            </>
          ) : (
            <>
              <p className="access-description">
                Acceso al sistema de administración
                y gestión hospitalaria.
              </p>

              <form
                className="access-form"
                onSubmit={iniciarSesion}
              >
                <label htmlFor="correo">
                  Correo electrónico
                </label>

                <input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="correo@hospital.com"
                  autoComplete="username"
                  maxLength={256}
                  required
                />

                <label htmlFor="contrasena">
                  Contraseña
                </label>

                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  placeholder="Introduce tu contraseña"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="submit"
                  className="access-button"
                  disabled={cargando}
                >
                  {cargando
                    ? 'Verificando credenciales...'
                    : 'Ingresar a VITALIA'}
                </button>
              </form>
            </>
          )}

          {mensaje && (
            <p className="form-message" role="status">
              {mensaje}
            </p>
          )}

          <p className="access-note">
            Administración · Médicos · Recepción
          </p>
        </div>
      </section>
    </main>
  )
}

export default App
