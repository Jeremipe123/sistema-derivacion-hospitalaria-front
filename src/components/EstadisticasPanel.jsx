/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import API from '../services/api'
import { socket } from '../services/socket'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Activity, Clock, ShieldAlert, CheckCircle, Inbox, UserCheck, TrendingUp, Building2 } from 'lucide-react'

export function EstadisticasPanel({ hospitales = [], darkMode = true }) {
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState('')
    const [listaHospitales, setListaHospitales] = useState(hospitales)
    const [stats, setStats] = useState(null)
    const [cargando, setCargando] = useState(true)

    // Cargar la lista de hospitales si no vino por props
    useEffect(() => {
        if (hospitales && hospitales.length > 0) {
            setListaHospitales(hospitales)
        } else {
            API.get('/hospitales')
                .then((res) => setListaHospitales(res.data))
                .catch((err) => console.error('Error al cargar lista de hospitales:', err))
        }
    }, [hospitales])

    // Cargar estadísticas filtrando opcionalmente por hospitalSeleccionado
    const cargarEstadisticas = useCallback(() => {
        setCargando(true)
        const params = hospitalSeleccionado ? { hospitalId: hospitalSeleccionado } : {}

        API.get('/estadisticas', { params })
            .then((res) => setStats(res.data))
            .catch((err) => console.error('Error al cargar estadísticas:', err))
            .finally(() => setCargando(false))
    }, [hospitalSeleccionado])

    useEffect(() => {
        cargarEstadisticas()

        socket?.on('actualizacion_paciente', cargarEstadisticas)
        socket?.on('nueva_derivacion', cargarEstadisticas)

        return () => {
            socket?.off('actualizacion_paciente', cargarEstadisticas)
            socket?.off('nueva_derivacion', cargarEstadisticas)
        }
    }, [cargarEstadisticas])

    // Estilos dinámicos para modo claro / oscuro
    const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-xl'
    const textColor = darkMode ? 'text-white' : 'text-slate-900'
    const subTextColor = darkMode ? 'text-slate-400' : 'text-slate-600'
    const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'

    const dataTriage = [
        { name: 'Alta (Crítico)', valor: stats?.distribucionTriage?.rojo || 0, color: '#f43f5e' },
        { name: 'Media (Urgente)', valor: stats?.distribucionTriage?.amarillo || 0, color: '#f59e0b' },
        { name: 'Baja (Leve)', valor: stats?.distribucionTriage?.verde || 0, color: '#10b981' },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* Header con Selector de Hospitales */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                <div>
                    <h2 className={`text-xl font-extrabold flex items-center gap-2 ${textColor}`}>
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Métricas de Efectividad de la Red
                    </h2>
                    <p className={`text-xs mt-0.5 ${subTextColor}`}>
                        {hospitalSeleccionado
                            ? 'Métricas filtradas para el centro seleccionado'
                            : 'Consolidado general de todos los hospitales del sistema'}
                    </p>
                </div>

                {/* Dropdown de Filtro */}
                <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${subTextColor}`} />
                    <select
                        value={hospitalSeleccionado}
                        onChange={(e) => setHospitalSeleccionado(e.target.value)}
                        className={`text-xs font-semibold px-3.5 py-2 rounded-xl border focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors ${inputBg}`}
                    >
                        <option value="">Todos los Hospitales (General del Sistema)</option>
                        {listaHospitales.map((h) => (
                            <option key={h.id} value={h.id}>
                                {h.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {cargando ? (
                <div className={`max-w-7xl mx-auto p-12 text-center flex items-center justify-center gap-2 ${subTextColor}`}>
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Actualizando métricas...</span>
                </div>
            ) : !stats || stats.sinRegistros ? (
                <div className={`max-w-md mx-auto my-12 p-8 border rounded-2xl text-center space-y-3 ${cardBg}`}>
                    <Inbox className="w-12 h-12 text-slate-400 mx-auto" />
                    <h3 className={`text-lg font-bold ${textColor}`}>Aún no existen registros</h3>
                    <p className={`text-xs ${subTextColor}`}>
                        No se han registrado triajes o atenciones en el filtro seleccionado.
                    </p>
                </div>
            ) : (
                <>
                    {/* Tarjetas KPI */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className={`${cardBg} border p-5 rounded-2xl shadow-lg space-y-2`}>
                            <p className={`text-xs font-semibold flex items-center gap-1.5 ${subTextColor}`}>
                                <Activity className="w-4 h-4 text-blue-500" /> Pacientes del Mes
                            </p>
                            <p className={`text-3xl font-extrabold font-mono ${textColor}`}>
                                {stats.resumenGeneral?.totalPacientesEsteMes || 0}
                            </p>
                        </div>

                        <div className={`${cardBg} border p-5 rounded-2xl shadow-lg space-y-2`}>
                            <p className={`text-xs font-semibold flex items-center gap-1.5 ${subTextColor}`}>
                                <UserCheck className="w-4 h-4 text-emerald-500" /> Atendidos
                            </p>
                            <p className="text-3xl font-extrabold text-emerald-500 font-mono">
                                {stats.estadosPacientes?.atendidos || 0}
                            </p>
                        </div>

                        <div className={`${cardBg} border p-5 rounded-2xl shadow-lg space-y-2`}>
                            <p className={`text-xs font-semibold flex items-center gap-1.5 ${subTextColor}`}>
                                <Clock className="w-4 h-4 text-amber-500" /> Tiempo Traslado
                            </p>
                            <p className={`text-3xl font-extrabold font-mono ${textColor}`}>
                                {stats.eficienciaSistema?.tiempoPromedioTrasladoMin || 0}{' '}
                                <span className={`text-xs font-normal ${subTextColor}`}>min</span>
                            </p>
                        </div>

                        <div className={`${cardBg} border p-5 rounded-2xl shadow-lg space-y-2`}>
                            <p className={`text-xs font-semibold flex items-center gap-1.5 ${subTextColor}`}>
                                <ShieldAlert className="w-4 h-4 text-rose-500" /> Ocupación UCI
                            </p>
                            <p className="text-3xl font-extrabold text-rose-500 font-mono">
                                {stats.capacidadRed?.uci?.porcentajeOcupacion || 0}%
                            </p>
                        </div>

                        <div className={`${cardBg} border p-5 rounded-2xl shadow-lg space-y-2`}>
                            <p className={`text-xs font-semibold flex items-center gap-1.5 ${subTextColor}`}>
                                <CheckCircle className="w-4 h-4 text-emerald-500" /> Efectividad
                            </p>
                            <p className="text-3xl font-extrabold text-emerald-500 font-mono">
                                {stats.resumenGeneral?.tasaEfectividad || 0}%
                            </p>
                        </div>
                    </div>

                    {/* Gráfico de Barras con Escala Entera */}
                    <div className={`${cardBg} border p-6 rounded-2xl shadow-xl space-y-4`}>
                        <h3 className={`text-base font-bold ${textColor}`}>
                            Distribución de Pacientes por Severidad
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataTriage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} opacity={0.5} />
                                    <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} tickLine={false} fontSize={12} />
                                    <YAxis
                                        stroke={darkMode ? '#94a3b8' : '#64748b'}
                                        tickLine={false}
                                        fontSize={12}
                                        allowDecimals={false}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                            borderColor: darkMode ? '#334155' : '#cbd5e1',
                                            borderRadius: '0.75rem',
                                            color: darkMode ? '#ffffff' : '#0f172a',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />
                                    <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                                        {dataTriage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}   