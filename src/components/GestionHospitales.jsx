/* eslint-disable no-unused-vars */
import { useState } from 'react'
import API from '../services/api'
import { hospitalSchema } from '../schemas/hospital.schema'
import { Plus, Edit2, Power, AlertCircle, Building2, X } from 'lucide-react'

export function GestionHospitales({ hospitales = [], onUpdate }) {
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

    const handleSubmit = async (e) => {
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
            setErrores(['Ocurrió un error al guardar en el servidor'])
        }
    }

    const toggleInactivar = async (h) => {
        const nuevoEstado = h.estado_operativo === 'INACTIVO' ? 'DISPONIBLE' : 'INACTIVO'
        await API.patch(`/hospitales/${h.id}/estado`, { estado_operativo: nuevoEstado })
        if (onUpdate) onUpdate()
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        Gestión de Centros Hospitalarios
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Mantenimiento de disponibilidad y estatus operativo</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Agregar Hospital
                </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                        <thead className="bg-slate-800/50 uppercase text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3.5">Nombre</th>
                                <th className="p-3.5">Nivel</th>
                                <th className="p-3.5">UCI (Libres/Tot)</th>
                                <th className="p-3.5">Urgencia (Libres/Tot)</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {hospitales.map((h) => (
                                <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-3.5 font-semibold text-white">{h.nombre}</td>
                                    <td className="p-3.5">{h.nivel}</td>
                                    <td className="p-3.5 font-mono">{h.camas_uci_libres} / {h.camas_uci_totales}</td>
                                    <td className="p-3.5 font-mono">{h.camas_urgencia_libres} / {h.camas_urgencia_totales}</td>
                                    <td className="p-3.5">
                                        <span
                                            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${h.estado_operativo === 'INACTIVO'
                                                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                }`}
                                        >
                                            {h.estado_operativo}
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-right space-x-1.5">
                                        <button
                                            onClick={() => abrirModal(h)}
                                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => toggleInactivar(h)}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${h.estado_operativo === 'INACTIVO'
                                                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-500/30'
                                                }`}
                                            title={h.estado_operativo === 'INACTIVO' ? 'Activar' : 'Inactivar'}
                                        >
                                            <Power className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="text-lg font-bold text-white">{editId ? 'Editar Hospital' : 'Nuevo Hospital'}</h3>
                            <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {errores.length > 0 && (
                            <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-xl text-rose-200 text-xs space-y-1">
                                {errores.map((e, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> {e}
                                    </div>
                                ))}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <label className="text-slate-300 block mb-1 font-semibold">Nombre</label>
                                <input
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Nivel</label>
                                <select
                                    value={form.nivel}
                                    onChange={(e) => setForm({ ...form, nivel: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option>Nivel I</option>
                                    <option>Nivel II</option>
                                    <option>Nivel III</option>
                                    <option>Nivel IV</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Estado</label>
                                <select
                                    value={form.estado_operativo}
                                    onChange={(e) => setForm({ ...form, estado_operativo: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
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
                                    value={form.direccion}
                                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Latitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.latitud}
                                    onChange={(e) => setForm({ ...form, latitud: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Longitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.longitud}
                                    onChange={(e) => setForm({ ...form, longitud: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Camas UCI Totales</label>
                                <input
                                    type="number"
                                    value={form.camas_uci_totales}
                                    onChange={(e) => setForm({ ...form, camas_uci_totales: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Camas UCI Libres</label>
                                <input
                                    type="number"
                                    value={form.camas_uci_libres}
                                    onChange={(e) => setForm({ ...form, camas_uci_libres: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Urgencias Totales</label>
                                <input
                                    type="number"
                                    value={form.camas_urgencia_totales}
                                    onChange={(e) => setForm({ ...form, camas_urgencia_totales: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-slate-300 block mb-1 font-semibold">Urgencias Libres</label>
                                <input
                                    type="number"
                                    value={form.camas_urgencia_libres}
                                    onChange={(e) => setForm({ ...form, camas_urgencia_libres: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold cursor-pointer shadow-lg shadow-blue-600/30"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}