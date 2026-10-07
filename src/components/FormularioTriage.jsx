import { useState } from 'react'
import API from '../services/api'
import { AlertCircle, CheckCircle2, Ambulance, Clock, MapPin, Building2, User, FileText, Zap } from 'lucide-react'

export function FormularioTriage({ onDerivacionExitosa, darkMode = true }) {
    const [formData, setFormData] = useState({
        nacionalidad: 'V',
        cedula: '',
        nombre: '',
        edad: 30,
        tipo_sangre: '',
        triage: 'ROJO',
        sintomas: '',
        requiere_uci: false,
        requiere_quirofano: false,
        latitud: 10.2469,
        longitud: -67.5958,
    })

    const [cargando, setCargando] = useState(false)
    const [resultado, setResultado] = useState(null)
    const [error, setError] = useState(null)

    // Solo números y máximo 8 dígitos
    const handleCedulaChange = (e) => {
        const num = e.target.value.replace(/\D/g, '').slice(0, 8)
        setFormData({ ...formData, cedula: num })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.cedula.length < 5) {
            setError('La cédula debe contener al menos 5 dígitos.')
            return
        }

        setCargando(true)
        setError(null)
        setResultado(null)

        // Concatenación de nacionalidad y número de cédula (ej. V-28123456)
        const payload = {
            ...formData,
            cedula: `${formData.nacionalidad}-${formData.cedula}`
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
        {
            id: 'ROJO',
            label: 'Alta (Emergencia Vital)',
            desc: 'Riesgo inminente de vida',
            activeColor: 'bg-rose-500/15 border-rose-500 text-rose-500 ring-2 ring-rose-500/30',
            idleColor: darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
        },
        {
            id: 'AMARILLO',
            label: 'Media (Urgente)',
            desc: 'Atención prioritaria requerida',
            activeColor: 'bg-amber-500/15 border-amber-500 text-amber-500 ring-2 ring-amber-500/30',
            idleColor: darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
        },
        {
            id: 'VERDE',
            label: 'Baja (Leve)',
            desc: 'Atención estándar o ambulatoria',
            activeColor: 'bg-emerald-500/15 border-emerald-500 text-emerald-500 ring-2 ring-emerald-500/30',
            idleColor: darkMode ? 'bg-slate-800/40 border-slate-700/60 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
        },
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
                        <h2 className={`text-xl font-extrabold ${textColor}`}>Ingreso y Evaluación de Emergencia</h2>
                        <p className={`text-xs mt-0.5 ${subTextColor}`}>
                            Cálculo óptimo por algoritmo de asignación hospitalaria en tiempo real
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos del Paciente */}
                    <div className="space-y-3">
                        <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${subTextColor}`}>
                            <User className="w-3.5 h-3.5 text-blue-500" /> Datos del Paciente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Cédula V / E y Número */}
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
                                        required
                                        value={formData.cedula}
                                        onChange={handleCedulaChange}
                                        maxLength={8}
                                        className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                        placeholder="28123456"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>Edad</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.edad}
                                    onChange={(e) => setFormData({ ...formData, edad: parseInt(e.target.value) || 0 })}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-mono border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={`block text-xs font-semibold mb-1 ${textColor}`}>
                                    Tipo de Sangre <span className={`font-normal ${subTextColor}`}>(Opcional)</span>
                                </label>
                                <select
                                    value={formData.tipo_sangre}
                                    onChange={(e) => setFormData({ ...formData, tipo_sangre: e.target.value })}
                                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-blue-500 ${inputBg}`}
                                >
                                    <option value="">Desconocido / No especificado</option>
                                    <option value="O+">O Rh Positivo (O+)</option>
                                    <option value="O-">O Rh Negativo (O-)</option>
                                    <option value="A+">A Rh Positivo (A+)</option>
                                    <option value="A-">A Rh Negativo (A-)</option>
                                    <option value="B+">B Rh Positivo (B+)</option>
                                    <option value="B-">B Rh Negativo (B-)</option>
                                    <option value="AB+">AB Rh Positivo (AB+)</option>
                                    <option value="AB-">AB Rh Negativo (AB-)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Clasificación de Gravedad (Triaje) */}
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
                                        className={`p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer ${isSelected ? item.activeColor : item.idleColor
                                            }`}
                                    >
                                        <div className="font-bold text-xs sm:text-sm">{item.label}</div>
                                        <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Requerimientos Clínicos */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'
                        }`}>
                        <label className={`flex items-center gap-3 cursor-pointer p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'
                            }`}>
                            <input
                                type="checkbox"
                                checked={formData.requiere_uci}
                                onChange={(e) => setFormData({ ...formData, requiere_uci: e.target.checked })}
                                className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
                            />
                            <div>
                                <span className={`text-xs font-bold block ${textColor}`}>Requiere Cama UCI Vital</span>
                                <span className={`text-[11px] ${subTextColor}`}>Filtrará hospitales con camas UCI disponibles</span>
                            </div>
                        </label>

                        <label className={`flex items-center gap-3 cursor-pointer p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100'
                            }`}>
                            <input
                                type="checkbox"
                                checked={formData.requiere_quirofano}
                                onChange={(e) => setFormData({ ...formData, requiere_quirofano: e.target.checked })}
                                className="w-4 h-4 rounded accent-amber-600 cursor-pointer"
                            />
                            <div>
                                <span className={`text-xs font-bold block ${textColor}`}>Requiere Quirófano Inmediato</span>
                                <span className={`text-[11px] ${subTextColor}`}>Prioridad para intervención quirúrgica</span>
                            </div>
                        </label>
                    </div>

                    {/* Síntomas */}
                    <div>
                        <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${subTextColor}`}>
                            <FileText className="w-3.5 h-3.5 text-emerald-500" /> Síntomas / Diagnóstico Preliminar
                        </label>
                        <textarea
                            rows={3}
                            value={formData.sintomas}
                            onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
                            className={`w-full rounded-xl p-3 text-sm border focus:outline-none focus:border-blue-500 ${inputBg}`}
                            placeholder="Ej: Politraumatismo severo, dolor torácico, dificultad respiratoria..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-rose-600/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

                    <div className={`rounded-xl p-5 border space-y-4 ${darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                        }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className={`text-xl font-extrabold ${textColor}`}>
                                    {resultado.destinoRecomendado?.hospital?.nombre}
                                </h3>
                                <p className={`text-xs mt-1 flex items-center gap-1.5 ${subTextColor}`}>
                                    <Building2 className="w-4 h-4" />
                                    {resultado.destinoRecomendado?.hospital?.direccion}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center pt-2">
                            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <p className={`text-[11px] flex items-center justify-center gap-1 mb-1 ${subTextColor}`}>
                                    <MapPin className="w-3.5 h-3.5 text-blue-500" /> Distancia
                                </p>
                                <p className={`text-base font-extrabold font-mono ${textColor}`}>
                                    {resultado.destinoRecomendado?.distanciaKm} km
                                </p>
                            </div>

                            <div className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <p className={`text-[11px] flex items-center justify-center gap-1 mb-1 ${subTextColor}`}>
                                    <Ambulance className="w-3.5 h-3.5 text-amber-500" /> Traslado
                                </p>
                                <p className={`text-base font-extrabold font-mono ${textColor}`}>
                                    {resultado.destinoRecomendado?.tiempoTrasladoMin} min
                                </p>
                            </div>

                            <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <p className={`text-[11px] flex items-center justify-center gap-1 mb-1 ${subTextColor}`}>
                                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> Cola Urgencias
                                </p>
                                <p className={`text-base font-extrabold font-mono ${textColor}`}>
                                    ~{resultado.destinoRecomendado?.tiempoEsperaMin} min
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}