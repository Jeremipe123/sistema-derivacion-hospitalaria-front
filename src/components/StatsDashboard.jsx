import { useEffect, useState } from 'react'
import { obtenerEstadisticas } from '../services/stats.services'

export const StatsDashboard = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        obtenerEstadisticas()
            .then(res => setData(res))
            .catch(err => {
                console.error('Error de validación o red:', err)
                setError('Los datos recibidos no cumplen con el formato esperado.')
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div>Cargando estadísticas...</div>
    if (error) return <div className="error">{error}</div>
    if (!data || data.sinRegistros) return <div>No hay registros en el sistema todavía.</div>

    const { resumenGeneral, distribucionTriage, capacidadRed, eficienciaSistema } = data

    return (
        <div className="dashboard">
            <h2>Estadísticas del Sistema Hospitalario</h2>

            <section className="kpi-grid">
                <div className="card">
                    <h3>Pacientes Históricos</h3>
                    <p>{resumenGeneral.totalPacientesHistorico}</p>
                </div>
                <div className="card">
                    <h3>Pacientes de este Mes</h3>
                    <p>{resumenGeneral.totalPacientesEsteMes}</p>
                </div>
                <div className="card">
                    <h3>Tasa de Efectividad</h3>
                    <p>{resumenGeneral.tasaEfectividad}%</p>
                </div>
            </section>

            <section className="section">
                <h3>Distribución de Triage</h3>
                <ul>
                    <li>Rojo (Crítico): {distribucionTriage.rojo}</li>
                    <li>Amarillo (Urgente): {distribucionTriage.amarillo}</li>
                    <li>Verde (Normal): {distribucionTriage.verde}</li>
                </ul>
            </section>

            <section className="section">
                <h3>Capacidad de la Red ({capacidadRed.totalHospitales} Hospitales)</h3>
                <div>
                    <h4>UCI</h4>
                    <p>Libres: {capacidadRed.uci.libres} / {capacidadRed.uci.totales}</p>
                    <p>Ocupación: {capacidadRed.uci.porcentajeOcupacion}%</p>
                </div>
                <div>
                    <h4>Urgencias</h4>
                    <p>Libres: {capacidadRed.urgencias.libres} / {capacidadRed.urgencias.totales}</p>
                    <p>Ocupación: {capacidadRed.urgencias.porcentajeOcupacion}%</p>
                </div>
            </section>

            <section className="section">
                <h3>Eficiencia del Sistema</h3>
                <p>Tiempo Promedio Traslado: {eficienciaSistema.tiempoPromedioTrasladoMin} min</p>
                <p>Distancia Promedio: {eficienciaSistema.distanciaPromediaKm} km</p>
            </section>
        </div>
    )
}