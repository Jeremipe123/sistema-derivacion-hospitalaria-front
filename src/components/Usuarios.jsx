import { useState, useEffect } from 'react'
import API from '../services/api'
import { Users, CheckCircle2, XCircle, Plus, AlertCircle, X, Edit3, Power } from 'lucide-react'

export function ModuloUsuarios({ darkMode }) {
    const [usuarios, setUsuarios] = useState([])
    const [modal, setModal] = useState(false)
    const [usuarioEditando, setUsuarioEditando] = useState(null)
    const [errores, setErrores] = useState([])

    const formInicial = {
        usuario: '',
        password: '',
        nombre: '',
        apellido: '',
        nacionalidad: 'V',
        cedula: '',
        telefono: '',
        correo: '',
        rol: 'evaluador',
        activo: true
    }

    const [form, setForm] = useState(formInicial)

    const cargarUsuarios = () => {
        API.get('/auth/usuarios')
            .then(res => setUsuarios(res.data))
            .catch(err => console.error('Error al cargar usuarios:', err))
    }

    useEffect(() => {
        cargarUsuarios()
    }, [])

    const handleNombreChange = (e) => setForm({ ...form, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })
    const handleApellidoChange = (e) => setForm({ ...form, apellido: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })
    const handleCedulaChange = (e) => setForm({ ...form, cedula: e.target.value.replace(/\D/g, '').slice(0, 8) })
    const handleTelefonoChange = (e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })

    const abrirEdicion = (u) => {
        setUsuarioEditando(u)
        const partesCedula = u.cedula ? u.cedula.split('-') : ['V', '']
        setForm({
            usuario: u.usuario,
            password: '', // Contraseña opcional al editar
            nombre: u.nombre,
            apellido: u.apellido,
            nacionalidad: partesCedula[0] || 'V',
            cedula: partesCedula[1] || '',
            telefono: u.telefono,
            correo: u.correo,
            rol: u.rol,
            activo: u.activo
        })
        setModal(true)
    }

    const cambiarEstadoUsuario = async (id, estadoActual) => {
        try {
            await API.patch(`/auth/usuarios/${id}/estado`, { activo: !estadoActual })
            cargarUsuarios()
        } catch (err) {
            alert('Error al cambiar el estado del usuario')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrores([])

        if (form.cedula.length < 5) {
            setErrores(['La cédula debe contener entre 5 y 8 dígitos.'])
            return
        }

        const payload = {
            ...form,
            cedula: `${form.nacionalidad}-${form.cedula}`
        }

        try {
            if (usuarioEditando) {
                await API.put(`/auth/usuarios/${usuarioEditando.id}`, payload)
            } else {
                await API.post('/auth/registro', payload)
            }
            setModal(false)
            setUsuarioEditando(null)
            setForm(formInicial)
            cargarUsuarios()
        } catch (err) {
            setErrores([err.response?.data?.error || 'Error al guardar el usuario.'])
        }
    }

    const getBadgeRol = (rol) => {
        switch (rol) {
            case 'admin': return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
            case 'coordinador': return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            case 'evaluador': default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
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
                        <Users className="w-5 h-5 text-blue-500" />
                        Gestión de Usuarios y Roles
                    </h2>
                    <p className={`text-xs mt-0.5 ${subTextColor}`}>Directorio de personal autorizado, permisos y estados</p>
                </div>
                <button
                    onClick={() => { setUsuarioEditando(null); setErrores([]); setForm(formInicial); setModal(true) }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Registrar Usuario
                </button>
            </div>

            <div className={`${cardBg} border rounded-2xl overflow-hidden shadow-xl`}>
                <div className="overflow-x-auto">
                    <table className={`w-full text-left text-xs sm:text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <thead className={`uppercase text-[11px] font-semibold ${tableHeaderBg}`}>
                            <tr>
                                <th className="p-3.5">Apellidos y Nombres</th>
                                <th className="p-3.5">Cédula</th>
                                <th className="p-3.5">Usuario / Correo</th>
                                <th className="p-3.5">Rol</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={`text-center py-8 font-medium ${subTextColor}`}>
                                        No hay usuarios registrados.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((u) => (
                                    <tr key={u.id} className={darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                                        <td className={`p-3.5 font-bold ${textColor}`}>{u.apellido}, {u.nombre}</td>
                                        <td className="p-3.5 font-mono">{u.cedula}</td>
                                        <td className="p-3.5">
                                            <span className={`block font-semibold ${textColor}`}>{u.usuario}</span>
                                            <span className={`block text-[11px] ${subTextColor}`}>{u.correo}</span>
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getBadgeRol(u.rol)}`}>
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${u.activo ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {u.activo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {u.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => abrirEdicion(u)}
                                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                                                title="Editar Usuario"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => cambiarEstadoUsuario(u.id, u.activo)}
                                                className={`p-1.5 rounded-lg cursor-pointer ${u.activo ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                                                title={u.activo ? 'Inactivar' : 'Activar'}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Registro / Edición */}
            {modal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className={`${cardBg} border p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl`}>
                        <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            <h3 className={`text-lg font-bold ${textColor}`}>
                                {usuarioEditando ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                            </h3>
                            <button onClick={() => setModal(false)} className={`p-1 rounded-lg cursor-pointer ${subTextColor}`}>
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
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={handleNombreChange}
                                    className={`w-full p-2.5 rounded-xl border ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Apellido</label>
                                <input
                                    type="text"
                                    required
                                    value={form.apellido}
                                    onChange={handleApellidoChange}
                                    className={`w-full p-2.5 rounded-xl border ${inputBg}`}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className={`block mb-1 font-semibold ${textColor}`}>Cédula</label>
                                <div className="flex gap-2">
                                    <select
                                        value={form.nacionalidad}
                                        onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })}
                                        className={`rounded-xl px-3 py-2.5 font-bold border ${inputBg}`}
                                    >
                                        <option value="V">V-</option>
                                        <option value="E">E-</option>
                                    </select>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        value={form.cedula}
                                        onChange={handleCedulaChange}
                                        maxLength={8}
                                        className={`w-full p-2.5 rounded-xl border font-mono ${inputBg}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Usuario</label>
                                <input
                                    type="text"
                                    required
                                    value={form.usuario}
                                    onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Contraseña {usuarioEditando && '(Opcional)'}</label>
                                <input
                                    type="password"
                                    required={!usuarioEditando}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border ${inputBg}`}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Teléfono</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    value={form.telefono}
                                    onChange={handleTelefonoChange}
                                    className={`w-full p-2.5 rounded-xl border font-mono ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Correo</label>
                                <input
                                    type="email"
                                    required
                                    value={form.correo}
                                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border ${inputBg}`}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className={`block mb-1 font-semibold ${textColor}`}>Rol</label>
                                <select
                                    value={form.rol}
                                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                                    className={`w-full p-2.5 rounded-xl border ${inputBg}`}
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="coordinador">Coordinador</option>
                                    <option value="evaluador">Evaluador</option>
                                </select>
                            </div>

                            <div className={`col-span-2 flex justify-end gap-2.5 mt-2 pt-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className={`px-4 py-2 rounded-xl font-semibold cursor-pointer ${subTextColor}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold cursor-pointer shadow-lg shadow-blue-600/30"
                                >
                                    {usuarioEditando ? 'Actualizar Cambios' : 'Guardar Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}