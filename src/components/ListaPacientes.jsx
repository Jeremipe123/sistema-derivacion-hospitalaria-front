import { useState } from 'react'
import API from '../services/api'
import { CheckCircle2, UserCheck } from 'lucide-react'

export function ListaPacientes({ pacientes = [], onUpdate }) {
    const [cargandoId, setCargandoId] = useState(null)

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            setCargandoId(id)
            await API.patch(`/pacientes/${id}/estado`, { estado: nuevoEstado })
            if (onUpdate) onUpdate()
        } catch (error) {
            console.error('Error al actualizar estado:', error)
        } finally {
            setCargandoId(null)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-400" />
                        Seguimiento de Pacientes y Derivaciones
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Control de atención y estado en tránsito</p>
                </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                        <thead className="bg-slate-800/50 uppercase text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3.5">Paciente</th>
                                <th className="p-3.5">Triaje</th>
                                <th className="p-3.5">Hospital Asignado</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {pacientes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">
                                        No hay pacientes registrados en el sistema.
                                    </td>
                                </tr>
                            ) : (
                                pacientes.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-3.5 font-semibold text-white">{p.nombre}</td>
                                        <td className="p-3.5">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.triage === 'ROJO'
                                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                                        : p.triage === 'AMARILLO'
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                    }`}
                                            >
                                                {p.triage}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-medium text-slate-200">{p.Hospital?.nombre || 'Sin Asignar'}</td>
                                        <td className="p-3.5">
                                            <span
                                                className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${p.estado === 'ATENDIDO'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                        : p.estado === 'EN_TRANSITO'
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                    }`}
                                            >
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right">
                                            {p.estado !== 'ATENDIDO' && (
                                                <button
                                                    disabled={cargandoId === p.id}
                                                    onClick={() => cambiarEstado(p.id, 'ATENDIDO')}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
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
            </div>
        </div>
    )
}