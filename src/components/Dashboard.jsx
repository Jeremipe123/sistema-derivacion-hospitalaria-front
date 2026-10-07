import { useState } from 'react'
import API from '../services/api'
import {
    Building2,
    BedDouble,
    Stethoscope,
    Truck,
    CheckCircle2,
    Edit2,
    AlertCircle,
    X
} from 'lucide-react'

export function Dashboard({ hospitales = [], traslados = [], onUpdate, darkMode = true }) {
    const [modalOperativo, setModalOperativo] = useState(false)
    const [hospitalEdit, setHospitalEdit] = useState(null)
    const [errores, setErrores] = useState([])

    // Ordenamiento por Semáforo para Hospitales
    const ORDEN_ESTADO = { 'DISPONIBLE': 1, 'SATURADO': 2, 'COLAPSADO': 3, 'INACTIVO': 4 }

    const hospitalesOrdenados = [...hospitales]
        .sort((a, b) => (ORDEN_ESTADO[a.estado_operativo] || 99) - (ORDEN_ESTADO[b.estado_operativo] || 99))
        .slice(0, 6)

    const [formCapacidad, setFormCapacidad] = useState({
        estado_operativo: 'DISPONIBLE',
        camas_uci_totales: 0,
        camas_uci_libres: 0,
        camas_urgencia_totales: 0,
        camas_urgencia_libres: 0
    })

    const getBadgeEstadoHospital = (estado) => {
        switch (estado) {
            case 'DISPONIBLE':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            case 'SATURADO':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            case 'COLAPSADO':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/30'
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
        }
    }

    // Semáforo para el Estado del Paciente / Derivación
    const getBadgeEstadoPaciente = (estado) => {
        switch (estado) {
            case 'ATENDIDO':
            case 'COMPLETADO':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            case 'EN_TRANSITO':
            case 'EN_CAMINO':
            case 'DERIVADO':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            case 'EN_TRIAGE':
            case 'ASIGNADO':
            case 'PENDIENTE':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/30'
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
        }
    }

    const abrirModalEdicionRapida = (h) => {
        setErrores([])
        setHospitalEdit(h)
        setFormCapacidad({
            estado_operativo: h.estado_operativo || 'DISPONIBLE',
            camas_uci_totales: h.camas_uci_totales || 0,
            camas_uci_libres: h.camas_uci_libres || 0,
            camas_urgencia_totales: h.camas_urgencia_totales || 0,
            camas_urgencia_libres: h.camas_urgencia_libres || 0
        })
        setModalOperativo(true)
    }

    const handleUpdateIngreso = async (e) => {
        e.preventDefault()
        setErrores([])

        try {
            await API.put(`/hospitales/${hospitalEdit.id}`, {
                ...hospitalEdit,
                ...formCapacidad
            })
            setModalOperativo(false)
            if (onUpdate) onUpdate()
        } catch (err) {
            setErrores([err.response?.data?.error || 'Error al actualizar el ingreso hospitalario'])
        }
    }

    const marcarAtendido = async (pacienteId) => {
        try {
            await API.patch(`/pacientes/${pacienteId}/estado`, { estado: 'ATENDIDO' })
            if (onUpdate) onUpdate()
        } catch (error) {
            console.error('Error al actualizar estado del paciente:', error)
            alert(error.response?.data?.error || 'No se pudo actualizar el estado del paciente')
        }
    }

    const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
    const textColor = darkMode ? 'text-white' : 'text-slate-900'
    const subTextColor = darkMode ? 'text-slate-400' : 'text-slate-600'
    const tableHeaderBg = darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
    const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            {/* Sección 1: Red Hospitalaria */}
            <section className="space-y-4">
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-200'
                    }`}>
                    <div>
                        <h2 className={`text-lg font-bold flex items-center gap-2 ${textColor}`}>
                            <Building2 className="w-5 h-5 text-blue-500" />
                            Red Hospitalaria Activa
                        </h2>
                        <p className={`text-xs mt-0.5 ${subTextColor}`}>
                            Mostrando los {hospitalesOrdenados.length} centros principales en tiempo real
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {hospitalesOrdenados.map((h) => {
                        const uciOcupadas = (h.camas_uci_totales || 0) - (h.camas_uci_libres || 0)
                        const uciPct = h.camas_uci_totales ? Math.round((uciOcupadas / h.camas_uci_totales) * 100) : 0

                        const urgOcupadas = (h.camas_urgencia_totales || 0) - (h.camas_urgencia_libres || 0)
                        const urgPct = h.camas_urgencia_totales ? Math.round((urgOcupadas / h.camas_urgencia_totales) * 100) : 0

                        return (
                            <div
                                key={h.id}
                                className={`${cardBg} border rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="space-y-1">
                                            <h3 className={`font-bold text-base leading-snug group-hover:text-blue-500 transition-colors ${textColor}`}>
                                                {h.nombre}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span
                                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${getBadgeEstadoHospital(
                                                    h.estado_operativo
                                                )}`}
                                            >
                                                {h.estado_operativo}
                                            </span>
                                            <button
                                                onClick={() => abrirModalEdicionRapida(h)}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                                    }`}
                                                title="Actualizar Capacidad / Ingreso"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Indicadores de Capacidad */}
                                    <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                                        <div className={`p-3 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-800/40 border-slate-700/30' : 'bg-slate-50 border-slate-200'
                                            }`}>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className={`flex items-center gap-1.5 font-medium ${subTextColor}`}>
                                                    <BedDouble className="w-3.5 h-3.5 text-rose-500" /> UCI
                                                </span>
                                                <span className={`font-semibold ${textColor}`}>{uciPct}%</span>
                                            </div>
                                            <div className="w-full bg-slate-300 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full ${uciPct > 85 ? 'bg-rose-500' : uciPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(uciPct, 100)}%` }}
                                                />
                                            </div>
                                            <div className={`text-xs font-bold pt-0.5 ${textColor}`}>
                                                {h.camas_uci_libres}{' '}
                                                <span className={`text-[10px] font-normal ${subTextColor}`}>/ {h.camas_uci_totales} Libres</span>
                                            </div>
                                        </div>

                                        <div className={`p-3 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-800/40 border-slate-700/30' : 'bg-slate-50 border-slate-200'
                                            }`}>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className={`flex items-center gap-1.5 font-medium ${subTextColor}`}>
                                                    <Stethoscope className="w-3.5 h-3.5 text-amber-500" /> Urgencias
                                                </span>
                                                <span className={`font-semibold ${textColor}`}>{urgPct}%</span>
                                            </div>
                                            <div className="w-full bg-slate-300 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full ${urgPct > 85 ? 'bg-rose-500' : urgPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(urgPct, 100)}%` }}
                                                />
                                            </div>
                                            <div className={`text-xs font-bold pt-0.5 ${textColor}`}>
                                                {h.camas_urgencia_libres}{' '}
                                                <span className={`text-[10px] font-normal ${subTextColor}`}>/ {h.camas_urgencia_totales} Libres</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Sección 2: Tabla de Derivaciones y Traslados Procesados */}
            <section className={`${cardBg} border rounded-2xl p-6 shadow-xl space-y-4`}>
                <div className={`flex items-center justify-between pb-2 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-200'
                    }`}>
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${textColor}`}>
                        <Truck className="w-5 h-5 text-amber-500" />
                        Últimas Derivaciones y Traslados Procesados
                    </h2>
                    <span className={`text-xs font-medium ${subTextColor}`}>{traslados.length} registros</span>
                </div>

                <div className="overflow-x-auto">
                    <table className={`w-full text-left text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <thead className={`uppercase text-[11px] font-semibold ${tableHeaderBg}`}>
                            <tr>
                                <th className="p-3.5 rounded-l-xl">Paciente</th>
                                <th className="p-3.5">Gravedad</th>
                                <th className="p-3.5">Hospital Destino</th>
                                <th className="p-3.5">Distancia / Tiempo</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5 text-right rounded-r-xl">Acción</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                            {traslados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={`text-center py-8 font-medium ${subTextColor}`}>
                                        No hay traslados registrados recientemente.
                                    </td>
                                </tr>
                            ) : (
                                traslados.map((t) => {
                                    const estadoActual = t.paciente?.estado || t.estado || 'PENDIENTE'
                                    return (
                                        <tr key={t.id} className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                                            <td className={`p-3.5 font-semibold ${textColor}`}>
                                                {t.paciente?.nombre || 'N/A'}
                                                <span className={`block text-xs font-normal ${subTextColor}`}>
                                                    {t.paciente?.cedula || 'Sin Documento'}
                                                </span>
                                            </td>
                                            <td className="p-3.5">
                                                <span
                                                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${t.paciente?.triage === 'VERDE'
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                                        : t.paciente?.triage === 'ROJO'
                                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                                        }`}
                                                >
                                                    {t.paciente?.triage === 'VERDE' ? 'BAJA' : t.paciente?.triage === 'ROJO' ? 'ALTA' : 'MEDIA'}
                                                </span>
                                            </td>
                                            <td className={`p-3.5 font-medium ${textColor}`}>{t.hospital_destino?.nombre || 'N/A'}</td>
                                            <td className={`p-3.5 text-xs font-mono ${subTextColor}`}>
                                                {t.distancia_km} km ({t.tiempo_estimado_min} min)
                                            </td>
                                            <td className="p-3.5">
                                                <span
                                                    className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getBadgeEstadoPaciente(
                                                        estadoActual
                                                    )}`}
                                                >
                                                    {estadoActual}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-right">
                                                {t.paciente?.id && estadoActual !== 'ATENDIDO' && (
                                                    <button
                                                        onClick={() => marcarAtendido(t.paciente.id)}
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Marcar Atendido
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal Editar Ingreso / Capacidad */}
            {modalOperativo && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className={`${cardBg} border p-6 rounded-2xl max-w-lg w-full space-y-5 shadow-2xl`}>
                        <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            <div>
                                <h3 className={`text-base font-bold ${textColor}`}>Actualizar Capacidad e Ingreso</h3>
                                <p className={`text-xs ${subTextColor}`}>{hospitalEdit?.nombre}</p>
                            </div>
                            <button
                                onClick={() => setModalOperativo(false)}
                                className={`p-1 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {errores.length > 0 && (
                            <div className="bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl text-rose-200 text-xs space-y-1">
                                {errores.map((e, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> {e}
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleUpdateIngreso} className="space-y-4 text-xs">
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Estado Operativo del Centro</label>
                                <select
                                    value={formCapacidad.estado_operativo}
                                    onChange={(e) => setFormCapacidad({ ...formCapacidad, estado_operativo: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                >
                                    <option value="DISPONIBLE">DISPONIBLE (Verde)</option>
                                    <option value="SATURADO">SATURADO (Amarillo)</option>
                                    <option value="COLAPSADO">COLAPSADO (Rojo)</option>
                                    <option value="INACTIVO">INACTIVO</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`block mb-1 font-semibold ${textColor}`}>UCI Totales</label>
                                    <input
                                        type="number"
                                        value={formCapacidad.camas_uci_totales}
                                        onChange={(e) => setFormCapacidad({ ...formCapacidad, camas_uci_totales: parseInt(e.target.value) || 0 })}
                                        className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 font-semibold ${textColor}`}>UCI Libres</label>
                                    <input
                                        type="number"
                                        value={formCapacidad.camas_uci_libres}
                                        onChange={(e) => setFormCapacidad({ ...formCapacidad, camas_uci_libres: parseInt(e.target.value) || 0 })}
                                        className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`block mb-1 font-semibold ${textColor}`}>Urgencias Totales</label>
                                    <input
                                        type="number"
                                        value={formCapacidad.camas_urgencia_totales}
                                        onChange={(e) => setFormCapacidad({ ...formCapacidad, camas_urgencia_totales: parseInt(e.target.value) || 0 })}
                                        className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 font-semibold ${textColor}`}>Urgencias Libres</label>
                                    <input
                                        type="number"
                                        value={formCapacidad.camas_urgencia_libres}
                                        onChange={(e) => setFormCapacidad({ ...formCapacidad, camas_urgencia_libres: parseInt(e.target.value) || 0 })}
                                        className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                    />
                                </div>
                            </div>

                            <div className={`flex justify-end gap-2.5 pt-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                <button
                                    type="button"
                                    onClick={() => setModalOperativo(false)}
                                    className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                        }`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold cursor-pointer shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                                >
                                    Actualizar Capacidad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}