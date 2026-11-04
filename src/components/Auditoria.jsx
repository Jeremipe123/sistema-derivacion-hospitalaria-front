import { useEffect, useState } from 'react'
import API from '../services/api'
import { ShieldCheck, HardDrive, Globe } from 'lucide-react'

export function ModuloAuditoria({ darkMode }) {
    const [logs, setLogs] = useState([])
    const [statsConexiones, setStatsConexiones] = useState(null)

    useEffect(() => {
        Promise.all([
            API.get('/logs'),
            API.get('/logs/estadisticas')
        ]).then(([resLogs, resStats]) => {
            setLogs(resLogs.data)
            setStatsConexiones(resStats.data)
        }).catch(err => console.error(err))
    }, [])

    const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-xl'
    const textColor = darkMode ? 'text-white' : 'text-slate-900'
    const subTextColor = darkMode ? 'text-slate-400' : 'text-slate-600'
    const tableHeaderBg = darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className={`flex items-center justify-between pb-2 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                <div>
                    <h2 className={`text-xl font-extrabold flex items-center gap-2 ${textColor}`}>
                        <ShieldCheck className="w-5 h-5 text-purple-500" />
                        Gestión de Auditoría
                    </h2>
                    <p className={`text-xs mt-0.5 ${subTextColor}`}>Monitoreo completo de peticiones, tiempos de respuesta y geolocalización</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`${cardBg} border p-4 rounded-2xl shadow-md flex items-center gap-3`}>
                    <HardDrive className="w-8 h-8 text-indigo-500 shrink-0" />
                    <div>
                        <p className={`text-xs ${subTextColor}`}>Total de Peticiones Registradas</p>
                        <p className={`text-xl font-extrabold font-mono ${textColor}`}>{statsConexiones?.totalConexiones || 0}</p>
                    </div>
                </div>
                <div className={`${cardBg} border p-4 rounded-2xl shadow-md flex items-center gap-3`}>
                    <Globe className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div>
                        <p className={`text-xs ${subTextColor}`}>IPs Únicas Registradas</p>
                        <p className={`text-xl font-extrabold font-mono ${textColor}`}>{statsConexiones?.ipsUnicas || 0}</p>
                    </div>
                </div>
            </div>

            <div className={`${cardBg} border rounded-2xl overflow-hidden shadow-xl`}>
                <div className="overflow-x-auto">
                    <table className={`w-full text-left text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <thead className={`uppercase text-[11px] font-semibold ${tableHeaderBg}`}>
                            <tr>
                                <th className="p-3.5">Fecha / Hora</th>
                                <th className="p-3.5">Método / Endpoint</th>
                                <th className="p-3.5">Status HTTP</th>
                                <th className="p-3.5">IP / Ubicación</th>
                                <th className="p-3.5">Tiempo Resp.</th>
                                <th className="p-3.5">Agente</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={`text-center py-8 font-medium ${subTextColor}`}>
                                        No hay registros de auditoría disponibles.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                                        <td className="p-3.5 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className="p-3.5">
                                            <span className="font-bold text-indigo-400 mr-1.5">{log.metodo}</span>
                                            <span className={`font-mono ${textColor}`}>{log.endpoint}</span>
                                        </td>
                                        <td className="p-3.5 font-mono">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.estado_http === 200 || log.estado_http === 201 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {log.estado_http}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <span className="font-mono text-xs block">{log.ip}</span>
                                            <span className={`text-[10px] ${subTextColor}`}>{log.ubicacion}</span>
                                        </td>
                                        <td className="p-3.5 font-mono text-amber-400">{log.tiempo_respuesta_ms} ms</td>
                                        <td className={`p-3.5 text-[10px] truncate max-w-xs ${subTextColor}`}>{log.user_agent}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}