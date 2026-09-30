/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import API from './services/api'
import { socket } from './services/socket'
import { Navbar } from './components/Navbar'
import { Dashboard } from './components/Dashboard'
import { FormularioTriage } from './components/FormularioTriage'
import { EstadisticasPanel } from './components/EstadisticasPanel'

export default function App() {
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [conectado, setConectado] = useState(false)
  const [hospitales, setHospitales] = useState([])
  const [traslados, setTraslados] = useState([])

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar vistaActual={vistaActual} setVistaActual={setVistaActual} conectado={conectado} />

      <main className="flex-1 pb-12">
        {vistaActual === 'dashboard' && (
          <Dashboard hospitales={hospitales} traslados={traslados} onUpdate={cargarDatos} />
        )}
        {vistaActual === 'triage' && (
          <FormularioTriage
            onDerivacionExitosa={() => {
              cargarDatos()
            }}
          />
        )}
        {vistaActual === 'estadisticas' && <EstadisticasPanel />}
      </main>
    </div>
  )
}