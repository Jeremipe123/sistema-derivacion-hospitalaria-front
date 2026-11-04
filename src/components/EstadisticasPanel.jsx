/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import API from '../services/api'
import { socket } from '../services/socket'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { Award, TrendingUp, Building2, Users, Download } from 'lucide-react'

export function EstadisticasPanel({ hospitales = [], darkMode = true, usuario = null }) {
    const [hospitalSeleccionado, setHospitalSeleccionado] = useState('')
    const [listaHospitales, setListaHospitales] = useState(hospitales)
    const [stats, setStats] = useState(null)
    const [, setCargando] = useState(true)
    const [usuarioFiltro, setUsuarioFiltro] = useState(usuario?.id || '')
    const [usuariosLista, setUsuariosLista] = useState([])

    useEffect(() => {
        if (hospitales && hospitales.length > 0) setListaHospitales(hospitales)
        API.get('/auth/usuarios').then(res => setUsuariosLista(res.data)).catch(() => { })
    }, [hospitales])

    const cargarEstadisticas = useCallback(() => {
        setCargando(true)
        const params = {}
        if (hospitalSeleccionado) params.hospitalId = hospitalSeleccionado
        if (usuarioFiltro && ['admin', 'coordinador'].includes(usuario?.rol)) params.usuarioId = usuarioFiltro

        API.get('/estadisticas', { params })
            .then((res) => setStats(res.data))
            .catch((err) => console.error('Error al cargar estadísticas:', err))
            .finally(() => setCargando(false))
    }, [hospitalSeleccionado, usuarioFiltro, usuario])

    useEffect(() => {
        cargarEstadisticas()
        socket?.on('actualizacion_paciente', cargarEstadisticas)
        socket?.on('nueva_derivacion', cargarEstadisticas)
        return () => {
            socket?.off('actualizacion_paciente', cargarEstadisticas)
            socket?.off('nueva_derivacion', cargarEstadisticas)
        }
    }, [cargarEstadisticas])

    const exportarPDF = () => window.print()

    const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-xl'
    const textColor = darkMode ? 'text-white' : 'text-slate-900'
    const subTextColor = darkMode ? 'text-slate-400' : 'text-slate-600'
    const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'

    const datosTendencia = stats?.tendenciaAnual || [
        { mes: 'Ene', pacientes: 10 }, { mes: 'Feb', pacientes: 15 }, { mes: 'Mar', pacientes: 22 },
        { mes: 'Abr', pacientes: 30 }, { mes: 'May', pacientes: 25 }, { mes: 'Jun', pacientes: 40 },
        { mes: 'Jul', pacientes: 35 }, { mes: 'Ago', pacientes: 48 }, { mes: 'Sep', pacientes: 52 },
        { mes: 'Oct', pacientes: 45 }, { mes: 'Nov', pacientes: 58 }, { mes: 'Dic', pacientes: 62 }
    ]

    const logroPersonal = stats?.logroPersonal || { asignados: 12, atendidos: 10, tasaExito: 83 }

    const dataTriage = [
        { name: 'Alta (Crítico)', valor: stats?.distribucionTriage?.rojo || 0, color: '#f43f5e' },
        { name: 'Media (Urgente)', valor: stats?.distribucionTriage?.amarillo || 0, color: '#f59e0b' },
        { name: 'Baja (Leve)', valor: stats?.distribucionTriage?.verde || 0, color: '#10b981' },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                <div>
                    <h2 className={`text-xl font-extrabold flex items-center gap-2 ${textColor}`}>
                        <TrendingUp className="w-5 h-5 text-indigo-500" /> Métricas
                    </h2>
                    <p className={`text-xs mt-0.5 ${subTextColor}`}>Evolución de pacientes ingresados por mes y distribución de severidad</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {usuario && ['admin', 'coordinador'].includes(usuario.rol) && (
                        <div className="flex items-center gap-1.5">
                            <Users className={`w-4 h-4 ${subTextColor}`} />
                            <select
                                value={usuarioFiltro}
                                onChange={(e) => setUsuarioFiltro(e.target.value)}
                                className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:border-indigo-500 cursor-pointer ${inputBg}`}
                            >
                                <option value="">Todos los Operadores</option>
                                {usuariosLista.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.rol})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <Building2 className={`w-4 h-4 ${subTextColor}`} />
                        <select
                            value={hospitalSeleccionado}
                            onChange={(e) => setHospitalSeleccionado(e.target.value)}
                            className={`text-xs font-semibold px-3 py-2 rounded-xl border focus:outline-none focus:border-indigo-500 cursor-pointer ${inputBg}`}
                        >
                            <option value="">Todos los Hospitales</option>
                            {listaHospitales.map((h) => (
                                <option key={h.id} value={h.id}>{h.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={exportarPDF}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Exportar PDF
                    </button>
                </div>
            </div>

            {/* Tarjeta de Logro Personal */}
            <div className={`${cardBg} border p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6`}>
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                        <Award className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className={`text-base font-bold ${textColor}`}>Logro Personal de Operador</h3>
                        <p className={`text-xs ${subTextColor}`}>Cantidad de triajes asignados y pacientes atendidos</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto">
                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <p className={`text-[11px] ${subTextColor}`}>Asignados</p>
                        <p className={`text-lg font-extrabold font-mono ${textColor}`}>{logroPersonal.asignados}</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <p className={`text-[11px] ${subTextColor}`}>Atendidos</p>
                        <p className="text-lg font-extrabold text-emerald-500 font-mono">{logroPersonal.atendidos}</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <p className={`text-[11px] ${subTextColor}`}>Efectividad</p>
                        <p className="text-lg font-extrabold text-indigo-400 font-mono">{logroPersonal.tasaExito}%</p>
                    </div>
                </div>
            </div>

            {/* Gráfico de Líneas Anual */}
            <div className={`${cardBg} border p-6 rounded-2xl shadow-xl space-y-4`}>
                <h3 className={`text-base font-bold ${textColor}`}>Evolución Anual de Pacientes Registrados</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={datosTendencia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} opacity={0.5} />
                            <XAxis dataKey="mes" stroke={darkMode ? '#94a3b8' : '#64748b'} tickLine={false} fontSize={12} />
                            <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} tickLine={false} fontSize={12} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderRadius: '0.75rem', color: darkMode ? '#ffffff' : '#0f172a' }} />
                            <Line type="monotone" dataKey="pacientes" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico de Barras Original Restaurado al final */}
            <div className={`${cardBg} border p-6 rounded-2xl shadow-xl space-y-4`}>
                <h3 className={`text-base font-bold ${textColor}`}>Distribución de Pacientes por Severidad (Triaje)</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dataTriage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} opacity={0.5} />
                            <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} tickLine={false} fontSize={12} />
                            <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} tickLine={false} fontSize={12} allowDecimals={false} domain={[0, 'auto']} />
                            <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderRadius: '0.75rem', color: darkMode ? '#ffffff' : '#0f172a' }} />
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