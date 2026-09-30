import { useState } from 'react'
import API from '../services/api'
import { hospitalSchema } from '../schemas/hospital.schemas'
import {
    Building2,
    BedDouble,
    Stethoscope,
    Truck,
    CheckCircle2,
    Plus,
    Edit2,
    AlertCircle,
    X
} from 'lucide-react'

export function Dashboard({ hospitales = [], traslados = [], onUpdate }) {
    const [modal, setModal] = useState(false)
    const [editId, setEditId] = useState(null)
    const [errores, setErrores] = useState([])

    const formInicial = {
        nombre: '',
        nivel: 'Nivel III',
        direccion: '',
        latitud: 10.2469,
        longitud: -67.5958,
        camas_uci_totales: 10,
        camas_uci_libres: 5,
        camas_urgencia_totales: 30,
        camas_urgencia_libres: 10,
        estado_operativo: 'DISPONIBLE'
    }

    const [form, setForm] = useState(formInicial)

    const getBadgeEstado = (estado) => {
        switch (estado) {
            case 'DISPONIBLE':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            case 'SATURADO':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            case 'COLAPSADO':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
        }
    }

    const abrirModal = (h = null) => {
        setErrores([])
        if (h) {
            setEditId(h.id)
            setForm(h)
        } else {
            setEditId(null)
            setForm(formInicial)
        }
        setModal(true)
    }

    const handleSubmitHospital = async (e) => {
        e.preventDefault()
        setErrores([])

        const resultado = hospitalSchema ? hospitalSchema.safeParse(form) : { success: true, data: form }

        if (!resultado.success) {
            const listaErrores = resultado.error.errors.map((err) => err.message)
            setErrores(listaErrores)
            return
        }

        try {
            if (editId) {
                await API.put(`/hospitales/${editId}`, resultado.data)
            } else {
                await API.post('/hospitales', resultado.data)
            }
            setModal(false)
            if (onUpdate) onUpdate()
        } catch (err) {
            setErrores([err.response?.data?.error || 'Error al guardar el hospital en el servidor'])
        }
    }

    const marcarAtendido = async (pacienteId) => {
        try {
            await API.patch(`/pacientes/${pacienteId}/estado`, { estado: 'ATENDIDO' })
            if (onUpdate) onUpdate()
        } catch (error) {
            console.error('Error al actualizar estado del paciente:', error)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            {/* Sección 1: Red Hospitalaria */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-400" />
                            Red Hospitalaria Activa
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {hospitales.length} centros monitoreados en tiempo real
                        </p>
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="self-start sm:self-auto inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Agregar Hospital
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {hospitales.map((h) => {
                        const uciOcupadas = (h.camas_uci_totales || 0) - (h.camas_uci_libres || 0)
                        const uciPct = h.camas_uci_totales ? Math.round((uciOcupadas / h.camas_uci_totales) * 100) : 0

                        const urgOcupadas = (h.camas_urgencia_totales || 0) - (h.camas_urgencia_libres || 0)
                        const urgPct = h.camas_urgencia_totales ? Math.round((urgOcupadas / h.camas_urgencia_totales) * 100) : 0

                        return (
                            <div
                                key={h.id}
                                className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors">
                                                {h.nombre}
                                            </h3>
                                            <span className="inline-block text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                                                {h.nivel}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span
                                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase ${getBadgeEstado(
                                                    h.estado_operativo
                                                )}`}
                                            >
                                                {h.estado_operativo}
                                            </span>
                                            <button
                                                onClick={() => abrirModal(h)}
                                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                                                title="Editar Hospital"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Indicadores de Capacidad */}
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
                                        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <BedDouble className="w-3.5 h-3.5 text-rose-400" /> UCI
                                                </span>
                                                <span className="font-semibold text-slate-300">{uciPct}%</span>
                                            </div>
                                            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full ${uciPct > 85 ? 'bg-rose-500' : uciPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min(uciPct, 100)}%` }}
                                                />
                                            </div>
                                            <div className="text-xs font-bold text-white pt-0.5">
                                                {h.camas_uci_libres}{' '}
                                                <span className="text-[10px] font-normal text-slate-400">/ {h.camas_uci_totales} libres</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 space-y-2">
                                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <Stethoscope className="w-3.5 h-3.5 text-amber-400" /> Urgencias
                                                </span>
                                                <span className="font-semibold text-slate-300">{urgPct}%</span>
                                            </div>
                                            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-1.5 rounded-full ${urgPct > 85 ? 'bg-rose-500' : urgPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min(urgPct, 100)}%` }}
                                                />
                                            </div>
                                            <div className="text-xs font-bold text-white pt-0.5">
                                                {h.camas_urgencia_libres}{' '}
                                                <span className="text-[10px] font-normal text-slate-400">
                                                    / {h.camas_urgencia_totales} libres
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Sección 2: Tabla de Derivaciones */}
            <section className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Truck className="w-5 h-5 text-amber-400" />
                        Últimas Derivaciones y Traslados Procesados
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">{traslados.length} registros</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                        <thead className="bg-slate-800/50 uppercase text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3.5 rounded-l-xl">Paciente</th>
                                <th className="p-3.5">Triaje</th>
                                <th className="p-3.5">Hospital Destino</th>
                                <th className="p-3.5">Distancia / Tiempo</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5 text-right rounded-r-xl">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {traslados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                                        No hay traslados registrados recientemente.
                                    </td>
                                </tr>
                            ) : (
                                traslados.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-3.5 font-semibold text-white">
                                            {t.paciente?.nombre || 'N/A'}
                                            <span className="block text-xs font-normal text-slate-400">
                                                {t.paciente?.cedula || 'Sin Documento'}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <span
                                                className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${t.paciente?.triage === 'VERDE'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                        : t.paciente?.triage === 'ROJO'
                                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                    }`}
                                            >
                                                {t.paciente?.triage || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-medium text-slate-200">{t.hospital_destino?.nombre || 'N/A'}</td>
                                        <td className="p-3.5 text-xs text-slate-400 font-mono">
                                            {t.distancia_km} km ({t.tiempo_estimado_min} min)
                                        </td>
                                        <td className="p-3.5">
                                            <span
                                                className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${t.paciente?.estado === 'ATENDIDO'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                    }`}
                                            >
                                                {t.paciente?.estado || t.estado || 'PENDIENTE'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            {t.paciente?.id && t.paciente?.estado !== 'ATENDIDO' && (
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal Agregar/Editar Hospital */}
            {modal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl w-full space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                {editId ? 'Editar Hospital' : 'Registrar Nuevo Hospital'}
                            </h3>
                            <button
                                onClick={() => setModal(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
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

                        <form onSubmit={handleSubmitHospital} className="grid grid-cols-2 gap-3.5 text-xs">
                            <div className="col-span-2">
                                <label className="text-slate-300 block mb-1 font-semibold">Nombre del Hospital</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Hospital Central"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Nivel</label>
                                <select
                                    value={form.nivel}
                                    onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option>Nivel I</option>
                                    <option>Nivel II</option>
                                    <option>Nivel III</option>
                                    <option>Nivel IV</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Estado Operativo</label>
                                <select
                                    value={form.estado_operativo}
                                    onChange={(e) => setForm({ ...form, estado_operativo: e.target.value })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option>DISPONIBLE</option>
                                    <option>SATURADO</option>
                                    <option>COLAPSADO</option>
                                    <option>INACTIVO</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="text-slate-300 block mb-1 font-semibold">Dirección</label>
                                <input
                                    type="text"
                                    required
                                    value={form.direccion}
                                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Av. Principal, Sector Centro"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Latitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.latitud}
                                    onChange={(e) => setForm({ ...form, latitud: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Longitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.longitud}
                                    onChange={(e) => setForm({ ...form, longitud: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Camas UCI Totales</label>
                                <input
                                    type="number"
                                    value={form.camas_uci_totales}
                                    onChange={(e) => setForm({ ...form, camas_uci_totales: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Camas UCI Libres</label>
                                <input
                                    type="number"
                                    value={form.camas_uci_libres}
                                    onChange={(e) => setForm({ ...form, camas_uci_libres: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Urgencias Totales</label>
                                <input
                                    type="number"
                                    value={form.camas_urgencia_totales}
                                    onChange={(e) => setForm({ ...form, camas_urgencia_totales: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Urgencias Libres</label>
                                <input
                                    type="number"
                                    value={form.camas_urgencia_libres}
                                    onChange={(e) => setForm({ ...form, camas_urgencia_libres: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div className="col-span-2 flex justify-end gap-2.5 mt-4 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold cursor-pointer shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                                >
                                    Guardar Hospital
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}