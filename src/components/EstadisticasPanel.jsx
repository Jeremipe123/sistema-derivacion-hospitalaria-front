import { useEffect, useState, useCallback } from 'react'
import API from '../services/api'
import { socket } from '../services/socket'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Activity, Clock, ShieldAlert, CheckCircle, Inbox, UserCheck, TrendingUp } from 'lucide-react'

export function EstadisticasPanel() {
    const [stats, setStats] = useState(null)
    const [cargando, setCargando] = useState(true)

    const cargarEstadisticas = useCallback(() => {
        API.get('/estadisticas')
            .then((res) => setStats(res.data))
            .catch((err) => console.error('Error al cargar estadísticas:', err))
            .finally(() => setCargando(false))
    }, [])

    useEffect(() => {
        cargarEstadisticas()

        socket?.on('actualizacion_paciente', cargarEstadisticas)
        socket?.on('nueva_derivacion', cargarEstadisticas)

        return () => {
            socket?.off('actualizacion_paciente', cargarEstadisticas)
            socket?.off('nueva_derivacion', cargarEstadisticas)
        }
    }, [cargarEstadisticas])

    if (cargando) {
        return (
            <div className="max-w-7xl mx-auto p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Cargando métricas de la red...</span>
            </div>
        )
    }

    if (!stats || stats.sinRegistros) {
        return (
            <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 shadow-xl">
                <Inbox className="w-12 h-12 text-slate-500 mx-auto" />
                <h3 className="text-lg font-bold text-white">Aún no existen registros</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                    Registra hospitales y realiza triajes para generar métricas estadísticas en tiempo real.
                </p>
            </div>
        )
    }

    const dataTriage = [
        { name: 'Triaje Rojo', valor: stats.distribucionTriage?.rojo || 0, color: '#f43f5e' },
        { name: 'Triaje Amarillo', valor: stats.distribucionTriage?.amarillo || 0, color: '#f59e0b' },
        { name: 'Triaje Verde', valor: stats.distribucionTriage?.verde || 0, color: '#10b981' },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        Métricas de Efectividad de la Red
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Indicadores de rendimiento operacional y distribución de carga</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-lg space-y-2">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-blue-400" /> Pacientes del Mes
                    </p>
                    <p className="text-3xl font-extrabold text-white font-mono">
                        {stats.resumenGeneral?.totalPacientesEsteMes || 0}
                    </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-lg space-y-2">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-400" /> Atendidos
                    </p>
                    <p className="text-3xl font-extrabold text-emerald-400 font-mono">
                        {stats.estadosPacientes?.atendidos || 0}
                    </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-lg space-y-2">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" /> Tiempo Traslado
                    </p>
                    <p className="text-3xl font-extrabold text-white font-mono">
                        {stats.eficienciaSistema?.tiempoPromedioTrasladoMin || 0}{' '}
                        <span className="text-xs font-normal text-slate-400">min</span>
                    </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-lg space-y-2">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-400" /> Ocupación UCI
                    </p>
                    <p className="text-3xl font-extrabold text-rose-400 font-mono">
                        {stats.capacidadRed?.uci?.porcentajeOcupacion || 0}%
                    </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-lg space-y-2">
                    <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> Efectividad
                    </p>
                    <p className="text-3xl font-extrabold text-emerald-400 font-mono">
                        {stats.resumenGeneral?.tasaEfectividad || 0}%
                    </p>
                </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white">Distribución por Severidad de Triaje</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataTriage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} fontSize={12} />
                            <YAxis stroke="#94a3b8" tickLine={false} fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#334155',
                                    borderRadius: '0.75rem',
                                    color: '#fff',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
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
        </div>
    )
}