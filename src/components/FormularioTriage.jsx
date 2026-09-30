import { useState } from 'react'
import API from '../services/api'
import { AlertCircle, CheckCircle2, Ambulance, Clock, MapPin, Building2, User, FileText, Zap } from 'lucide-react'

export function FormularioTriage({ onDerivacionExitosa }) {
    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        edad: 30,
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setCargando(true)
        setError(null)
        setResultado(null)

        try {
            const response = await API.post('/triage/evaluar', formData)
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
            label: 'Rojo (Emergencia Vital)',
            desc: 'Riesgo inminente de vida',
            activeColor: 'bg-rose-500/15 border-rose-500 text-rose-400 ring-2 ring-rose-500/30',
            idleColor: 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-rose-500/50'
        },
        {
            id: 'AMARILLO',
            label: 'Amarillo (Urgente)',
            desc: 'Atención prioritaria requerida',
            activeColor: 'bg-amber-500/15 border-amber-500 text-amber-400 ring-2 ring-amber-500/30',
            idleColor: 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-amber-500/50'
        },
        {
            id: 'VERDE',
            label: 'Verde (Leve)',
            desc: 'Atención estándar o ambulatoria',
            activeColor: 'bg-emerald-500/15 border-emerald-500 text-emerald-400 ring-2 ring-emerald-500/30',
            idleColor: 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-emerald-500/50'
        },
    ]

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/60">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
                        <Ambulance className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-white">Ingreso y Evaluación de Emergencia</h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Cálculo óptimo por algoritmo Haversine + modelo M/M/c de colas de urgencia
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección Paciente */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-400" /> Datos del Paciente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Cédula / Documento</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cedula}
                                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                                    placeholder="V-28123456"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Edad</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.edad}
                                    onChange={(e) => setFormData({ ...formData, edad: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección Triage */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" /> Clasificación de Gravedad (Triaje)
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

                    {/* Requerimientos clínicos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                        <label className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.requiere_uci}
                                onChange={(e) => setFormData({ ...formData, requiere_uci: e.target.checked })}
                                className="w-4 h-4 rounded accent-rose-600 bg-slate-800 border-slate-700 cursor-pointer"
                            />
                            <div>
                                <span className="text-xs font-bold text-white block">Requiere Cama UCI Vital</span>
                                <span className="text-[11px] text-slate-400">Filtrará hospitales con UCI disponible</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-slate-800/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.requiere_quirofano}
                                onChange={(e) => setFormData({ ...formData, requiere_quirofano: e.target.checked })}
                                className="w-4 h-4 rounded accent-amber-600 bg-slate-800 border-slate-700 cursor-pointer"
                            />
                            <div>
                                <span className="text-xs font-bold text-white block">Requiere Quirófano Inmediato</span>
                                <span className="text-[11px] text-slate-400">Prioridad para intervención quirúrgica</span>
                            </div>
                        </label>
                    </div>

                    {/* Síntomas */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" /> Síntomas / Diagnóstico Preliminar
                        </label>
                        <textarea
                            rows={3}
                            value={formData.sintomas}
                            onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
                            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                            placeholder="Ej: Politraumatismo severo, dolor torácico, dificultad respiratoria..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-rose-600/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {cargando ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Evaluando Red y Tiempo de Espera...
                            </span>
                        ) : (
                            'Calcular Hospital Óptimo y Derivar'
                        )}
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
                <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-slate-800 pb-3">
                        <CheckCircle2 className="w-5 h-5" />
                        Asignación Óptima Recomendada por el Algoritmo
                    </div>

                    <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/60 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-xl font-extrabold text-white">
                                    {resultado.destinoRecomendado?.hospital?.nombre}
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                    {resultado.destinoRecomendado?.hospital?.nivel} — {resultado.destinoRecomendado?.hospital?.direccion}
                                </p>
                            </div>

                            {resultado.destinoRecomendado?.score && (
                                <div className="self-start sm:self-auto bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                                    Score: {resultado.destinoRecomendado.score} pts
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center pt-2">
                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Distancia
                                </p>
                                <p className="text-base font-extrabold text-white font-mono">
                                    {resultado.destinoRecomendado?.distanciaKm} km
                                </p>
                            </div>

                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                                    <Ambulance className="w-3.5 h-3.5 text-amber-400" /> Traslado
                                </p>
                                <p className="text-base font-extrabold text-white font-mono">
                                    {resultado.destinoRecomendado?.tiempoTrasladoMin} min
                                </p>
                            </div>

                            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mb-1">
                                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Cola Urgencias
                                </p>
                                <p className="text-base font-extrabold text-white font-mono">
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