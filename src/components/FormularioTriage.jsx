import { useState } from 'react'
import API from '../services/api'
import { AlertCircle, CheckCircle2, Ambulance, Building2, User, FileText, Zap, Phone, Eye } from 'lucide-react'

export function FormularioTriage({ onDerivacionExitosa, darkMode = true }) {
    const [formData, setFormData] = useState({
        sin_cedula: false,
        nacionalidad: 'V',
        cedula: '',
        nombre: '',
        edad: 30,
        tipo_sangre: 'O+',
        triage: 'ROJO',
        sintomas: '',
        contextura: '',
        estatura_aprox_cm: '',
        tono_piel: '',
        color_ojos: '',
        color_cabello: '',
        tipo_cabello: '',
        senias_particulares: '',
        vestimenta_descripcion: '',
        telefono: '',
        requiere_uci: false,
        requiere_quirofano: false,
        latitud: 10.2469,
        longitud: -67.5958,
    })

    const [cargando, setCargando] = useState(false)
    const [resultado, setResultado] = useState(null)
    const [error, setError] = useState(null)

    // Handlers con sanitización y formato estricto
    const handleCedulaChange = (e) => {
        const num = e.target.value.replace(/\D/g, '').slice(0, 8)
        setFormData((prev) => ({ ...prev, cedula: num }))
    }

    const handleNombreChange = (e) => {
        const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
        setFormData((prev) => ({ ...prev, nombre: soloLetras }))
    }

    const handleTelefonoChange = (e) => {
        const num = e.target.value.replace(/\D/g, '').slice(0, 11)
        setFormData((prev) => ({ ...prev, telefono: num }))
    }

    const handleEstaturaChange = (e) => {
        const num = e.target.value.replace(/\D/g, '').slice(0, 3)
        if (num === '') {
            setFormData((prev) => ({ ...prev, estatura_aprox_cm: '' }))
            return
        }
        const val = Math.min(Math.max(parseInt(num, 10), 0), 250)
        setFormData((prev) => ({ ...prev, estatura_aprox_cm: val }))
    }

    const handleEdadChange = (e) => {
        const value = e.target.value
        if (value === '') {
            setFormData((prev) => ({ ...prev, edad: '' }))
            return
        }
        const parsed = parseInt(value, 10)
        if (!isNaN(parsed)) {
            const edadClamp = Math.min(Math.max(parsed, 0), 120)
            setFormData((prev) => ({ ...prev, edad: edadClamp }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.sin_cedula && formData.cedula.length < 5) {
            setError('La cédula debe contener entre 5 y 8 dígitos, o active la opción de paciente sin documento.')
            return
        }

        if (formData.telefono && formData.telefono.length < 10) {
            setError('El número telefónico debe contener un formato válido (ej. 04121234567).')
            return
        }

        setCargando(true)
        setError(null)
        setResultado(null)

        const payload = {
            ...formData,
            cedula: formData.sin_cedula ? null : `${formData.nacionalidad}-${formData.cedula}`
        }

        try {
            const response = await API.post('/triage/evaluar', payload)
            setResultado(response.data)
            if (onDerivacionExitosa) onDerivacionExitosa()
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar la derivación.')
        } finally {
            setCargando(false)
        }
    }

    const triageOptions = [
        { id: 'ROJO', label: 'Alta (Emergencia Vital)', desc: 'Riesgo inminente de vida', activeColor: 'bg-rose-500/15 border-rose-500 text-rose-500 ring-2 ring-rose-500/30', idleColor: darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600' },
        { id: 'AMARILLO', label: 'Media (Urgente)', desc: 'Atención prioritaria requerida', activeColor: 'bg-amber-500/15 border-amber-500 text-amber-500 ring-2 ring-amber-500/30', idleColor: darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600' },
        { id: 'VERDE', label: 'Baja (Leve)', desc: 'Atención estándar o ambulatoria', activeColor: 'bg-emerald-500/15 border-emerald-500 text-emerald-500 ring-2 ring-emerald-500/30', idleColor: darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600' },
    ]

    const cardBg = darkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white border-slate-200 shadow-xl'
    const textColor = darkMode ? 'text-white' : 'text-slate-900'
    const subTextColor = darkMode ? 'text-slate-400' : 'text-slate-600'
    const inputBg = darkMode ? 'bg-slate-800/80 border-slate-700/80 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className={`${cardBg} border rounded-2xl p-6 sm:p-8 shadow-xl`}>
                <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
                        <Ambulance className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-extrabold ${textColor}`}>Ingreso y Evaluación de Emergencia (Triaje)</h2>
                        <p className={`text-xs mt-0.5 ${subTextColor}`}>Evaluación automatizada y asignación hospitalaria en tiempo real</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50 border-amber-200'}`}>
                        <input
                            type="checkbox"
                            id="sin_cedula"
                            checked={formData.sin_cedula}
                            onChange={(e) => setFormData({ ...formData, sin_cedula: e.target.checked })}
                            className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                        />
                        <label htmlFor="sin_cedula" className={`text-xs font-bold cursor-pointer ${textColor}`}>
                            Paciente sin documento de identidad registrado (Ingreso por emergencia / rescate)
                        </label>
                    </div>

                    {/* Datos del Paciente */}
                    <div className="space-y-3">
                        <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${subTextColor}`}>
                            <User className="w-3.5 h-3.5 text-blue-500" /> Datos Principales de Identificación
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {!formData.sin_cedula && (
                                <div className="md:col-span-2">
                                    <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Cédula / Documento</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.nacionalidad}
                                            onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                                            className={`rounded-xl px-3 py-2.5 text-sm font-bold border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                        >
                                            <option value="V">V-</option>
                                            <option value="E">E-</option>
                                        </select>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            required={!formData.sin_cedula}
                                            value={formData.cedula}
                                            onChange={handleCedulaChange}
                                            maxLength={8}
                                            className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                            placeholder="28123456"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={formData.sin_cedula ? 'md:col-span-2' : ''}>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={handleNombreChange}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                    placeholder={formData.sin_cedula ? "Ej: Paciente Ingreso Urgencias" : "Juan Pérez"}
                                />
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Edad Aprox (Años)</label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    max={120}
                                    value={formData.edad}
                                    onChange={handleEdadChange}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Tipo de Sangre</label>
                                <select
                                    value={formData.tipo_sangre}
                                    onChange={(e) => setFormData({ ...formData, tipo_sangre: e.target.value })}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-blue-500 cursor-pointer ${inputBg}`}
                                >
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>
                                    Teléfono de Contacto <span className={`font-normal ${subTextColor}`}>(Opcional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.telefono}
                                        onChange={handleTelefonoChange}
                                        maxLength={11}
                                        className={`w-full rounded-xl px-3.5 py-2.5 pl-9 text-sm font-mono border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                        placeholder="04121234567"
                                    />
                                    <Phone className={`w-4 h-4 absolute left-3 top-3 ${subTextColor}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Características Somáticas con Selectores predefinidos */}
                    <div className="space-y-3 pt-2">
                        <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${subTextColor}`}>
                            <Eye className="w-3.5 h-3.5 text-indigo-500" /> Características Somáticas y de Rescate
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            {/* Contextura */}
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Contextura</label>
                                <select
                                    value={formData.contextura}
                                    onChange={(e) => setFormData({ ...formData, contextura: e.target.value })}
                                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-blue-500 cursor-pointer ${inputBg}`}
                                >
                                    <option value="">No especificada</option>
                                    <option value="Delgada">Delgada</option>
                                    <option value="Media / Atlética">Media / Atlética</option>
                                    <option value="Robusta / Obesa">Robusta / Obesa</option>
                                </select>
                            </div>

                            {/* Estatura */}
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Estatura Aprox (cm)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Ej. 175"
                                    value={formData.estatura_aprox_cm}
                                    onChange={handleEstaturaChange}
                                    className={`w-full rounded-xl p-2.5 border font-mono focus:outline-none focus:border-blue-500 ${inputBg}`}
                                />
                            </div>

                            {/* Tono de Piel */}
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Tono de Piel</label>
                                <select
                                    value={formData.tono_piel}
                                    onChange={(e) => setFormData({ ...formData, tono_piel: e.target.value })}
                                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-blue-500 cursor-pointer ${inputBg}`}
                                >
                                    <option value="">No especificado</option>
                                    <option value="Clara">Clara</option>
                                    <option value="Trigueña / Morena">Trigueña / Morena</option>
                                    <option value="Oscura">Oscura</option>
                                    <option value="Albina">Albina</option>
                                </select>
                            </div>

                            {/* Color de Ojos */}
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Color de Ojos</label>
                                <select
                                    value={formData.color_ojos}
                                    onChange={(e) => setFormData({ ...formData, color_ojos: e.target.value })}
                                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-blue-500 cursor-pointer ${inputBg}`}
                                >
                                    <option value="">No especificado</option>
                                    <option value="Marrón / Café">Marrón / Café</option>
                                    <option value="Negro">Negro</option>
                                    <option value="Verde">Verde</option>
                                    <option value="Azul">Azul</option>
                                    <option value="Gris">Gris</option>
                                </select>
                            </div>

                            {/* Color de Cabello */}
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Color de Cabello</label>
                                <select
                                    value={formData.color_cabello}
                                    onChange={(e) => setFormData({ ...formData, color_cabello: e.target.value })}
                                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-blue-500 cursor-pointer ${inputBg}`}
                                >
                                    <option value="">No especificado</option>
                                    <option value="Negro">Negro</option>
                                    <option value="Castaño">Castaño</option>
                                    <option value="Rubio">Rubio</option>
                                    <option value="Pelirrojo">Pelirrojo</option>
                                    <option value="Cano / Canoso">Cano / Canoso</option>
                                    <option value="Calvo">Calvo</option>
                                </select>
                            </div>

                            {/* Tipo de Cabello */}
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Tipo de Cabello</label>
                                <select
                                    value={formData.tipo_cabello}
                                    onChange={(e) => setFormData({ ...formData, tipo_cabello: e.target.value })}
                                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-blue-500 cursor-pointer ${inputBg}`}
                                >
                                    <option value="">No especificado</option>
                                    <option value="Liso">Liso</option>
                                    <option value="Ondulado">Ondulado</option>
                                    <option value="Rizado / Crespo">Rizado / Crespo</option>
                                    <option value="Afrodita / Rizo Apretado">Afrodita / Rizo Apretado</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Señas Particulares / Tatuajes</label>
                                <input
                                    type="text"
                                    placeholder="Cicatrices, tatuajes en brazo derecho, etc."
                                    value={formData.senias_particulares}
                                    onChange={(e) => setFormData({ ...formData, senias_particulares: e.target.value })}
                                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-1 font-semibold ${textColor}`}>Descripción de Vestimenta</label>
                                <input
                                    type="text"
                                    placeholder="Camiseta azul, jeans negros, calzado deportivo..."
                                    value={formData.vestimenta_descripcion}
                                    onChange={(e) => setFormData({ ...formData, vestimenta_descripcion: e.target.value })}
                                    className={`w-full rounded-xl p-2.5 border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Clasificación de Gravedad */}
                    <div className="space-y-3">
                        <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${subTextColor}`}>
                            <Zap className="w-3.5 h-3.5 text-amber-500" /> Clasificación de Gravedad (Triaje)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {triageOptions.map((item) => {
                                const isSelected = formData.triage === item.id
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, triage: item.id })}
                                        className={`p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer ${isSelected ? item.activeColor : item.idleColor}`}
                                    >
                                        <div className="font-bold text-xs sm:text-sm">{item.label}</div>
                                        <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Síntomas y Diagnóstico */}
                    <div>
                        <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${subTextColor}`}>
                            <FileText className="w-3.5 h-3.5 text-emerald-500" /> Síntomas / Diagnóstico Preliminar
                        </label>
                        <textarea
                            rows={3}
                            value={formData.sintomas}
                            onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
                            className={`w-full rounded-xl p-3 text-sm border focus:outline-none focus:border-blue-500 ${inputBg}`}
                            placeholder="Ej: Politraumatismo severo, dificultad respiratoria..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-rose-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                        {cargando ? 'Evaluando Red y Tiempo de Espera...' : 'Calcular el hospital más óptimo'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 text-rose-200 flex items-center gap-3 shadow-lg">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="text-xs font-semibold">{error}</span>
                </div>
            )}

            {resultado && (
                <div className={`${cardBg} border border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl`}>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-base border-b border-slate-700/50 pb-3">
                        <CheckCircle2 className="w-5 h-5" />
                        Asignación Óptima Recomendada
                    </div>

                    <div className={`rounded-xl p-5 border space-y-4 ${darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                            <h3 className={`text-xl font-extrabold ${textColor}`}>
                                {resultado.destinoRecomendado?.hospital?.nombre}
                            </h3>
                            <p className={`text-xs mt-1 flex items-center gap-1.5 ${subTextColor}`}>
                                <Building2 className="w-4 h-4" /> {resultado.destinoRecomendado?.hospital?.direccion}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}