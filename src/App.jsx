import { useState, useEffect } from 'react'
import API from './services/api'
import { socket } from './services/socket'
import { Navbar } from './components/Navbar'
import { Dashboard } from './components/Dashboard'
import { FormularioTriage } from './components/FormularioTriage'
import { GestionHospitales } from './components/GestionHospitales'
import { EstadisticasPanel } from './components/EstadisticasPanel'

export default function App() {
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [conectado, setConectado] = useState(false)
  const [hospitales, setHospitales] = useState([])
  const [traslados, setTraslados] = useState([])

  // Estado del tema persistente en localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const temaGuardado = localStorage.getItem('theme')
    return temaGuardado ? temaGuardado === 'dark' : true
  })

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const cargarDatos = async () => {
    try {
      const [resHosp, resTras] = await Promise.all([
        API.get('/hospitales'),
        API.get('/triage/traslados'),
      ])
      setHospitales(resHosp.data)
      setTraslados(resTras.data)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    }
  }

  useEffect(() => {
    cargarDatos()
    socket.on('connect', () => setConectado(true))
    socket.on('disconnect', () => setConectado(false))

    socket.on('actualizacion_hospital', (hospitalActualizado) => {
      setHospitales((prev) =>
        prev.map((h) => (h.id === hospitalActualizado.id ? hospitalActualizado : h))
      )
    })

    socket.on('nueva_derivacion', () => {
      cargarDatos()
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('actualizacion_hospital')
      socket.off('nueva_derivacion')
    }
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}>
      <Navbar
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        conectado={conectado}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="flex-1 pb-12">
        {vistaActual === 'dashboard' && (
          <Dashboard
            hospitales={hospitales}
            traslados={traslados}
            onUpdate={cargarDatos}
            darkMode={darkMode}
          />
        )}
        {vistaActual === 'triage' && (
          <FormularioTriage
            onDerivacionExitosa={cargarDatos}
            darkMode={darkMode}
          />
        )}
        {vistaActual === 'gestion_hospitales' && (
          <GestionHospitales
            hospitales={hospitales}
            onUpdate={cargarDatos}
            darkMode={darkMode}
          />
        )}
        {vistaActual === 'estadisticas' && (
          <EstadisticasPanel darkMode={darkMode} />
        )}
      </main>
    </div>
  )
}