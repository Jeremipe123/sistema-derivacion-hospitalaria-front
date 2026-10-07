import { useState } from 'react'
import API from '../services/api'
import { Plus, Edit2, Power, AlertCircle, Building2, X } from 'lucide-react'

export function GestionHospitales({ hospitales = [], onUpdate, darkMode = true }) {
    const [modal, setModal] = useState(false)
    const [editId, setEditId] = useState(null)
    const [errores, setErrores] = useState([])

    const formInicial = {
        nombre: '',
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
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
            case 'SATURADO':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            case 'COLAPSADO':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/30'
            case 'INACTIVO':
            default:
                return 'bg-slate-500/10 text-slate-500 border-slate-500/30'
        }
    }

    const abrirModal = (h = null) => {
        setErrores([])
        if (h) {
            setEditId(h.id)
            setForm({
                nombre: h.nombre || '',
                direccion: h.direccion || '',
                latitud: h.latitud || 10.2469,
                longitud: h.longitud || -67.5958,
                camas_uci_totales: h.camas_uci_totales || 0,
                camas_uci_libres: h.camas_uci_libres || 0,
                camas_urgencia_totales: h.camas_urgencia_totales || 0,
                camas_urgencia_libres: h.camas_urgencia_libres || 0,
                estado_operativo: h.estado_operativo || 'DISPONIBLE'
            })
        } else {
            setEditId(null)
            setForm(formInicial)
        }
        setModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrores([])

        try {
            if (editId) {
                await API.put(`/hospitales/${editId}`, form)
            } else {
                await API.post('/hospitales', form)
            }
            setModal(false)
            if (onUpdate) onUpdate()
        } catch (err) {
            setErrores([err.response?.data?.error || 'Ocurrió un error al guardar en el servidor'])
        }
    }

    const toggleInactivar = async (h) => {
        try {
            const nuevoEstado = h.estado_operativo === 'INACTIVO' ? 'DISPONIBLE' : 'INACTIVO'
            await API.patch(`/hospitales/${h.id}/estado`, { estado_operativo: nuevoEstado })
            if (onUpdate) onUpdate()
        } catch (err) {
            console.error('Error al inactivar/activar hospital:', err)
        }
    }

    const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-xl'
    const textColor = darkMode ? 'text-white' : 'text-slate-900'
    const subTextColor = darkMode ? 'text-slate-400' : 'text-slate-600'
    const tableHeaderBg = darkMode ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-700'
    const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className={`flex items-center justify-between pb-2 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                <div>
                    <h2 className={`text-xl font-extrabold flex items-center gap-2 ${textColor}`}>
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Gestión de Centros Hospitalarios
                    </h2>
                    <p className={`text-xs mt-0.5 ${subTextColor}`}>Parametrización y control de disponibilidad de la red</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Agregar Hospital
                </button>
            </div>

            <div className={`${cardBg} border rounded-2xl overflow-hidden shadow-xl`}>
                <div className="overflow-x-auto">
                    <table className={`w-full text-left text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <thead className={`uppercase text-[11px] font-semibold ${tableHeaderBg}`}>
                            <tr>
                                <th className="p-3.5">Nombre</th>
                                <th className="p-3.5">Dirección</th>
                                <th className="p-3.5">UCI (Libres/Tot)</th>
                                <th className="p-3.5">Urgencia (Libres/Tot)</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                            {hospitales.map((h) => (
                                <tr key={h.id} className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                                    <td className={`p-3.5 font-semibold ${textColor}`}>{h.nombre}</td>
                                    <td className={`p-3.5 ${subTextColor}`}>{h.direccion}</td>
                                    <td className="p-3.5 font-mono">{h.camas_uci_libres} / {h.camas_uci_totales}</td>
                                    <td className="p-3.5 font-mono">{h.camas_urgencia_libres} / {h.camas_urgencia_totales}</td>
                                    <td className="p-3.5">
                                        <span
                                            className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getBadgeEstado(h.estado_operativo)}`}
                                        >
                                            {h.estado_operativo}
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-right space-x-1.5">
                                        <button
                                            onClick={() => abrirModal(h)}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                                }`}
                                            title="Editar Hospital"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => toggleInactivar(h)}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${h.estado_operativo === 'INACTIVO'
                                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30'
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

            {/* Modal Agregar / Editar Hospital Completo */}
            {modal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className={`${cardBg} border p-6 rounded-2xl max-w-xl w-full space-y-4 shadow-2xl`}>
                        <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            <h3 className={`text-lg font-bold ${textColor}`}>{editId ? 'Editar Hospital' : 'Registrar Nuevo Hospital'}</h3>
                            <button
                                onClick={() => setModal(false)}
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

                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 text-xs">
                            <div className="col-span-2">
                                <label className={`block mb-1 font-semibold ${textColor}`}>Nombre del Hospital</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                    placeholder="Hospital Central"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className={`block mb-1 font-semibold ${textColor}`}>Estado Operativo</label>
                                <select
                                    value={form.estado_operativo}
                                    onChange={(e) => setForm({ ...form, estado_operativo: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                >
                                    <option value="DISPONIBLE">DISPONIBLE (Verde)</option>
                                    <option value="SATURADO">SATURADO (Amarillo)</option>
                                    <option value="COLAPSADO">COLAPSADO (Rojo)</option>
                                    <option value="INACTIVO">INACTIVO (Gris)</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className={`block mb-1 font-semibold ${textColor}`}>Dirección</label>
                                <input
                                    type="text"
                                    required
                                    value={form.direccion}
                                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                    placeholder="Av. Principal, Sector Centro"
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Latitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.latitud}
                                    onChange={(e) => setForm({ ...form, latitud: parseFloat(e.target.value) || 0 })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Longitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.longitud}
                                    onChange={(e) => setForm({ ...form, longitud: parseFloat(e.target.value) || 0 })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Camas UCI Totales</label>
                                <input
                                    type="number"
                                    value={form.camas_uci_totales}
                                    onChange={(e) => setForm({ ...form, camas_uci_totales: parseInt(e.target.value) || 0 })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Camas UCI Libres</label>
                                <input
                                    type="number"
                                    value={form.camas_uci_libres}
                                    onChange={(e) => setForm({ ...form, camas_uci_libres: parseInt(e.target.value) || 0 })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Urgencias Totales</label>
                                <input
                                    type="number"
                                    value={form.camas_urgencia_totales}
                                    onChange={(e) => setForm({ ...form, camas_urgencia_totales: parseInt(e.target.value) || 0 })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Urgencias Libres</label>
                                <input
                                    type="number"
                                    value={form.camas_urgencia_libres}
                                    onChange={(e) => setForm({ ...form, camas_urgencia_libres: parseInt(e.target.value) || 0 })}
                                    className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-blue-500 font-mono ${inputBg}`}
                                />
                            </div>

                            <div className={`col-span-2 flex justify-end gap-2.5 mt-4 pt-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                        }`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold cursor-pointer shadow-lg shadow-blue-600/30 transition-all active:scale-95"
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